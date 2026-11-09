<?php
/**
 * Plugin Name: Nexora Netlify Rebuild
 * Description: Rebuilds the Nexora Astro site when published Projects or Events change.
 * Version: 1.0.0
 * Author: Lembayu Studio
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class Nexora_Netlify_Rebuild {
    private const HOOK_OPTION = 'nexora_netlify_build_hook';
    private const LAST_OPTION = 'nexora_netlify_last_result';
    private static $pending = false;

    public static function init() {
        // Runs after WordPress has handled the post and its standard meta/terms.
        add_action( 'wp_after_insert_post', array( __CLASS__, 'on_post_saved' ), 99, 4 );

        // ACF saves submitted custom fields before this priority.
        add_action( 'acf/save_post', array( __CLASS__, 'on_acf_saved' ), 20, 1 );

        // Also covers scheduled publishing and status changes.
        add_action( 'transition_post_status', array( __CLASS__, 'on_status_transition' ), 99, 3 );
        add_action( 'before_delete_post', array( __CLASS__, 'on_post_deleted' ), 10, 2 );

        // One request per PHP save request, after all post/ACF REST handlers finish.
        add_action( 'shutdown', array( __CLASS__, 'on_shutdown' ), 999 );

        add_action( 'admin_menu', array( __CLASS__, 'add_settings_page' ) );
        add_action( 'admin_post_nexora_rebuild_save', array( __CLASS__, 'save_settings' ) );
        add_action( 'admin_post_nexora_rebuild_test', array( __CLASS__, 'send_test' ) );
    }

    private static function is_target( $post ) {
        return $post instanceof WP_Post
            && in_array( $post->post_type, array( 'project', 'event' ), true )
            && ! wp_is_post_revision( $post->ID )
            && ! wp_is_post_autosave( $post->ID );
    }

    public static function on_post_saved( $post_id, $post, $update, $post_before ) {
        if ( ! self::is_target( $post ) ) {
            return;
        }
        $was_published = $post_before instanceof WP_Post && 'publish' === $post_before->post_status;
        if ( 'publish' === $post->post_status || $was_published ) {
            self::$pending = true;
        }
    }

    public static function on_acf_saved( $post_id ) {
        if ( ! is_numeric( $post_id ) || (string) (int) $post_id !== (string) $post_id ) {
            return;
        }
        $post = get_post( (int) $post_id );
        if ( self::is_target( $post ) && 'publish' === $post->post_status ) {
            self::$pending = true;
        }
    }

    public static function on_status_transition( $new_status, $old_status, $post ) {
        if ( self::is_target( $post )
            && $new_status !== $old_status
            && ( 'publish' === $new_status || 'publish' === $old_status ) ) {
            self::$pending = true;
        }
    }

    public static function on_post_deleted( $post_id, $post ) {
        if ( self::is_target( $post ) && 'publish' === $post->post_status ) {
            self::$pending = true;
        }
    }

    public static function on_shutdown() {
        if ( ! self::$pending ) {
            return;
        }
        self::$pending = false;
        self::request_rebuild( 'content_update' );
    }

    private static function valid_hook_url( $url ) {
        if ( ! is_string( $url ) || '' === $url ) {
            return false;
        }
        $parts = wp_parse_url( $url );
        return is_array( $parts )
            && isset( $parts['scheme'], $parts['host'], $parts['path'] )
            && 'https' === strtolower( $parts['scheme'] )
            && 'api.netlify.com' === strtolower( $parts['host'] )
            && (bool) preg_match( '~^/build_hooks/[A-Za-z0-9_-]+/?$~', $parts['path'] )
            && ! isset( $parts['user'] )
            && ! isset( $parts['pass'] )
            && ! isset( $parts['query'] )
            && ! isset( $parts['fragment'] )
            && ! isset( $parts['port'] );
    }

    private static function request_rebuild( $source ) {
        $url = get_option( self::HOOK_OPTION, '' );
        if ( ! self::valid_hook_url( $url ) ) {
            return false;
        }
        $response = wp_safe_remote_post(
            $url,
            array(
                'timeout'             => 8,
                'redirection'         => 0,
                'blocking'            => true,
                'sslverify'           => true,
                'reject_unsafe_urls'  => true,
                'headers'             => array( 'Content-Type' => 'application/json' ),
                'body'                => '{}',
            )
        );

        $http_code = is_wp_error( $response ) ? 0 : (int) wp_remote_retrieve_response_code( $response );
        $ok = ! is_wp_error( $response ) && $http_code >= 200 && $http_code < 300;

        // Store only a result code. Never store or display the secret URL in the log.
        update_option(
            self::LAST_OPTION,
            array(
                'time'   => time(),
                'source' => $source,
                'ok'     => $ok,
                'code'   => $http_code,
            ),
            false
        );
        return $ok;
    }

    public static function add_settings_page() {
        add_options_page(
            'Nexora Rebuild',
            'Nexora Rebuild',
            'manage_options',
            'nexora-rebuild',
            array( __CLASS__, 'render_settings_page' )
        );
    }

    private static function redirect_notice( $notice ) {
        wp_safe_redirect(
            add_query_arg(
                array( 'page' => 'nexora-rebuild', 'nexora_notice' => $notice ),
                admin_url( 'options-general.php' )
            )
        );
        exit;
    }

    public static function save_settings() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Not authorized.', 'nexora-netlify-rebuild' ) );
        }
        check_admin_referer( 'nexora_rebuild_save' );

        if ( isset( $_POST['nexora_clear_hook'] ) && '1' === sanitize_text_field( wp_unslash( $_POST['nexora_clear_hook'] ) ) ) {
            delete_option( self::HOOK_OPTION );
            self::redirect_notice( 'cleared' );
        }

        $input = isset( $_POST['nexora_hook'] ) && is_string( $_POST['nexora_hook'] )
            ? trim( wp_unslash( $_POST['nexora_hook'] ) )
            : '';

        if ( '' === $input ) {
            self::redirect_notice( 'unchanged' );
        }
        if ( ! self::valid_hook_url( $input ) ) {
            self::redirect_notice( 'invalid' );
        }

        update_option( self::HOOK_OPTION, esc_url_raw( $input ), false );
        self::redirect_notice( 'saved' );
    }

    public static function send_test() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Not authorized.', 'nexora-netlify-rebuild' ) );
        }
        check_admin_referer( 'nexora_rebuild_test' );
        self::redirect_notice( self::request_rebuild( 'manual_test' ) ? 'test_ok' : 'test_failed' );
    }

    public static function render_settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }
        $configured = self::valid_hook_url( get_option( self::HOOK_OPTION, '' ) );
        $last = get_option( self::LAST_OPTION, array() );
        $notice = isset( $_GET['nexora_notice'] ) && is_string( $_GET['nexora_notice'] )
            ? sanitize_key( wp_unslash( $_GET['nexora_notice'] ) )
            : '';
        $messages = array(
            'saved'       => 'Build hook saved securely in WordPress.',
            'unchanged'   => 'No changes made. The existing build hook was kept.',
            'cleared'     => 'Build hook removed. Automatic rebuilds are now off.',
            'invalid'     => 'Invalid URL. Paste the original https://api.netlify.com/build_hooks/... URL with no extra query parameters.',
            'test_ok'     => 'Netlify accepted the test request. Check Netlify Deploys for the new build.',
            'test_failed' => 'Netlify did not accept the request. Confirm the hook URL and that your hosting can reach Netlify.',
        );
        ?>
        <div class="wrap">
            <h1>Nexora &rarr; Netlify Rebuild</h1>
            <p>Trigger a new Astro build when published <strong>Projects</strong> or <strong>Events</strong> change.</p>
            <?php if ( isset( $messages[ $notice ] ) ) : ?>
                <div class="notice <?php echo in_array( $notice, array( 'invalid', 'test_failed' ), true ) ? 'notice-error' : 'notice-success'; ?> is-dismissible">
                    <p><?php echo esc_html( $messages[ $notice ] ); ?></p>
                </div>
            <?php endif; ?>
            <form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
                <input type="hidden" name="action" value="nexora_rebuild_save">
                <?php wp_nonce_field( 'nexora_rebuild_save' ); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">Netlify build hook</th>
                        <td>
                            <input type="password" name="nexora_hook" value="" class="regular-text" autocomplete="new-password"
                                placeholder="<?php echo $configured ? 'Saved — leave blank to keep current URL' : 'https://api.netlify.com/build_hooks/…'; ?>"
                                aria-label="Netlify build hook URL">
                            <p class="description">Create a Build Hook in Netlify for branch <code>feat/astro-v1</code>. Paste it here once; it is never printed back on this screen.</p>
                            <p><strong>Status:</strong> <?php echo $configured ? 'Configured' : 'Not configured'; ?></p>
                            <?php if ( $configured ) : ?>
                                <label><input type="checkbox" name="nexora_clear_hook" value="1"> Remove saved hook and disable automatic rebuilds</label>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
                <?php submit_button( 'Save build hook' ); ?>
            </form>
            <hr>
            <h2>Test connection</h2>
            <p>A test sends one rebuild request. No content is changed in WordPress.</p>
            <?php if ( $configured ) : ?>
                <form action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
                    <input type="hidden" name="action" value="nexora_rebuild_test">
                    <?php wp_nonce_field( 'nexora_rebuild_test' ); ?>
                    <?php submit_button( 'Send test rebuild', 'secondary', 'submit', false ); ?>
                </form>
            <?php else : ?>
                <p>Save a valid Netlify hook first.</p>
            <?php endif; ?>
            <h2>Last request</h2>
            <?php if ( is_array( $last ) && ! empty( $last['time'] ) ) : ?>
                <p><strong>When:</strong> <?php echo esc_html( wp_date( 'j M Y, H:i:s', (int) $last['time'] ) ); ?></p>
                <p><strong>Source:</strong> <?php echo esc_html( isset( $last['source'] ) ? (string) $last['source'] : '-' ); ?></p>
                <p><strong>Result:</strong> <?php echo ! empty( $last['ok'] ) ? 'Accepted by Netlify' : 'Failed'; ?>
                    (HTTP <?php echo esc_html( isset( $last['code'] ) ? (string) $last['code'] : '0' ); ?>)
                </p>
            <?php else : ?>
                <p>No requests sent yet.</p>
            <?php endif; ?>
            <p class="description">An accepted hook only confirms that Netlify received the request. The deployment must still pass its own build checks.</p>
        </div>
        <?php
    }
}

Nexora_Netlify_Rebuild::init();
