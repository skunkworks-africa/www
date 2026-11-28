import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  ContractError, FIELD_DEFINITIONS, FORM_ID, SCHEMA_VERSION,
  mapLegacyFormData, validateSubmission,
} from '../src/contract.mjs';

const privacyVersion = 'synthetic-review-v1';
const options = {privacyVersion};
const valid = () => ({
  schemaVersion: SCHEMA_VERSION,
  formId: FORM_ID,
  language: 'en-ZA',
  privacy: {version: privacyVersion, acknowledged: true},
  fields: {
    legalCompanyName: 'Synthetic Company (Pty) Ltd',
    contactName: 'Synthetic Contact',
    businessEmail: 'test@example.com',
    accuracyConfirmed: true,
  },
});
const validateFields = fields => validateSubmission({...valid(), fields: {...valid().fields, ...fields}}, options);
const invalid = (input, field) => assert.throws(() => validateSubmission(input, options), error => {
  assert.ok(error instanceof ContractError);
  assert.equal(error.status, 400);
  if (field) assert.ok(error.fieldErrors[field], `Expected validation error for ${field}`);
  return true;
});
const invalidFields = (fields, field) => invalid({...valid(), fields: {...valid().fields, ...fields}}, field);
const legacy = () => new URLSearchParams({
  q0: 'Synthetic Company (Pty) Ltd', q1: 'Synthetic Contact', q2: 'test@example.com',
  q70: 'Yes', q71: 'Acknowledged',
});
const migrationOptions = {privacyVersion, language: 'en-ZA', onlinePrivacyAcknowledged: true};

test('every current form row has an audited stable mapping; preview acknowledgement is excluded', () => {
  const html = readFileSync(new URL('../../../forms/ibm/storage-protect/index.html', import.meta.url), 'utf8');
  const match = html.match(/const rows=(\[.*?\]);const f=/s);
  assert.ok(match, 'The form representation changed; review the migration adapter.');
  const rows = JSON.parse(match[1]);
  assert.equal(rows.length, 72);
  assert.equal(FIELD_DEFINITIONS.length, rows.length);
  const names = new Set();
  FIELD_DEFINITIONS.forEach((field, index) => {
    const [label, , , type, condition] = rows[index];
    assert.equal(field.index, index);
    assert.equal(field.label, label);
    assert.equal(field.condition, condition);
    const expectedType = index === 70 ? 'confirmation' : type.startsWith('multi:') ? 'multi'
      : type.includes('|') ? 'enum' : type === 'number' ? 'integer' : type;
    assert.equal(field.type, expectedType);
    if (field.previewOnly) {
      assert.equal(index, 71);
      assert.equal(field.key, null);
    } else {
      assert.match(field.key, /^[a-z][A-Za-z0-9]*$/);
      assert.ok(!names.has(field.key));
      names.add(field.key);
    }
    if (type.includes('|')) {
      const values = type.replace(/^multi:/, '').split('|').map(value => {
        const translated = value.split('/');
        return translated.length === 3 ? translated[0] : value;
      });
      assert.deepEqual(field.values, values);
    }
  });
  assert.equal(names.size, 71);
  assert.ok(Object.isFrozen(FIELD_DEFINITIONS));
  assert.ok(FIELD_DEFINITIONS.every(Object.isFrozen));
  assert.ok(FIELD_DEFINITIONS.filter(field => field.values).every(field => Object.isFrozen(field.values)));
});

test('minimal valid payload is canonical and does not modify caller input', () => {
  const input = valid();
  const before = structuredClone(input);
  assert.deepEqual(validateSubmission(input, options), input);
  assert.deepEqual(input, before);
  assert.deepEqual(validateFields({country: ' ', workloads: []}).fields, valid().fields);
});

test('all three supported languages retain the same business data keys', () => {
  for (const language of ['en-ZA', 'fr', 'pt-PT']) {
    assert.equal(validateSubmission({...valid(), language}, options).language, language);
  }
  invalid({...valid(), language: 'en'}, 'language');
  invalid({...valid(), schemaVersion: '2'}, 'schemaVersion');
  invalid({...valid(), formId: 'reseller'}, 'formId');
});

test('reviewed online privacy version is required independently of preview acknowledgement', () => {
  for (const privacy of [undefined, null, {}, {version: privacyVersion, acknowledged: false},
    {version: 'older', acknowledged: true}, {version: privacyVersion, acknowledged: 'true'},
    {version: privacyVersion, acknowledged: true, extra: true}]) {
    invalid({...valid(), privacy}, 'privacy');
  }
  assert.throws(() => validateSubmission(valid()), /reviewed online privacy version/);
  assert.throws(() => validateSubmission(valid(), {privacyVersion: ' bad version '}), /reviewed online privacy version/);
  assert.throws(() => mapLegacyFormData(legacy(), options), error => !!error.fieldErrors?.privacy);
});

