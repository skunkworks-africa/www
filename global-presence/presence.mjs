import { markets } from './markets.mjs';
import { radians, clamp, wrapLon, globeRadius, flatScale, globePoint, mapPoint, clusterPoints, matchesMarket } from './map-math.mjs';

const $ = id => document.getElementById(id);
const viewport = $('gp-viewport'), map = $('gp-map'), toolbar = $('gp-map-toolbar');
const globeCanvas = $('gp-globe-canvas'), flatCanvas = $('gp-flat-canvas');
const pinsLayer = $('gp-pins'), message = $('gp-map-message'), detail = $('gp-detail');
const list = $('gp-market-list'), count = $('gp-count');
const search = $('gp-search'), region = $('gp-region'), status = $('gp-status');
const globeButton = $('gp-globe-mode'), flatButton = $('gp-flat-mode');
const rows = [...document.querySelectorAll('.gp-table tbody tr')];
const controls = document.querySelector('.gp-controls');
const countryButtons = new Map();
const home = {lon:18, lat:1, zoom:1};
const view = {mode:'globe', ...home};
const regions = {
  'Southern Africa':[26,-22,1.9], 'Central and West Africa':[4,6,1.55],
  'East Africa':[36,-6,1.85], 'North Africa':[-6,32,1.7],
  'Europe':[0,40,1.6], 'Middle East':[46,28,1.7],
  'North America':[-100,39,1.25], 'Asia-Pacific':[134,-25,1.4]
};
const priority = d => d.status === 'Head office' ? 0 : ['Commercial engagement','Regional representation'].includes(d.status) ? 1 : 2;
const marketCodes = new Set(markets.map(m=>m.code));
let selected = null, visible = [...markets], renderer = null, texture = null, geography = [];
let ready = false, pending = false, width = 0, height = 0;

function selectMarket(d, recenter = false) {
  selected = d.code;
  detail.textContent = d.country + ' — ' + d.region + ' — ' + d.status + '. Contact our central team for local availability.';
  list.replaceChildren();
  for (const [code, b] of countryButtons) b.setAttribute('aria-pressed', String(code === selected));
  if (ready && recenter) {
    view.lon = d.lon; view.lat = d.lat; view.zoom = Math.max(view.zoom, 1.65);
  }
  if (ready) schedule();
}
function showCluster(group) {
  selected = null;
  for (const b of countryButtons.values()) b.setAttribute('aria-pressed','false');
  detail.textContent = group.length + ' nearby markets. Select a country below for details.';
  list.replaceChildren();
  for (const {market} of group) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = market.country;
    b.addEventListener('click', () => selectMarket(market, true));
    list.append(b);
  }
  // Circular mean avoids incorrect centering near the antimeridian.
  const x = group.reduce((s,p)=>s+Math.cos(p.market.lon*radians),0);
  const y = group.reduce((s,p)=>s+Math.sin(p.market.lon*radians),0);
  view.lon = Math.atan2(y,x)/radians;
  view.lat = group.reduce((s,p)=>s+p.market.lat,0)/group.length;
  setZoom(view.zoom*1.4);
  viewport.focus({preventScroll:true});
}
for (const [i,d] of markets.entries()) {
  const cell = rows[i]?.querySelector('th');
  if (!cell || cell.textContent.trim() !== d.country) continue;
  const b = document.createElement('button'); b.className = 'gp-country-button';
  b.type = 'button'; b.textContent = d.country;
  b.setAttribute('aria-label','View '+d.country+' market details');
  b.setAttribute('aria-pressed','false');
  b.addEventListener('click',()=>{selectMarket(d,true); if(ready) viewport.scrollIntoView({block:'center',behavior:'instant'});});
  cell.replaceChildren(b); countryButtons.set(d.code,b);
}
function filter(reset = false) {
  visible = markets.filter(d => matchesMarket(d,search.value,region.value,status.value));
  const codes = new Set(visible.map(d=>d.code));
  rows.forEach((row,i)=>{row.hidden=!codes.has(markets[i]?.code);});
  count.textContent = visible.length+' of '+markets.length+' markets';
  if (reset || !codes.has(selected)) {
    selected = null; list.replaceChildren();
    detail.textContent = visible.length ? 'Select a country marker or a country in the directory.' : 'No matching markets. Change or reset your filters.';
    for(const b of countryButtons.values()) b.setAttribute('aria-pressed','false');
  }
  if (!ready) return;
  if (reset) resetView();
  else if (visible.length===1) {
    selectMarket(visible[0],true);
  } else if (region.value && regions[region.value]) {
    [view.lon,view.lat,view.zoom]=regions[region.value];
  }
  schedule();
}
controls.hidden=false;
search.addEventListener('input',()=>filter());
region.addEventListener('change',()=>filter());
status.addEventListener('change',()=>filter());
$('gp-reset').addEventListener('click',()=>{search.value=region.value=status.value='';filter(true);});

