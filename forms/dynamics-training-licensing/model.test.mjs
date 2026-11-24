import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEnquiry, buildSummary, emailDraft } from './model.mjs';

function enquiry(entries = []) {
  const data = new FormData();
  for (const [key, value] of [['company', 'Example organisation'], ['contactName', 'Test contact'], ['email', 'test@example.com'], ['country', 'Zambia'], ['consent', 'on'], ...entries]) data.append(key, value);
  return buildEnquiry(data);
}

test('deselected service details and unrecognised fields never enter the summary', () => {
  const result = enquiry([['needs', 'discovery'], ['trainingGoals', 'Stale training answer'], ['licensingProducts', 'Stale licensing answer'], ['unknown', 'Private unrelated value']]);
  const text = buildSummary(result);
  assert.match(text, /Help defining our requirements/);
  assert.doesNotMatch(text, /Stale|Private unrelated|TRAINING REQUIREMENTS|LICENSING REQUIREMENTS/);
});

test('combined service requests retain all selected products and complete multiline answers', () => {
  const result = enquiry([['needs', 'training'], ['needs', 'licensing'], ['dynamicsProducts', 'Business Central'], ['dynamicsProducts', 'Not sure'], ['trainingGoals', 'Support our clients\nBuild practical skills'], ['licensingProducts', 'Need advice on 25 users'], ['vendors', 'Microsoft'], ['vendors', 'Google']]);
  const text = buildSummary(result);
  assert.match(text, /Business Central, Not sure/);
  assert.match(text, /Support our clients\nBuild practical skills/);
  assert.match(text, /Microsoft, Google/);
  assert.match(text, /Permission to process this enquiry and contact me: Yes/);
});

test('short email drafts encode the complete summary and keep a fixed recipient', () => {
  const result = enquiry([['needs', 'discovery'], ['outcomes', 'A&B + costs?']]);
  const draft = emailDraft(result, 10000);
  assert.equal(draft.includesSummary, true);
  const url = new URL(draft.href);
  assert.equal(url.pathname, 'sales@skunkworks.africa');
  assert.equal(url.searchParams.get('body'), buildSummary(result));
  assert.equal(url.searchParams.size, 2);
});

test('long answers remain intact and require copy/download instead of silent email truncation', () => {
  const value = 'Detailed client requirement. '.repeat(80);
  const result = enquiry([['needs', 'training'], ['trainingGoals', value]]);
  const draft = emailDraft(result);
  assert.equal(draft.includesSummary, false);
  assert.equal(new URL(draft.href).searchParams.has('body'), false);
  assert.ok(buildSummary(result).includes(value.trim()));
});

test('mail subject prevents CRLF header injection while preserving the company in the summary', () => {
  const data = new FormData();
  data.set('company', 'Example\r\nBcc: unwanted@example.com');
  const draft = emailDraft(buildEnquiry(data), 10000);
  const url = new URL(draft.href);
  assert.doesNotMatch(url.searchParams.get('subject'), /[\r\n]/);
  assert.equal(url.searchParams.has('bcc'), false);
});