test('company, contact, email and accuracy confirmation are mandatory', () => {
  for (const key of ['legalCompanyName', 'contactName', 'businessEmail', 'accuracyConfirmed']) {
    const input = valid();
    delete input.fields[key];
    invalid(input, `fields.${key}`);
  }
  for (const value of [false, 'Yes', 'true', 1, null]) {
    invalidFields({accuracyConfirmed: value}, 'fields.accuracyConfirmed');
  }
  invalidFields({legalCompanyName: '   '}, 'fields.legalCompanyName');
});

test('unknown fields, envelopes, attachments and prototype-like keys are rejected', () => {
  invalid({...valid(), extra: 'unexpected'}, 'body');
  invalidFields({personalIdentityDocument: 'not permitted'}, 'fields');
  invalidFields({q0: 'positional keys are not the API contract'}, 'fields');
  invalidFields({businessEmail: ['test@example.com']}, 'fields.businessEmail');
  const input = valid();
  input.fields = {...input.fields, ...JSON.parse('{"__proto__":{"polluted":true}}')};
  invalid(input, 'fields');
  for (const fields of [null, [], 'text', 1]) invalid({...valid(), fields}, 'fields');
  for (const input of [null, [], 'text', 1]) invalid(input, 'body');
  assert.equal({}.polluted, undefined);
});

test('Unicode is normalised without losing meaningful names; lengths and control characters are bounded', () => {
  assert.equal(validateFields({contactName: '  Jose\u0301 橋本  '}).fields.contactName, 'José 橋本');
  assert.equal(validateFields({additionalRequirements: 'first\r\nsecond\rthird'}).fields.additionalRequirements, 'first\nsecond\nthird');
  assert.equal(validateFields({tradingName: '🙂'.repeat(2000)}).fields.tradingName.length, 4000);
  invalidFields({tradingName: 'x'.repeat(2001)}, 'fields.tradingName');
  invalidFields({contactName: 'name\u0000value'}, 'fields.contactName');
  invalidFields({contactName: 'name\nvalue'}, 'fields.contactName');
  invalidFields({contactName: '\uD800'}, 'fields.contactName');
  invalidFields({registeredBusinessAddress: 'bad\u001Ftext'}, 'fields.registeredBusinessAddress');
});

test('email validation rejects malformed mailbox data and accepts conventional and IDN domains', () => {
  for (const email of ['person+sales@example.co.za', 'first.last@bücher.example']) {
    assert.equal(validateFields({businessEmail: email}).fields.businessEmail, email);
  }
  for (const email of ['invalid', '.person@example.com', 'a..b@example.com', 'person@-example.com',
    'person@example..com', 'person@example.com/path', 'person@localhost', 'Name <person@example.com>',
    'person@example.com:443', 'person@%65xample.com', 'person@127.0.0.1']) {
    invalidFields({businessEmail: email}, 'fields.businessEmail');
  }
});

test('numeric types are nonnegative, finite and safe; whole-number fields reject fractions', () => {
  assert.equal(validateFields({physicalHosts: 0}).fields.physicalHosts, 0);
  assert.equal(validateFields({activeSourceDataTb: 0.125}).fields.activeSourceDataTb, 0.125);
  assert.equal(validateFields({activeSourceDataTb: -0}).fields.activeSourceDataTb, 0);
  for (const number of [-1, Infinity, -Infinity, NaN, '12', null, Number.MAX_SAFE_INTEGER + 1]) {
    invalidFields({activeSourceDataTb: number}, 'fields.activeSourceDataTb');
  }
  invalidFields({physicalHosts: 2.5}, 'fields.physicalHosts');
});

test('calendar dates and website URLs are strictly validated without fetching a website', () => {
  for (const date of ['2024-02-29', '2000-02-29', '2027-12-31']) {
    assert.equal(validateFields({supportExpiryDate: date}).fields.supportExpiryDate, date);
  }
  for (const date of ['2025-02-29', '2100-02-29', '2027-04-31', '2027-13-01', '2027-01-00',
    '0000-01-01', '27/11/2026', '2026-11-27T00:00:00Z']) {
    invalidFields({supportExpiryDate: date}, 'fields.supportExpiryDate');
  }
  for (const url of ['https://example.com/', 'http://example.co.za/business', 'https://bücher.example/']) {
    assert.equal(validateFields({companyWebsite: url}).fields.companyWebsite, url);
  }
  for (const url of ['javascript:alert(1)', 'file:///tmp/test', '//example.com', 'www.example.com',
    'https://user:password@example.com', 'https://example.com/bad path', 'https:\\example.com']) {
    invalidFields({companyWebsite: url}, 'fields.companyWebsite');
  }
});

