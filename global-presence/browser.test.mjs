// Run via the dedicated CI workflow with Playwright installed.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  try{
    let filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!filename.startsWith(root+path.sep)&&filename!==root){res.writeHead(403);res.end();return;}
    if((await fs.stat(filename)).isDirectory())filename=path.join(filename,'index.html');
    const body=await fs.readFile(filename);
    res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'});res.end(body);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/global-presence/';
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:700}]){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#gp-map-toolbar').waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelectorAll('.gp-pin:not([hidden])').length>0);
    assert.equal(await page.locator('#gp-count').textContent(),'31 of 31 markets');
    assert.equal(await page.locator('#gp-globe-mode').getAttribute('aria-pressed'),'true','WebGL globe should render with software GPU');
    const size=await page.locator('#gp-viewport').boundingBox();assert.ok(size.width<=viewport.width&&size.height>=300);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally');
    await page.locator('#gp-zoom-in').click();
    await page.locator('#gp-home-view').click();
    await page.locator('#gp-flat-mode').click();
    assert.equal(await page.locator('#gp-flat-mode').getAttribute('aria-pressed'),'true');
    await page.locator('#gp-region').selectOption('Southern Africa');
    assert.equal(await page.locator('.gp-table tbody tr:not([hidden])').count(),10);
    await page.locator('#gp-search').fill('Namibia');
    assert.equal(await page.locator('.gp-table tbody tr:not([hidden])').count(),1);
    assert.match(await page.locator('#gp-detail').textContent(),/Namibia/);
    await page.locator('#gp-reset').click();
    assert.equal(await page.locator('.gp-table tbody tr:not([hidden])').count(),31);
    await page.getByRole('button',{name:'View Australia market details',exact:true}).click();
    assert.match(await page.locator('#gp-detail').textContent(),/Australia/);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  await browser.close();browser=null;
  browser=await chromium.launch({headless:true,args:['--disable-webgl']});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('#gp-map-toolbar').waitFor({state:'visible'});
  assert.equal(await page.locator('#gp-globe-mode').isDisabled(),true);
  assert.equal(await page.locator('#gp-flat-mode').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelectorAll('.gp-pin:not([hidden])').length>0);
  assert.equal(await page.locator('.gp-table tbody tr').count(),31);
  await page.close();
  console.log('Global presence desktop, mobile, globe and no-WebGL fallback checks passed.');
}finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
