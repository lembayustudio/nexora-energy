const base = import.meta.env.WP_API_URL || 'https://cms.lembayu.com/wp-json/wp/v2';

type Media = { url?: string; alt?: string; sizes?: Record<string,string> };
type FeaturedMedia = { source_url: string; alt_text?: string; media_details?: { sizes?: Record<string,{source_url:string}> } };

export type Entry = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  acf?: {
    project_location?: string;
    project_year?: number | string;
    client_name?: string;
    project_status?: string;
    project_gallery_1?: Media | false;
    project_gallery_2?: Media | false;
    project_gallery_3?: Media | false;
    event_date?: string;
    event_end_date?: string;
    event_location?: string;
    event_type?: string;
    event_gallery_1?: Media | false;
    event_gallery_2?: Media | false;
  };
  _embedded?: { 'wp:featuredmedia'?: FeaturedMedia[] };
};

export const clean = (value: string) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;|&#038;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#8217;|&#039;/g, '’')
  .replace(/&#8211;/g, '–')
  .replace(/\s+/g, ' ')
  .trim();

export const imageOf = (entry: Entry): string | undefined => {
  const image = entry._embedded?.['wp:featuredmedia']?.[0];
  return image?.media_details?.sizes?.large?.source_url || image?.source_url || undefined;
};

export const galleryOf = (entry: Entry): Array<{url:string;alt:string}> => {
  const acf = entry.acf;
  if (!acf) return [];
  const fields = ['project_gallery_1','project_gallery_2','project_gallery_3','event_gallery_1','event_gallery_2'] as const;
  return fields.map(field => acf[field])
    .filter((image):image is Media => !!image && typeof image === 'object' && typeof image.url === 'string')
    .map(image => ({url: image.url!, alt: image.alt || clean(entry.title.rendered)}));
};

export const formatEventDate = (date?: string): string => {
  if (!date) return 'Date to be announced';
  // ACF can return YYYY-MM-DD, YYYYMMDD or a datetime string depending on field settings.
  const match = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(date.trim());
  if (!match) return date;
  const [,year,month,day] = match;
  const parsed = new Date(Date.UTC(Number(year),Number(month)-1,Number(day),12));
  if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth()+1 !== Number(month) || parsed.getUTCDate() !== Number(day)) return date;
  return new Intl.DateTimeFormat('en-MY', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parsed);
};

const cache = new Map<string, Promise<Entry[]>>();
export function getEntries(type: 'projects' | 'events'): Promise<Entry[]> {
  if (cache.has(type)) return cache.get(type)!;
  const pending = (async () => {
    try {
      const response = await fetch(`${base}/${type}?_embed&per_page=100`, {signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error(`CMS returned HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('CMS response is not an array');
      return data.filter((entry):entry is Entry =>
        !!entry && typeof entry.id === 'number' && typeof entry.slug === 'string' && !!entry.title?.rendered
      );
    } catch (error) {
      console.warn(`Could not load ${type} from WordPress at build time:`, error);
      if (import.meta.env.CMS_STRICT === 'true') throw error;
      return [];
    }
  })();
  cache.set(type, pending);
  return pending;
}