test('current offering/metric rules reject mismatches and retain explicit uncertainty', () => {
  for (const [offering, metric] of [
    ['IBM Storage Protect Extended Edition (5725-W99)', 'PVU'],
    ['IBM Storage Protect Extended Edition (5725-W99)', 'Client Device'],
    ['IBM Storage Protect Suite – Front End', 'Front-end TB'],
    ['IBM Storage Protect Suite', 'Back-end TB'],
    ['IBM Storage Protect Suite Entry – Front End', 'Front-end TB'],
    ['IBM Storage Protect Suite Entry', 'Back-end TB'],
    ['IBM Storage Protect (other entitlement)', 'PVU'],
    ['Unknown', 'Unknown'],
  ]) assert.equal(validateFields({offering, licensingMetric: metric}).fields.licensingMetric, metric);
  invalidFields({offering: 'IBM Storage Protect Suite', licensingMetric: 'PVU'}, 'fields.licensingMetric');
  invalidFields({offering: 'Unknown product'}, 'fields.offering');
  assert.equal(validateFields({offering: 'IBM Storage Protect Suite', licensingMetric: 'Unknown'}).fields.licensingMetric, 'Unknown');
  invalidFields({licensingMetric: 'Client Device', cpuModels: 'Synthetic CPU'}, 'fields.cpuModels');
  assert.equal(validateFields({licensingMetric: 'PVU', cpuModels: 'Synthetic CPU'}).fields.cpuModels, 'Synthetic CPU');
});

test('checkbox options are validated, unique and canonicalised for stable idempotency digests', () => {
  assert.deepEqual(validateFields({workloads: ['Azure', 'VMware']}).fields.workloads, ['VMware', 'Azure']);
  invalidFields({workloads: ['Azure', 'Azure']}, 'fields.workloads');
  invalidFields({workloads: ['Unknown workload']}, 'fields.workloads');
  invalidFields({workloads: 'Azure'}, 'fields.workloads');
  const first = validateFields({workloads: ['Azure', 'VMware'], country: 'Namibia'});
  const reversed = {...valid(), fields: Object.fromEntries(Object.entries({
    ...valid().fields, country: 'Namibia', workloads: ['VMware', 'Azure'],
  }).reverse())};
  assert.equal(JSON.stringify(validateSubmission(reversed, options)), JSON.stringify(first));
});

test('migration adapter converts every existing field and never carries preview acknowledgement to API', () => {
  const data = new URLSearchParams();
  for (const field of FIELD_DEFINITIONS) {
    const name = `q${field.index}`;
    if (field.values) data.append(name, field.values[0]);
    else if (['integer', 'decimal'].includes(field.type)) data.append(name, '12');
    else if (field.type === 'date') data.append(name, '2027-01-01');
    else if (field.type === 'email') data.append(name, 'test@example.com');
    else if (field.type === 'url') data.append(name, 'https://example.com/');
    else data.append(name, 'Synthetic value');
  }
  const payload = mapLegacyFormData(data, migrationOptions);
  assert.equal(Object.keys(payload.fields).length, 71);
  assert.equal(payload.fields.accuracyConfirmed, true);
  assert.equal(payload.fields.physicalHosts, 12);
  assert.deepEqual(payload.fields.hypervisors, ['VMware ESXi']);
  assert.equal(payload.fields.previewPrivacyAcknowledgement, undefined);
  assert.equal(Object.keys(payload.fields).some(key => /^q\d+$/.test(key)), false);
});

test('migration adapter drops stale disabled processor inputs and does not convert blanks to zero', () => {
  const data = legacy();
  data.set('q7', 'Front-end TB');
  data.set('q9', 'stale hidden CPU');
  data.set('q10', '3');
  data.set('q16', '');
  data.set('q17', '2.5');
  const fields = mapLegacyFormData(data, migrationOptions).fields;
  assert.equal(fields.cpuModels, undefined);
  assert.equal(fields.physicalHosts, undefined);
  assert.equal(fields.activeSourceDataTb, undefined);
  assert.equal(fields.backendOccupiedCapacityTb, 2.5);
});

test('migration adapter rejects duplicate scalar values, unsupported fields, attachments and non-decimal numerics', () => {
  const duplicate = legacy();
  duplicate.append('q2', 'second@example.com');
  assert.throws(() => mapLegacyFormData(duplicate, migrationOptions), ContractError);
  const unknown = legacy();
  unknown.append('privateKey', 'not allowed');
  assert.throws(() => mapLegacyFormData(unknown, migrationOptions), ContractError);
  const attached = new FormData();
  attached.append('q0', new Blob(['synthetic']), 'test.txt');
  assert.throws(() => mapLegacyFormData(attached, migrationOptions), ContractError);
  for (const value of ['0x10', 'NaN', 'Infinity', '1,2', '1e999', '-1']) {
    const data = legacy();
    data.set('q16', value);
    assert.throws(() => mapLegacyFormData(data, migrationOptions), ContractError);
  }
});
