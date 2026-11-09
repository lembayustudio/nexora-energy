/**
 * Curated Pexels photographs bundled into the static build.
 * Images are downloaded once into public/images, then cached on later builds.
 * License and provenance: docs/image-credits.md.
 */
import { mkdir, stat, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

const directory=join(process.cwd(),'public','images');
const photos=[
  {name:'offshore-hero.jpg', ids:[9336590], width:2000},
  {name:'offshore-project.jpg', ids:[15973758,9336590], width:1500},
  {name:'industrial-plant.jpg', ids:[4883682], width:1750},
  {name:'industrial-detail.jpg', ids:[15340288], width:1400},
  {name:'conference.jpg', ids:[7648048], width:1400}
];
await mkdir(directory,{recursive:true});
for(const photo of photos){
  const path=join(directory,photo.name);
  try{if((await stat(path)).size>20_000){console.log('Cached',photo.name);continue;}}catch{}
  let downloaded=false,lastError;
  for(const id of photo.ids){
    const url=`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${photo.width}`;
    for(let attempt=1;attempt<=2;attempt++){
      try{
        const response=await fetch(url,{headers:{Accept:'image/jpeg'},signal:AbortSignal.timeout(25000)});
        if(!response.ok){
          if(response.status===404){lastError=new Error(`HTTP 404 for photo ${id}`);break;}
          throw new Error(`HTTP ${response.status} for photo ${id}`);
        }
        const mime=response.headers.get('content-type')||'';
        if(!mime.startsWith('image/jpeg'))throw new Error(`Unexpected image type: ${mime}`);
        const bytes=Buffer.from(await response.arrayBuffer());
        if(bytes.length<20_000||bytes.length>3_000_000||bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error(`Invalid JPEG bytes: ${bytes.length}`);
        await writeFile(path+'.tmp',bytes);
        await rename(path+'.tmp',path);
        console.log(`Downloaded ${photo.name} from Pexels ${id}: ${Math.round(bytes.length/1024)} KiB`);
        downloaded=true;
        break;
      }catch(error){
        lastError=error;
        console.warn(`Photo ${photo.name}, ID ${id}, attempt ${attempt}:`,error.message);
        if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1200));
      }
    }
    if(downloaded)break;
  }
  if(!downloaded){
    await rm(path+'.tmp',{force:true});
    throw new Error(`Required visual asset unavailable: ${photo.name}. ${lastError?.message||''}`);
  }
}
