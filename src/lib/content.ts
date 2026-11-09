const base = import.meta.env.WP_API_URL || 'https://cms.lembayu.com/wp-json/wp/v2';
export type Entry = { id:number; slug:string; date:string; title:{rendered:string}; excerpt?:{rendered:string}; content?:{rendered:string}; _embedded?:{'wp:featuredmedia'?:Array<{source_url:string;alt_text?:string}>} };
export const clean = (value:string) => value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#8217;/g,'’').trim();
export const imageOf = (entry:Entry) => entry._embedded?.['wp:featuredmedia']?.[0]?.source_url;
export async function getEntries(type:'projects'|'events'):Promise<Entry[]> {
  try {
    const res = await fetch(`${base}/${type}?_embed&per_page=30`,{signal:AbortSignal.timeout(8000)});
    if (!res.ok) throw new Error(`CMS ${res.status}`);
    const data:unknown = await res.json();
    return Array.isArray(data) ? data.filter((item):item is Entry => !!item && typeof item.slug === 'string' && typeof item.id === 'number') : [];
  } catch (error) {
    console.warn(`Could not load ${type} from WordPress at build time:`,error);
    return [];
  }
}
