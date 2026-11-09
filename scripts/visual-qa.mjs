import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base='http://127.0.0.1:4173';
const routes=[
  {path:'/',label:'home',width:320,height:760},
  {path:'/',label:'home',width:390,height:844},
  {path:'/',label:'home',width:768,height:1024},
  {path:'/',label:'home',width:1440,height:900},
  {path:'/',label:'home',width:1920,height:1080},
  {path:'/projects/',label:'projects',width:390,height:844},
  {path:'/projects/',label:'projects',width:1440,height:900},
  {path:'/events/',label:'events',width:390,height:844},
  {path:'/events/',label:'events',width:1440,height:900},
  {path:'/projects/offshore-platform-maintenance-inspection/',label:'project-detail',width:390,height:844},
  {path:'/events/asia-offshore-energy-conference-2026/',label:'event-detail',width:390,height:844}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('screenshots',{recursive:true});
const results=[];
let issues=0;
for(const route of routes){
 const page=await browser.newPage({viewport:{width:route.width,height:route.height},deviceScaleFactor:1,reducedMotion:'reduce'});
 const url=base+route.path;
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
  if(!response?.ok())throw Error(`HTTP ${response?.status()}`);
  await page.locator('h1').waitFor({timeout:5000});
  await page.waitForTimeout(900);
  const metrics=await page.evaluate(()=>({
   docWidth:document.documentElement.scrollWidth,
   viewport:window.innerWidth,
   heading:document.querySelector('h1')?.textContent?.trim()||'',
   images:[...document.querySelectorAll('main img')].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})),
   bodyHeight:document.documentElement.scrollHeight,
   visibleNav:document.querySelector('.desktop-nav')?.getBoundingClientRect().width,
   overflowElements: [...document.body.querySelectorAll('*')]
     .map(el => ({el,rect:el.getBoundingClientRect()}))
     .filter(({el,rect}) => rect.right > innerWidth+1 && getComputedStyle(el).position !== 'absolute')
     .sort((a,b) => b.rect.right-a.rect.right).slice(0,12)
     .map(({el,rect})=>({
       element:el.tagName.toLowerCase(),
       className:String(el.className||'').slice(0,70),
       right:Math.round(rect.right),
       width:Math.round(rect.width),
       text:(el.textContent||'').trim().slice(0,65)
     }))
  }));
  // Guard against reintroducing the desktop CTA alongside the mobile menu.
  if(route.width<=1000 && await page.locator('.header-cta').isVisible()){
    throw Error('Desktop header CTA is incorrectly visible in mobile layout');
  }
  // Eagerly resolve below-the-fold images for reproducible full-page screenshots.
  await page.locator('main img').evaluateAll(images=>images.forEach(img=>{img.loading='eager';}));
  await page.waitForTimeout(1200);
  const overflow=metrics.docWidth>metrics.viewport+1;
  if(overflow){issues++;console.warn('OVERFLOW ELEMENTS',metrics.overflowElements);}
  const fname=`screenshots/${route.label}-${route.width}.png`;
  await page.screenshot({path:fname,fullPage:true,animations:'disabled'});
  results.push({route:route.path,width:route.width,...metrics,overflow,screenshot:fname});
  console.log(`${overflow?'FAIL':'PASS'} ${url} [${route.width}px] scrollWidth=${metrics.docWidth} imageLoad=${metrics.images.filter(i=>i.loaded).length}/${metrics.images.length}`);
  if(route.path==='/' && route.width===390){
   const menu=page.locator('.mobile-menu summary');
   await menu.click();
   if(!(await page.locator('.mobile-menu').evaluate(el=>el.open)))throw Error('Mobile menu does not open');
   await page.screenshot({path:'screenshots/mobile-menu-390.png',animations:'disabled'});
  }
 }catch(error){issues++;console.error('Visual QA error:',url,route.width,error);}
 finally{await page.close();}
}
await browser.close();
await writeFile('screenshots/report.json',JSON.stringify(results,null,2));
if(issues)process.exitCode=1;
