/**
 * Curated photo assets for a fictional energy portfolio.
 * Downloads explicitly credited free-to-use Pexels photos at build time.
 * Files are cached locally: CI normally uses the committed copies once synced.
 */
import { mkdir, stat, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

const directory = join(process.cwd(), 'public', 'images');
const photos = [
  { name:'offshore-hero.jpg', id:9336590, width:2000 },
  { name:'offshore-project.jpg', id:30445637, width:1500 },
  { name:'industrial-plant.jpg', id:4883682, width:1750 },
  { name:'industrial-detail.jpg', id:15340288, width:1400 },
  { name:'conference.jpg', id:7648048, width:1400 }
];
await mkdir(directory, { recursive:true });
for (const photo of photos) {
  const path = join(directory, photo.name);
  try { if ((await stat(path)).size > 20_000) { console.log('Using cached', photo.name); continue; } } catch {}
  const url = `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=${photo.width}`;
  let error;
  for (let attempt=1;attempt<=3;attempt++) {
    try {
      const result = await fetch(url, { headers: { Accept: 'image/jpeg' }, signal:AbortSignal.timeout(25000) });
      if (!result.ok) throw Error(`HTTP ${result.status}`);
      const mime = result.headers.get('content-type') || '';
      if (!mime.startsWith('image/jpeg')) throw Error(`Unexpected MIME: ${mime}`);
      const data=Buffer.from(await result.arrayBuffer());
      if (data.byteLength < 20_000 || data.byteLength > 3_000_000 || data[0] !== 0xff || data[1] !== 0xd8) throw Error(`Invalid JPEG bytes (${data.length})`);
      const tmp = path + '.tmp';
      await writeFile(tmp,data);
      await rename(tmp,path);
      console.log(`Downloaded ${photo.name}: ${Math.round(data.byteLength/1024)} KiB`);
      error=null;
      break;
    } catch (err) {
      error=err;
      console.warn(`Download attempt ${attempt} for ${photo.name} failed:`,err.message);
      if(attempt<3) await new Promise(resolve=>setTimeout(resolve,1200*attempt));
    }
  }
  if (error) { await rm(path+'.tmp',{force:true}); throw new Error(`Missing required visual asset ${photo.name}: ${error.message}`); }
}
