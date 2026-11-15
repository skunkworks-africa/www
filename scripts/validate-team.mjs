import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { members } from '../team-members.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../team.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../team.css', import.meta.url), 'utf8');
assert.ok(members.length >= 3, 'Show several team members');
assert.match(html, /id="team"/, 'Team directory must have a shareable section anchor');
assert.match(html, /id="contact"/, 'Existing contact anchor must remain');
assert.ok(html.indexOf('id="team"') < html.indexOf('id="contact"'), 'Place directory before contact');
assert.match(html, /data-team-grid/, 'Directory mount must exist');
assert.match(html, /data-member-profile/, 'Profile view must exist');
assert.match(html, /type="module" src="\/team.js"/, 'Module must load');
assert.match(script, /addEventListener\('hashchange', route\)/, 'Deep links must handle hash changes');
assert.match(script, /company\//, 'Deep links must use company/<slug> route');
assert.match(script, /section.hidden = isProfile/, 'Homepage must yield to a profile view');
assert.match(css, /section\[hidden\]/, 'Author styles must honour hidden homepage sections');

const slugs = new Set();
for (const member of members) {
  assert.match(member.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Safe canonical profile slug');
  assert.ok(!slugs.has(member.slug), 'Duplicate team slug');
  slugs.add(member.slug);
  for (const field of ['name','initials','title','group','summary','biography']) {
    assert.ok(typeof member[field] === 'string' && member[field].trim(), member.slug + ' lacks ' + field);
  }
  assert.ok(Array.isArray(member.skills) && member.skills.length >= 3, member.slug + ' requires skillsets');
  assert.ok(Array.isArray(member.responsibilities) && member.responsibilities.length >= 2, member.slug + ' requires profile detail');
  for (const entry of member.responsibilities) {
    assert.ok(entry.heading && entry.detail, member.slug + ' has incomplete role detail');
  }
  if (member.publicLink) {
    assert.match(member.publicLink.url, /^https:\/\//, 'External professional links must use HTTPS');
  }
}
assert.ok(slugs.has('raydo-matthee'), 'Required Raydo route is missing');
for (const removedSlug of ['bradley-nel', 'dan-opiyo', 'jolandi-van-heerden']) {
  assert.ok(!slugs.has(removedSlug), 'Removed member must not be publicly listed: ' + removedSlug);
}
console.log('Team directory checks passed: ' + members.length + ' profiles, routes and profile detail.');
