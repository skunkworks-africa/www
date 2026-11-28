import test from 'node:test';
import assert from 'node:assert/strict';
import {ConfigurationError, loadConfig} from '../src/config.mjs';
import {env, origin} from './helpers.mjs';

test('disabled is the default even without any infrastructure configuration', () => {
  assert.equal(loadConfig({}), null);
  assert.equal(loadConfig({...env, IBM_INTAKE_ENABLED: 'false'}), null);
  assert.equal(loadConfig({...env, IBM_INTAKE_ENABLED: 'TRUE'}), null);
});

test('enabled config requires every independently configured trust and persistence value', () => {
  assert.ok(loadConfig(env).allowedOrigins.has(origin));
  for (const field of Object.keys(env).filter(name => name !== 'IBM_INTAKE_ENABLED')) {
    const copy = {...env}; delete copy[field];
    assert.throws(() => loadConfig(copy), ConfigurationError, field);
  }
});

test('rejects wildcard origins, paths, credentials, ports and untrusted Dataverse destinations', () => {
  for (const value of ['*', 'http://forms.example.test', 'https://forms.example.test/', 'https://forms.example.test/path', 'https://user@forms.example.test', 'https://forms.example.test:8443', `${origin},`]) {
    assert.throws(() => loadConfig({...env, IBM_ALLOWED_ORIGINS: value}), ConfigurationError, value);
  }
  for (const value of ['https://evil.example', 'https://test.crm14.dynamics.com.evil.example', 'https://test.crm14.dynamics.com/path', 'http://test.crm14.dynamics.com', 'https://user@test.crm14.dynamics.com']) {
    assert.throws(() => loadConfig({...env, IBM_DATAVERSE_URL: value}), ConfigurationError, value);
  }
});

test('rejects path injection, colliding column mappings and broad Microsoft API audiences', () => {
  assert.throws(() => loadConfig({...env, IBM_DATAVERSE_ENTITY_SET: 'accounts?$select=name'}), ConfigurationError);
  assert.throws(() => loadConfig({...env, IBM_DATAVERSE_PAYLOAD_COLUMN: env.IBM_DATAVERSE_DIGEST_COLUMN}), ConfigurationError);
  assert.throws(() => loadConfig({...env, IBM_INTAKE_API_AUDIENCE: 'https://management.azure.com/'}), ConfigurationError);
  assert.throws(() => loadConfig({...env, IBM_MANAGED_IDENTITY_CLIENT_ID: 'guess'}), ConfigurationError);
});
