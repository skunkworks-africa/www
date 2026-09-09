import fs from 'node:fs';

const files = [
  'index.html',
  'styles.css',
  'site.js',
  'site-map.json',
  'sitemap.xml',
  'robots.txt',
  'automation/index.html',
  'automation/automation.css',
  'automation/config.js',
  'automation/app.js'
];
const failures = [];
for (const file of files) if (!fs.existsSync(file)) failures.push(`Missing required file: ${file}`);

const html = fs.existsSync('index.html') ? fs.readFileSync('index.html','utf8') : '';
const css = fs.existsSync('styles.css') ? fs.readFileSync('styles.css','utf8') : '';
const js = fs.existsSync('site.js') ? fs.readFileSync('site.js','utf8') : '';
const automationHtml = fs.existsSync('automation/index.html') ? fs.readFileSync('automation/index.html','utf8') : '';
const automationCss = fs.existsSync('automation/automation.css') ? fs.readFileSync('automation/automation.css','utf8') : '';
const automationJs = fs.existsSync('automation/app.js') ? fs.readFileSync('automation/app.js','utf8') : '';
const automationConfig = fs.existsSync('automation/config.js') ? fs.readFileSync('automation/config.js','utf8') : '';
const siteMap = fs.existsSync('site-map.json') ? JSON.parse(fs.readFileSync('site-map.json','utf8')) : {};

const requireText=(source,text,msg)=>{if(!source.includes(text)) failures.push(msg)};
requireText(html,'rel="canonical" href="https://www.skunkworks.africa/"','Missing canonical URL.');
requireText(html,'data-menu-button','Missing burger menu control.');
requireText(html,'data-mobile-menu','Missing mobile navigation container.');
requireText(html,'https://store.skunkworks.africa/','Missing canonical Shopify store link.');
requireText(html,'https://www.skunkworksacademy.com/','Missing Academy ecosystem link.');
requireText(css,'@media(prefers-color-scheme:dark)','Missing browser dark-mode inversion.');
requireText(css,'@media(prefers-reduced-motion:reduce)','Missing reduced-motion handling.');
requireText(css,':focus-visible','Missing visible keyboard focus style.');
requireText(js,"event.key === 'Escape'",'Mobile menu must close on Escape.');
if (/class=["'][^"']*sidebar/i.test(html) || /\.sidebar\b/.test(css)) failures.push('Persistent left sidebar navigation is forbidden.');

requireText(automationHtml,'rel="canonical" href="https://www.skunkworks.africa/automation/"','Automation page is missing its canonical URL.');
requireText(automationHtml,'content="noindex,nofollow"','Automation page must remain noindex until authenticated production hosting exists.');
requireText(automationHtml,'https://store.skunkworks.africa/','Automation page must preserve the canonical store authority.');
requireText(automationHtml,'https://www.skunkworksacademy.com/','Automation page must preserve the Academy ecosystem route.');
requireText(automationHtml,'data-menu-button','Automation page is missing the shared responsive header.');
requireText(automationHtml,'/automation/app.js','Automation page is missing its workflow application script.');
requireText(automationHtml,'/automation/config.js','Automation page is missing its workflow configuration.');
requireText(automationJs,"localStorage",'Automation workflow must persist browser-local state.');
requireText(automationJs,"store.skunkworks.africa",'Automation workflow must enforce canonical Shopify URLs.');
requireText(automationConfig,'Google Merchant Center','Automation channel model is missing Google Merchant.');
requireText(automationConfig,'WhatsApp Business','Automation channel model is missing WhatsApp Business.');
requireText(automationConfig,'Amazon.co.za','Automation channel model is missing Amazon.co.za.');
requireText(automationConfig,'Direct Sales / RFQ','Automation channel model is missing direct assisted sales.');
requireText(automationCss,'@media(prefers-reduced-motion:reduce)','Automation UI is missing reduced-motion handling.');
requireText(automationCss,':focus-visible','Automation UI is missing visible keyboard focus.');

const explicitHex=[...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m=>m[0].toLowerCase());
const automationHex=[...automationCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m=>m[0].toLowerCase());
const allowed=new Set(['#000','#000000','#fff','#ffffff']);
const invalid=[...new Set([...explicitHex,...automationHex].filter(v=>!allowed.has(v)))];
if(invalid.length) failures.push(`Non-monochrome explicit colors found: ${invalid.join(', ')}`);

const requiredHosts=['https://www.skunkworks.africa','https://store.skunkworks.africa','https://www.skunkworksacademy.com'];
for(const host of requiredHosts){if(!Object.values(siteMap.canonicalHosts||{}).includes(host)) failures.push(`Missing canonical host rule: ${host}`)}
const labels=(siteMap.primaryNavigation||[]).map(i=>i.label).join('|');
if(labels!=='Solutions|Services|Store|Academy|Company') failures.push('Primary navigation order does not match canonical rule.');

if(failures.length){console.error('Site validation failed:');for(const f of failures) console.error(`- ${f}`);process.exit(1)}
console.log('Site validation passed.');
console.log(`Validated ${files.length} required files, canonical routing, responsive navigation, sales automation controls and monochrome design rules.`);
