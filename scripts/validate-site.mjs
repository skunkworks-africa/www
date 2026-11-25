import fs from 'node:fs';

const files = [
  'index.html',
  'styles.css',
  'site.js',
  'assets/brand-navigation.css',
  'assets/brand-navigation-tokens.css',
  'assets/brand-navigation.js',
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
requireText(html,'data-sk-open="sk-navigation"','Missing burger menu control.');
requireText(html,'id="sk-navigation"','Missing mobile navigation dialog.');
requireText(html,'data-sk-open="sk-search"','Missing global search.');
requireText(html,'data-sk-theme','Missing theme control.');
requireText(html,'https://store.skunkworks.africa/','Missing canonical Shopify store link.');
requireText(html,'https://www.skunkworksacademy.com/','Missing Academy ecosystem link.');
requireText(css,'@media(prefers-color-scheme:dark)','Missing browser dark-mode inversion.');
requireText(css,'@media(prefers-reduced-motion:reduce)','Missing reduced-motion handling.');
requireText(css,':focus-visible','Missing visible keyboard focus style.');
const navJs = fs.readFileSync('assets/brand-navigation.js','utf8');
requireText(navJs,'showModal()','Navigation must use a native modal dialog.');
requireText(navJs,'trigger?.focus()','Navigation must restore focus.');
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
if(labels!=='Solutions|Services|Academy|Skunkworks') failures.push('Primary navigation order does not match canonical rule.');
const desktopNav = html.match(/<nav class="sk-top-links"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
const mobileNav = html.match(/<nav aria-label="Mobile navigation">([\s\S]*?)<\/nav>/)?.[1] || '';
const navLabels = markup => [...markup.matchAll(/<a\s+href="[^"]+"[^>]*>([^<]+)<\/a>/g)].map(m => m[1]);
for (const [name, markup] of [['desktop', desktopNav], ['mobile', mobileNav]]) {
  const allLabels = navLabels(markup);
  const actual = allLabels.slice(0, siteMap.primaryNavigation.length).join('|');
  if (actual !== labels) failures.push(`${name} navigation does not match site map: ${actual}`);
  if (allLabels.some(label => ['Store','Software','Company'].includes(label))) failures.push(`${name} navigation contains retired labels.`);
}
if (!html.includes('<a href="/#company">Skunkworks</a>')) failures.push('Missing Skunkworks About link.');


// My Skunkworks: verify the same four destinations on all canonical-header pages.
const portalLinks = "<a href=\"https://myapps.microsoft.com/\">Employee / Microsoft 365</a><a href=\"/account/customer/\">Customer Portal</a><a href=\"/account/partner/\">Partner Portal</a><a href=\"https://portal.skunkworksacademy.com/\">Academy Portal</a>";
for (const file of ['index.html','global-presence/index.html','forms/index.html','forms/dynamics-training-licensing/index.html','licensing/index.html','licensing/microsoft-365/index.html','licensing/google-workspace/index.html']) {
  const page=fs.readFileSync(file,'utf8');
  requireText(page,'aria-label="My Skunkworks accounts and portals"','Account label missing: '+file);
  const account=page.match(/<details class="sk-dropdown sk-account">[\s\S]*?<div class="sk-dropdown-panel">([\s\S]*?)<\/div>/)?.[1];
  if(account!==portalLinks)failures.push('Account links differ: '+file);
  for(const label of ['Mobile navigation','Search results']){
    const nav=page.match(new RegExp('<nav aria-label="'+label+'">([\\s\\S]*?)<\\/nav>'))?.[1]||'';
    requireText(nav,portalLinks,'Portal destinations missing from '+label+': '+file);
  }
}
for(const kind of ['customer','partner']){
  const page=fs.readFileSync('account/'+kind+'/index.html','utf8');
  requireText(page,'data-portal="'+kind+'"','Missing portal identifier: '+kind);
  requireText(page,'data-launch hidden','Portal must fail closed without JavaScript: '+kind);
  requireText(page,'noindex,follow','Portal gateway must not be indexed: '+kind);
  requireText(page,'/account/launch.mjs','Missing portal launch script: '+kind);
}
const {verifiedDestination}=await import('../account/portal-config.mjs');
for(const kind of ['customer','partner']){
  const expected='https://'+kind+'.skunkworks.africa/';
  if(verifiedDestination(kind,expected)!==expected)failures.push('Valid portal destination rejected: '+kind);
  for(const bad of ['http://'+kind+'.skunkworks.africa/','https://evil.example/','https://'+kind+'.skunkworks.africa.evil.example/','https://attacker@'+kind+'.skunkworks.africa/','https://'+kind+'.skunkworks.africa/?next=evil','https://'+kind+'.skunkworks.africa/#evil','https://'+kind+'.skunkworks.africa/other'])if(verifiedDestination(kind,bad)!==null)failures.push('Invalid portal destination accepted');
}
if(verifiedDestination('unknown','https://customer.skunkworks.africa/')!==null)failures.push('Unknown portal accepted');


 // Licensing uses the same corporate shell and the published native brand components.
 for (const file of ['licensing/index.html','licensing/microsoft-365/index.html','licensing/google-workspace/index.html']) {
   const page = fs.readFileSync(file,'utf8');
   for (const marker of ['class="licensing-page"','/assets/brand-navigation-tokens.css','/assets/brand-navigation.css','/assets/brand-navigation.js','/vendor/skunkworks/components-1.0.0.css','data-sk-open="sk-navigation"','data-sk-open="sk-search"','data-sk-theme','aria-label="Breadcrumb"','class="sk-accordion"','data-skunkworks-footer-mount','/assets/skunkworks-global-footer.js','mailto:sales@skunkworks.africa','class="sk-button"']) {
     requireText(page,marker,'Licensing brand component missing: '+file+' '+marker);
   }
   const early = page.indexOf('<script src="/theme-init.js"></script>');
   if (early < 0 || early > page.indexOf('rel="stylesheet"')) failures.push('Licensing theme must initialize before CSS: '+file);
   if (page.includes('data-menu-button') || page.includes('class="site-header"')) failures.push('Legacy header on licensing page: '+file);
   if ((page.match(/<h1\b/g)||[]).length!==1) failures.push('Licensing must have one H1: '+file);
   const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
   if (new Set(ids).size!==ids.length) failures.push('Duplicate licensing ID: '+file);
   for(const m of page.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) for(const id of m[1].split(/\s+/)) if(!ids.includes(id)) failures.push('Missing licensing ARIA target: '+file+' '+id);
   if (file!=='licensing/index.html') {
     requireText(page,'class="lic-table-wrap sk-table-wrap" role="region"','Licensing comparison needs a labelled scroll region: '+file);
     const tableRegion = page.match(/<div\b[^>]*class="lic-table-wrap sk-table-wrap"[^>]*>/)?.[0] || '';
     requireText(tableRegion,'tabindex="0"','Licensing comparison must be keyboard-scrollable: '+file);
     requireText(page,'<caption>','Licensing comparison table needs a caption: '+file);
   }
 }
 const licensingCss=fs.readFileSync('licensing/licensing.css','utf8');
 for(const token of ['--sk-bg','--sk-text','--sk-border','--sk-focus','--sk-group-ink-navy','--sk-group-skunk-blue','--sk-group-signal-orange','--sk-space-16','--sk-radius']) requireText(licensingCss,'var('+token+')','Licensing CSS must use brand token '+token);
 if(/#[0-9a-fA-F]{3,8}\b/.test(licensingCss)) failures.push('Licensing CSS contains raw colour values.');
 requireText(licensingCss,'prefers-reduced-motion','Licensing must respect reduced motion.');

if(failures.length){console.error('Site validation failed:');for(const f of failures) console.error(`- ${f}`);process.exit(1)}
console.log('Site validation passed.');
console.log(`Validated ${files.length} required files, canonical routing, responsive navigation, sales automation controls and monochrome design rules.`);