function makeTexture(features) {
  const canvas=document.createElement('canvas'); canvas.width=2048; canvas.height=1024;
  const ctx=canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  const w=canvas.width,h=canvas.height;
  const xy=([lon,lat])=>[(lon+180)*w/360,(90-lat)*h/180];
  ctx.fillStyle='#183650';ctx.fillRect(0,0,w,h);
  for (const f of features) {
    ctx.fillStyle=marketCodes.has(f.code)?'#587e73':'#45675f';
    ctx.strokeStyle='#78908a';ctx.lineWidth=.95;
    for (const polygon of f.polygons) {
      ctx.beginPath();
      for(const ring of polygon) {
        ring.forEach((point,i)=>{const [x,y]=xy(point);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
        ctx.closePath();
      }
      ctx.fill('evenodd');ctx.stroke();
    }
  }
  ctx.strokeStyle='rgba(177,209,225,.13)';ctx.lineWidth=.8;
  ctx.beginPath();
  for(let lon=-150;lon<=150;lon+=30){const [x]=xy([lon,0]);ctx.moveTo(x,0);ctx.lineTo(x,h);}
  for(let lat=-60;lat<=60;lat+=30){const [,y]=xy([0,lat]);ctx.moveTo(0,y);ctx.lineTo(w,y);}
  ctx.stroke();
  return canvas;
}

// Orthographic globe. The shader samples the same geographic texture as the flat
// view; market buttons use the matching forward projection in map-math.mjs.
function createGlobe(canvas, texCanvas) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,depth:false});
  if(!gl) return null;
  const vertex='attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}';
  const fragment=`
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_radius;
    uniform vec2 u_center;
    uniform sampler2D u_earth;
    const float PI=3.141592653589793;
    void main(){
      vec2 p=(gl_FragCoord.xy-u_resolution*0.5)/u_radius;
      float q=dot(p,p);
      if(q>1.0){
        float glow=max(0.0,1.0-(sqrt(q)-1.0)*23.0);
        gl_FragColor=vec4(0.44,0.68,0.95,glow*glow*0.37);
        return;
      }
      float z=sqrt(max(0.0,1.0-q));
      float lat=asin(clamp(p.y*cos(u_center.y)+z*sin(u_center.y),-1.0,1.0));
      float lon=u_center.x+atan(p.x,z*cos(u_center.y)-p.y*sin(u_center.y));
      vec2 uv=vec2(fract(lon/(2.0*PI)+0.5),lat/PI+0.5);
      vec3 base=texture2D(u_earth,uv).rgb;
      float light=0.67+0.39*max(0.0,dot(vec3(p,z),normalize(vec3(-0.38,0.48,0.9))));
      vec3 atmosphere=vec3(0.42,0.65,0.93)*pow(1.0-z,3.4)*0.36;
      float alpha=1.0-smoothstep(1.0-1.4/u_radius,1.0,sqrt(q));
      gl_FragColor=vec4(base*light+atmosphere,alpha);
    }`;
  const compile=(type,src)=>{
    const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Shader compile failed');
    return shader;
  };
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Shader link failed');
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texCanvas);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);
  gl.uniform1i(gl.getUniformLocation(program,'u_earth'),0);
  const resolution=gl.getUniformLocation(program,'u_resolution');
  const radius=gl.getUniformLocation(program,'u_radius');
  const center=gl.getUniformLocation(program,'u_center');
  return {draw(w,h,dpr){
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    gl.viewport(0,0,pw,ph);gl.uniform2f(resolution,pw,ph);
    gl.uniform1f(radius,globeRadius(w,h,view.zoom)*dpr);
    gl.uniform2f(center,view.lon*radians,view.lat*radians);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }};
}
function drawFlat(w,h,dpr) {
  const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
  if(flatCanvas.width!==pw||flatCanvas.height!==ph){flatCanvas.width=pw;flatCanvas.height=ph;}
  const ctx=flatCanvas.getContext('2d');if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const scale=flatScale(w,h,view.zoom),tw=360*scale,th=180*scale;
  const left=w/2-(180+wrapLon(view.lon))*scale,top=h/2-(90-view.lat)*scale;
  ctx.imageSmoothingEnabled=true;
  for(let i=-1;i<=1;i++)ctx.drawImage(texture,left+i*tw,top,tw,th);
}
const labelsLayer=document.createElement('div');
labelsLayer.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';
labelsLayer.setAttribute('aria-hidden','true');pinsLayer.before(labelsLayer);
const labelNodes=[];
const makePin=()=>{
  const b=document.createElement('button');b.type='button';b.className='gp-pin';b.hidden=true;
  const core=document.createElement('span'),label=document.createElement('span');
  core.className='gp-pin-core';label.className='gp-pin-label';core.setAttribute('aria-hidden','true');label.setAttribute('aria-hidden','true');
  b.append(core,label);pinsLayer.append(b);
  const pin={b,core,label,group:null};
  b.addEventListener('click',()=>{
    if(!pin.group)return;
    if(pin.group.members.length>1)showCluster(pin.group.members);
    else selectMarket(pin.group.members[0].market);
  });
  return pin;
};
const pinNodes=markets.map(makePin);
function inViewport(p,w,h){return p&&p.x>=17&&p.x<=w-17&&p.y>=17&&p.y<=h-26;}
function drawPins(w,h) {
  const sorted=[...visible].sort((a,b)=>(a.code===selected?-1:priority(a))-(b.code===selected?-1:priority(b)));
  const points=sorted.map(m=>{const p=mapPoint(m,view,w,h);return p?{...p,market:m}:null;}).filter(p=>inViewport(p,w,h));
  const groups=clusterPoints(points,w<600?34:39);
  const occupied=groups.map(g=>({x:g.x-19,y:g.y-19,w:38,h:38}));
  const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const used=new Set();
  for(const g of groups){
    const lead=g.members[0].market,pin=pinNodes[markets.indexOf(lead)],cluster=g.members.length>1;
    used.add(pin);pin.group=g;
    pin.b.style.left=g.x+'px';pin.b.style.top=g.y+'px';
    pin.b.style.zIndex=lead.code===selected?'6':lead.status==='Head office'?'5':'3';
    pin.b.dataset.kind=cluster?'cluster':priority(lead)===0?'hq':priority(lead)===1?'commercial':'development';
    pin.core.textContent=cluster?String(g.members.length):priority(lead)===0?'◆':priority(lead)===1?'●':'○';
    const label=cluster?g.members.length+' markets':lead.country;
    pin.label.textContent=label;
    const labelWidth=label.length*6.4+15;
    const rect={x:g.x-labelWidth/2,y:g.y+19,w:labelWidth,h:20};
    const show=(!cluster&&(lead.code===selected||priority(lead)<2||view.zoom>1.35))&&rect.x>=2&&rect.x+rect.w<=w-2&&rect.y+rect.h<h-19&&!occupied.some(o=>intersects(o,rect));
    pin.b.dataset.label=String(show);
    if(show)occupied.push(rect);
    pin.b.setAttribute('aria-label',cluster?g.members.length+' nearby markets: '+g.members.map(p=>p.market.country).join(', '):lead.country+' — '+lead.status);
    pin.b.setAttribute('aria-pressed',String(!cluster&&lead.code===selected));
    pin.b.title=pin.b.getAttribute('aria-label');pin.b.hidden=false;
  }
  for(const pin of pinNodes)if(!used.has(pin)){pin.group=null;pin.b.hidden=true;}
  // Selected geographic labels are separate from interactive market markers.
  // Use Natural Earth's own label coordinates rather than inferred polygon centroids.
  let n=0;
  const maxLabels=w<600?8:20;
  for(const f of geography){
    if(n>=maxLabels||marketCodes.has(f.code)||!f.label.every(Number.isFinite)||f.rank>(view.zoom>1.5?5:3))continue;
    if(view.mode==='globe'&&globePoint(f.label[0],f.label[1],view.lon,view.lat).z<.35)continue;
    const p=mapPoint({lon:f.label[0],lat:f.label[1]},view,w,h);
    if(!inViewport(p,w,h))continue;
    const len=f.name.length*6+4,rect={x:p.x-len/2,y:p.y-7,w:len,h:14};
    if(rect.x<4||rect.x+rect.w>w-4||occupied.some(o=>intersects(o,rect)))continue;
    occupied.push(rect);
    let node=labelNodes[n];
    if(!node){node=document.createElement('span');node.style.cssText='position:absolute;transform:translate(-50%,-50%);font-size:11px;font-weight:600;color:#d5e2df;text-shadow:0 1px 4px #000,0 1px 2px #000;white-space:nowrap;opacity:.86';labelsLayer.append(node);labelNodes.push(node);}
    node.textContent=f.name;node.style.left=p.x+'px';node.style.top=p.y+'px';node.hidden=false;n++;
  }
  for(let i=n;i<labelNodes.length;i++)labelNodes[i].hidden=true;
}
function draw(){
  pending=false;if(!ready)return;
  const rect=viewport.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  if(view.mode==='globe'&&renderer){renderer.draw(width,height,dpr);}else drawFlat(width,height,dpr);
  drawPins(width,height);
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(draw);}}
function setZoom(zoom){view.zoom=clamp(zoom,0.8,4);$('gp-zoom-out').disabled=view.zoom<=.8;$('gp-zoom-in').disabled=view.zoom>=4;schedule();}
function resetView(){
  if(view.mode==='globe'){Object.assign(view,home);}else Object.assign(view,{lon:0,lat:0,zoom:1});
  setZoom(view.zoom);
}
function switchMode(mode, reset=true){
  view.mode=mode==='globe'&&renderer?'globe':'flat';
  globeCanvas.hidden=view.mode!=='globe';flatCanvas.hidden=view.mode!=='flat';
  globeButton.setAttribute('aria-pressed',String(view.mode==='globe'));
  flatButton.setAttribute('aria-pressed',String(view.mode==='flat'));
  $('gp-map-mode-label').textContent=view.mode==='globe'?'GEOGRAPHIC GLOBE':'WORLD MAP';
  if(reset)resetView();else schedule();
}
globeButton.addEventListener('click',()=>switchMode('globe'));
flatButton.addEventListener('click',()=>switchMode('flat'));
$('gp-zoom-in').addEventListener('click',()=>setZoom(view.zoom*1.3));
$('gp-zoom-out').addEventListener('click',()=>setZoom(view.zoom/1.3));
$('gp-home-view').addEventListener('click',resetView);
const full=$('gp-fullscreen');
if(document.fullscreenEnabled&&map.requestFullscreen){
  full.hidden=false;
  full.addEventListener('click',async()=>{try{if(document.fullscreenElement===map)await document.exitFullscreen();else await map.requestFullscreen();}catch{detail.textContent='Fullscreen is unavailable in this browser.';}});
  document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===map?'Exit fullscreen':'Fullscreen';schedule();});
}
function move(dx,dy){
  const degrees=view.mode==='globe'?90/Math.max(1,globeRadius(width,height,view.zoom)):1/Math.max(.01,flatScale(width,height,view.zoom));
  view.lon=wrapLon(view.lon-dx*degrees);
  view.lat=clamp(view.lat+dy*degrees,-85,85);
  schedule();
}
const pointers=new Map();
let previousDistance=0;
const distance=()=>{const [a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
viewport.addEventListener('pointerdown',e=>{
  if(!ready||e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
  viewport.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  previousDistance=distance();viewport.classList.add('is-dragging');
});
viewport.addEventListener('pointermove',e=>{
  const last=pointers.get(e.pointerId);if(!last)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size>1){const d=distance();if(previousDistance>0&&d>0)setZoom(view.zoom*d/previousDistance);previousDistance=d;}
  else move(e.clientX-last.x,e.clientY-last.y);
});
const endPointer=e=>{pointers.delete(e.pointerId);previousDistance=distance();if(!pointers.size)viewport.classList.remove('is-dragging');};
for(const name of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(name,endPointer);
viewport.addEventListener('wheel',e=>{if(!ready||!e.ctrlKey)return;e.preventDefault();setZoom(view.zoom*Math.exp(-e.deltaY*.002));},{passive:false});
viewport.addEventListener('keydown',e=>{
  if(!ready||e.target!==viewport)return;
  const steps={ArrowLeft:[32,0],ArrowRight:[-32,0],ArrowUp:[0,32],ArrowDown:[0,-32]};
  if(steps[e.key]){e.preventDefault();move(...steps[e.key]);}
  else if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(view.zoom*1.3);}
  else if(e.key==='-'){e.preventDefault();setZoom(view.zoom/1.3);}
  else if(e.key==='Home'){e.preventDefault();resetView();}
});
if('ResizeObserver' in window)new ResizeObserver(schedule).observe(viewport);
else window.addEventListener('resize',schedule);
globeCanvas.addEventListener('webglcontextlost',e=>{
  e.preventDefault();renderer=null;globeButton.disabled=true;
  if(ready)switchMode('flat');
});
async function init(){
  try{
    const response=await fetch(new URL('./world-geography.json',import.meta.url),{credentials:'same-origin'});
    if(!response.ok)throw new Error('Geographic data unavailable');
    const data=await response.json();
    if(!Array.isArray(data.features)||!data.features.length)throw new Error('Invalid geographic data');
    geography=data.features.sort((a,b)=>a.rank-b.rank);
    texture=makeTexture(geography);
    try{renderer=createGlobe(globeCanvas,texture);}catch(e){console.warn('Globe unavailable; using world map.',e);}
    globeButton.disabled=!renderer;
    if(!renderer)globeButton.title='3D globe is unavailable on this device; the geographic world map still works.';
    ready=true;toolbar.hidden=false;message.hidden=true;
    switchMode(renderer?'globe':'flat');filter();
  }catch(e){
    console.warn('Global presence map unavailable.',e);
    message.textContent='The geographic map is unavailable. The complete searchable country directory remains available below.';
    viewport.style.touchAction='auto';
  }
}
init();
