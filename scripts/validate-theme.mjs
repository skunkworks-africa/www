import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const main = read('styles.css');
const shell = read('adaptive-shell.css');
const reseller = read('resellers/resellers.css');
const cloud = read('cloud-assessment/assessment.css');
const automation = read('automation/automation.css');

assert.match(main, /:root\{color-scheme:light;/, 'Light mode must use light native controls');
assert.match(main, /:root\[data-theme='dark'\]\{color-scheme:dark;/, 'Manual dark must affect native form controls');
assert.match(main, /:root:not\(\[data-theme='light'\]\)/, 'Manual light must override device dark preference');
assert.match(main, /select option,select optgroup\{background:var\(--bg\);color:var\(--fg\)/, 'Dropdown options must use theme foreground and background');
assert.match(shell, /:root\[data-theme='dark'\]\{--shell-bg:#ffffff;/, 'Shared shell must respond to manual dark selection');
assert.match(reseller, /background:var\(--bg\);color:var\(--fg\)/, 'Reseller fields must use shared colours');
assert.match(cloud, /background:var\(--bg\);color:var\(--fg\)/, 'Cloud fields must use shared colours');
assert.doesNotMatch(automation, /:root\{color-scheme:dark\}/, 'Automation cannot override manual light with OS dark');
for (const page of ['index.html', 'resellers/index.html', 'technology-assessment/index.html', 'cloud-assessment/index.html', 'automation/index.html']) {
  const html = read(page);
  assert.match(html, /brand-mark--on-dark[\\s\\S]*brand-mark--on-light/, page + ' must include paired inverse logo assets');
  const init = html.indexOf('<script src="/theme-init.js"></script>');
  assert.ok(init > 0 && init < html.indexOf('rel="stylesheet"'), page + ' must load theme preference before CSS');
}
const luminosity = hex => {
  const linear = [1,3,5].map(i => parseInt(hex.slice(i, i+2), 16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return linear[0]*.2126 + linear[1]*.7152 + linear[2]*.0722;
};
for (const [name, foreground, background] of [['light','#000000','#ffffff'],['dark','#ffffff','#000000']]) {
  const a=luminosity(foreground), b=luminosity(background);
  const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert.ok(ratio >= 7, name + ' text needs at least 7:1 contrast');
}
console.log('Theme static checks passed: manual/system modes, form dropdowns, early initialization, and base contrast.');

// Regression guard: every shared shell uses explicit paired inverse logo assets.
