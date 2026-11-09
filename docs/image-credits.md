# V2 Photography & Visual Art Direction

NEXORA Energy is a fictional portfolio case study. Images are **illustrative** and do not depict the brand's actual projects, facilities, employees or events.

Curated photos are downloaded from Pexels during an initial image sync and compressed by Pexels' image delivery service. License information is available at [Pexels License](https://www.pexels.com/license/); verify it again before any commercial production usage.

| Asset | Subject / role | Photographer | Source |
| --- | --- | --- | --- |
| `offshore-hero.jpg` | Offshore energy platform aerial; hero | Aron Razif | https://www.pexels.com/photo/aerial-view-of-complex-platform-9336590/ |
| `offshore-project.jpg` | Offshore rig at sunset; illustrative project fallback | GANESH RAMSUMAIR | https://www.pexels.com/photo/offshore-oil-rig-at-sunset-aerial-view-30445637/ |
| `industrial-plant.jpg` | Refinery infrastructure; editorial landscape | Ali Mucci | https://www.pexels.com/photo/a-photo-of-an-industrial-business-4883682/ |
| `industrial-detail.jpg` | Sunlit pipeline; services & about | Joseph Russo | https://www.pexels.com/photo/sunlit-big-pipe-with-platform-15340288/ |
| `conference.jpg` | Conference discussion; illustrative event fallback | RDNE Stock project | https://www.pexels.com/photo/speakers-talking-at-a-business-conference-7648048/ |

Design strategy:
- Show built infrastructure rather than generic handshakes or incongruent technology stock imagery.
- Crop hero to place architectural interest on the right, preserving negative space and contrast for the headline.
- Keep color treatment consistent: muted blue/steel, warm copper highlights, restrained saturation.
- Editorial image bands separate content sections; service cards remain intentionally text-first.
- CMS-supplied featured images take priority; local photographs are **illustrative fallback images**.
- Images are bundled as static site assets, not loaded from Pexels at page-view time.

The image sync workflow may commit binaries into `public/images/` for reproducible future builds. If those files are absent, `npm run build` downloads them before compiling. This is a one-time provisioning dependency and a recovery fallback, not a runtime CDN dependency.
