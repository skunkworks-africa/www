import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { markets } from './markets.mjs';
import { globePoint, inverseGlobe, wrapLon, flatScale, mapPoint, clusterPoints, matchesMarket } from './map-math.mjs';

test('all 31 registered markets match unique country geometry and directory rows',()=>{
  const geography=JSON.parse(fs.readFileSync(new URL('./world-geography.json',import.meta.url),'utf8'));
  const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.equal(geography.features.length,177);
  const codes=new Set(geography.features.map(f=>f.code));
  assert.equal(markets.length,31);assert.equal(new Set(markets.map(d=>d.code)).size,31);
  assert.equal(markets.filter(m=>m.region.includes('Africa')).length,23);
  for(const market of markets){
    assert.ok(codes.has(market.code),market.code+' is missing geometry');
    assert.ok(Math.abs(market.lon)<=180&&Math.abs(market.lat)<=90);
  }
  assert.deepEqual([...html.matchAll(/<tr data-region="[^"]+" data-status="[^"]+"><th scope="row">([^<]+)<\/th>/g)].map(m=>m[1]),markets.map(m=>m.country));
  assert.equal(markets.filter(m=>m.status==='Head office').length,1);
});
test('orthographic projection round-trips across hemispheres',()=>{
  for(const center of [[18,1],[-100,39],[134,-25],[179,0]]){
    for(const m of markets){
      const p=globePoint(m.lon,m.lat,...center);
      if(p.z<0.05)continue;
      const q=inverseGlobe(p.x,p.y,...center);
      assert.ok(Math.abs(wrapLon(q.lon-m.lon))<1e-7,m.country);
      assert.ok(Math.abs(q.lat-m.lat)<1e-7,m.country);
    }
  }
  assert.ok(globePoint(180,0,0,0).z<0);
  assert.equal(mapPoint({lon:180,lat:0},{mode:'globe',lon:0,lat:0,zoom:1},800,500),null);
});
test('flat view covers the globe at narrow and wide viewports',()=>{
  for(const [w,h] of [[320,340],[1240,650],[768,400]]){
    assert.ok(flatScale(w,h,1)>0);
    for(const m of markets){
      const p=mapPoint(m,{mode:'flat',lon:0,lat:0,zoom:1},w,h);
      assert.ok(p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h,m.country);
    }
  }
});
test('filters are accent insensitive and combine region and relationship status',()=>{
  const cote=markets.find(m=>m.code==='CIV');
  assert.ok(matchesMarket(cote,'cote divoire','Central and West Africa','Development'));
  assert.equal(matchesMarket(cote,'cote','Europe','Development'),false);
  assert.equal(markets.filter(m=>matchesMarket(m,'','Southern Africa','')).length,10);
});
test('clusters preserve each market once',()=>{
  const groups=clusterPoints([{x:0,y:0,id:1},{x:10,y:10,id:2},{x:90,y:90,id:3}],36);
  assert.equal(groups.length,2);
  assert.deepEqual(groups.flatMap(g=>g.members.map(p=>p.id)),[1,2,3]);
});
