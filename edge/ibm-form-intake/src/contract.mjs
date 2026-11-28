/**
 * Versioned business-data contract for the existing IBM Storage Protect form.
 * Values mirror the current form; this is not IBM licensing/entitlement validation.
 * qN indexes are used only by the migration adapter. API records use named keys.
 * No uploads, personal identity document fields, runtime secrets or credentials.
 */
export const FORM_ID = 'ibm-storage-protect';
export const SCHEMA_VERSION = '1';
export const LANGUAGES = Object.freeze(['en-ZA', 'fr', 'pt-PT']);

const definitions = [
  {"index":0,"key":"legalCompanyName","label":"Registered legal company name","type":"text","required":true,"maxLength":2000},
  {"index":1,"key":"contactName","label":"Contact","type":"text","required":true,"maxLength":2000},
  {"index":2,"key":"businessEmail","label":"Business email","type":"email","required":true,"maxLength":254},
  {"index":3,"key":"country","label":"Country","type":"text","maxLength":2000},
  {"index":4,"key":"purchaseType","label":"Purchase type","type":"enum","values":["New deployment","Expansion","Renewal","Migration","Support reinstatement","Trade-up"]},
  {"index":5,"key":"offering","label":"Offering","type":"enum","values":["IBM Storage Protect Extended Edition (5725-W99)","IBM Storage Protect Suite – Front End","IBM Storage Protect Suite","IBM Storage Protect Suite Entry – Front End","IBM Storage Protect Suite Entry","IBM Storage Protect (other entitlement)","Unknown"]},
  {"index":6,"key":"existingVersionAndEntitlement","label":"Existing version and entitlement reference (if available)","type":"text","maxLength":2000},
  {"index":7,"key":"licensingMetric","label":"Licensing metric (subject to IBM validation)","type":"enum","values":["PVU","Client Device","Front-end TB","Back-end TB","Unknown"]},
  {"index":8,"key":"processorManufacturer","label":"Processor manufacturer","type":"enum","values":["Intel","AMD","IBM POWER","Other","Unknown"],"condition":"cpu"},
  {"index":9,"key":"cpuModels","label":"Exact CPU model(s)","type":"text","condition":"cpu","maxLength":2000},
  {"index":10,"key":"physicalHosts","label":"Physical hosts","type":"integer","condition":"cpu"},
  {"index":11,"key":"socketsPerHost","label":"Sockets per host","type":"integer","condition":"cpu"},
  {"index":12,"key":"coresPerSocket","label":"Cores per socket","type":"integer","condition":"cpu"},
  {"index":13,"key":"allocatedVirtualCores","label":"Allocated virtual cores","type":"integer","condition":"cpu"},
  {"index":14,"key":"capacityScope","label":"Capacity scope","type":"enum","values":["Full capacity","Sub-capacity","Unknown"],"condition":"cpu"},
  {"index":15,"key":"ilmtStatus","label":"ILMT status","type":"enum","values":["Deployed","Partial","Not deployed","Unknown"],"condition":"cpu"},
  {"index":16,"key":"activeSourceDataTb","label":"Active source data (TB, before reduction)","type":"decimal"},
  {"index":17,"key":"backendOccupiedCapacityTb","label":"Back-end occupied capacity (TB)","type":"decimal"},
  {"index":18,"key":"annualGrowthPercent","label":"Annual growth (%)","type":"decimal"},
  {"index":19,"key":"planningHorizonYears","label":"Planning horizon","type":"enum","values":["1","3","5"]},
  {"index":20,"key":"dailyRetentionDays","label":"Daily retention (days)","type":"integer"},
  {"index":21,"key":"weeklyRetentionWeeks","label":"Weekly retention (weeks)","type":"integer"},
  {"index":22,"key":"monthlyRetentionMonths","label":"Monthly retention (months)","type":"integer"},
  {"index":23,"key":"yearlyRetentionYears","label":"Yearly retention (years)","type":"integer"},
  {"index":24,"key":"vmProvisioning","label":"VM provisioning","type":"enum","values":["Thin","Thick","Mixed","Not applicable","Unknown"]},
  {"index":25,"key":"hypervisors","label":"Hypervisors","type":"multi","values":["VMware ESXi","Hyper-V","KVM","PowerVM","Nutanix AHV","Other"]},
  {"index":26,"key":"operatingSystems","label":"Operating systems","type":"multi","values":["Windows Server","Linux","AIX","IBM i","Other"]},
  {"index":27,"key":"workloads","label":"Workloads","type":"multi","values":["VMware","Microsoft 365","Salesforce","AWS","Azure","Kubernetes","SQL Server","Oracle","SAP HANA","Db2","File servers","Other"]},
  {"index":28,"key":"virtualServers","label":"Virtual servers","type":"integer"},
  {"index":29,"key":"physicalServers","label":"Physical servers","type":"integer"},
  {"index":30,"key":"storageTargets","label":"Storage targets","type":"multi","values":["IBM FlashSystem","Disk","Tape","Object storage","Cloud"]},
  {"index":31,"key":"integrationRequirements","label":"Integration requirements","type":"multi","values":["Hardware snapshots","SAN LAN-free","Shared tape library","LAN-free data movers"]},
  {"index":32,"key":"dataReduction","label":"Data reduction","type":"multi","values":["Deduplication","Compression","None","Unknown"]},
  {"index":33,"key":"cyberResilience","label":"Cyber resilience","type":"multi","values":["Air gap","Immutable backups","Encryption","MFA","Recovery testing"]},
  {"index":34,"key":"secondaryDrReplication","label":"Secondary DR replication","type":"enum","values":["Yes","No","Unknown"]},
  {"index":35,"key":"recoveryPointObjectiveHours","label":"Recovery point objective (hours)","type":"decimal"},
  {"index":36,"key":"recoveryTimeObjectiveHours","label":"Recovery time objective (hours)","type":"decimal"},
  {"index":37,"key":"commercialPreference","label":"Commercial preference","type":"enum","values":["Perpetual + S&S","Subscription","Term","Unknown"]},
  {"index":38,"key":"preferredTermMonths","label":"Preferred term (months)","type":"enum","values":["12","24","36","60","Unknown"]},
  {"index":39,"key":"additionalRequirements","label":"Additional requirements or mixed host configurations","type":"textarea","maxLength":2000},
  {"index":40,"key":"passportAdvantageSiteNumber","label":"Passport Advantage site number (optional)","type":"text","maxLength":2000},
  {"index":41,"key":"existingIbmPartNumbers","label":"Existing IBM part numbers","type":"text","maxLength":2000},
  {"index":42,"key":"existingEntitlementQuantity","label":"Existing entitlement quantity","type":"integer"},
  {"index":43,"key":"supportExpiryDate","label":"Support expiry date","type":"date"},
  {"index":44,"key":"clientDevices","label":"Client devices requiring protection","type":"integer"},
  {"index":45,"key":"ilmtVersionAndReportDate","label":"ILMT version and last report date","type":"text","maxLength":2000},
  {"index":46,"key":"operationsCenterReportAvailable","label":"Operations Center capacity report available?","type":"enum","values":["Yes","No","Unknown"]},
  {"index":47,"key":"nonReportingClients","label":"Non-reporting clients","type":"integer"},
  {"index":48,"key":"archiveCapacityTb","label":"Archive capacity (TB)","type":"decimal"},
  {"index":49,"key":"primaryPoolCapacityTb","label":"Primary storage pool capacity (TB)","type":"decimal"},
  {"index":50,"key":"replicationTargetCapacityTb","label":"Replication target capacity (TB)","type":"decimal"},
  {"index":51,"key":"additionalIbmComponents","label":"Additional IBM components (subject to entitlement)","type":"multi","values":["IBM Storage Protect Plus","IBM Storage Protect for Virtual Environments","IBM Storage Protect for Databases","IBM Storage Protect for Mail","Other"]},
  {"index":52,"key":"quotationCurrency","label":"Quotation currency","type":"enum","values":["ZAR","USD","EUR","XAF","XOF","AOA","MZN","Other"]},
  {"index":53,"key":"requiredDeliveryDate","label":"Required delivery date","type":"date"},
  {"index":54,"key":"supportRequirements","label":"Support requirements","type":"enum","values":["IBM standard support","Partner managed support","Unknown"]},
  {"index":55,"key":"ibmCustomerStatus","label":"IBM customer status","type":"enum","values":["New","Existing","Unknown"]},
  {"index":56,"key":"tradingName","label":"Trading name","type":"text","maxLength":2000},
  {"index":57,"key":"companyRegistrationNumber","label":"Company registration number","type":"text","maxLength":2000},
  {"index":58,"key":"businessTaxId","label":"Tax identification number (business only)","type":"text","maxLength":2000},
  {"index":59,"key":"registeredBusinessAddress","label":"Registered business address","type":"textarea","maxLength":2000},
  {"index":60,"key":"companyWebsite","label":"Company website","type":"url","maxLength":2000},
  {"index":61,"key":"industryAndBusinessActivities","label":"Industry and business activities","type":"text","maxLength":2000},
  {"index":62,"key":"representativeRole","label":"Authorised representative role","type":"text","maxLength":2000},
  {"index":63,"key":"procurementEmail","label":"Procurement contact (business email)","type":"email","maxLength":254},
  {"index":64,"key":"ibmCustomerNumber","label":"IBM customer number (if known)","type":"text","maxLength":2000},
  {"index":65,"key":"endUserRelationship","label":"End-user relationship","type":"enum","values":["Direct end user","Reseller","Other intermediary"]},
  {"index":66,"key":"endUserOrganisationAndAddress","label":"End-user legal organisation and address (if different)","type":"textarea","maxLength":2000},
  {"index":67,"key":"deploymentCountries","label":"Deployment country or countries","type":"text","maxLength":2000},
  {"index":68,"key":"intendedSoftwareUse","label":"Intended software use","type":"textarea","maxLength":2000},
  {"index":69,"key":"knownExportRestrictions","label":"Export control or sanctions restrictions known?","type":"enum","values":["Yes","No","Unknown"]},
  {"index":70,"key":"accuracyConfirmed","label":"Confirm information is accurate to the best of your knowledge","type":"confirmation","values":["Yes","No"],"required":true},
  {"index":71,"key":null,"label":"Privacy acknowledgement: this preview stores no submissions on a server; downloaded files contain business information. Do not enter personal identity numbers or upload documents.","type":"enum","values":["Acknowledged","Not acknowledged"],"previewOnly":true}
];

export const FIELD_DEFINITIONS = Object.freeze(definitions.map(definition =>
  Object.freeze({...definition, ...(definition.values ? {values: Object.freeze(definition.values)} : {})})
));

const activeDefinitions = FIELD_DEFINITIONS.filter(field => !field.previewOnly);
const fieldNames = new Set(activeDefinitions.map(field => field.key));
const envelopeNames = new Set(['schemaVersion', 'formId', 'language', 'privacy', 'fields']);
const nonCpuMetrics = new Set(['Client Device', 'Front-end TB', 'Back-end TB']);
const offeringMetrics = new Map([
  ['IBM Storage Protect Extended Edition (5725-W99)', ['PVU', 'Client Device']],
  ['IBM Storage Protect Suite – Front End', ['Front-end TB']],
  ['IBM Storage Protect Suite', ['Back-end TB']],
  ['IBM Storage Protect Suite Entry – Front End', ['Front-end TB']],
  ['IBM Storage Protect Suite Entry', ['Back-end TB']],
]);

export class ContractError extends Error {
  constructor(message = 'Check the assessment fields.', fieldErrors = {}) {
    super(message);
    this.name = 'ContractError';
    this.status = 400;
    this.fieldErrors = Object.freeze({...fieldErrors});
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function hasUnsupportedKeys(value, allowed) {
  return Object.keys(value).some(key => !allowed.has(key));
}

function requirePrivacyConfiguration(privacyVersion) {
  if (typeof privacyVersion !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(privacyVersion)) {
    // A missing reviewed version is a server configuration fault, not client consent.
    throw new Error('A reviewed online privacy version must be configured.');
  }
}

function cleanText(value, {maxLength = 2000, multiline = false} = {}) {
  if (typeof value !== 'string' || value.length > maxLength * 2) return null;
  // Reject malformed UTF-16 rather than silently replacing characters during persistence.
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) return null;
  const text = value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if ([...text].length > maxLength || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(text)) return null;
  if (!multiline && /[\n\t]/u.test(text)) return null;
  return text;
}

function validEmail(value) {
  // Conventional mailbox syntax; no display names, comments or quoted local parts.
  const parts = value.split('@');
  if (parts.length !== 2 || parts[0].length > 64 || value.length > 254) return false;
  if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(parts[0])) return false;
  let domain;
  try { domain = new URL(`https://${parts[1]}`).hostname; } catch { return false; }
  // URL syntax such as ports, credentials, paths or query strings is not email syntax.
  if (/[\s/:?#@%\[\]\\]/u.test(parts[1]) || !domain.includes('.') || domain.endsWith('.')) return false;
  if (domain.length > 253 || /^\d+(?:\.\d+){3}$/.test(domain)) return false;
  return domain.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function validWebsite(value) {
  try {
    const url = new URL(value);
    return /^https?:\/\//i.test(value) && ['https:', 'http:'].includes(url.protocol)
      && !!url.hostname && !url.username && !url.password && !/[\s\\]/u.test(value);
  } catch { return false; }
}

/**
 * Validate untrusted parsed JSON and return a deterministically ordered payload.
 * Omitted optional values stay omitted. Unknown keys and wrong JSON types fail.
 * privacyVersion is a reviewed, operator-configured version, never a client default.
 */
export function validateSubmission(input, {privacyVersion} = {}) {
  requirePrivacyConfiguration(privacyVersion);
  if (!isRecord(input)) throw new ContractError('An assessment object is required.', {body: 'Use a JSON object.'});
  const errors = {};
  if (hasUnsupportedKeys(input, envelopeNames)) errors.body = 'Unsupported assessment properties.';
  if (input.schemaVersion !== SCHEMA_VERSION) errors.schemaVersion = 'Unsupported assessment version.';
  if (input.formId !== FORM_ID) errors.formId = 'Unsupported assessment form.';
  if (!LANGUAGES.includes(input.language)) errors.language = 'Select a supported form language.';
  if (!isRecord(input.privacy) || hasUnsupportedKeys(input.privacy, new Set(['version', 'acknowledged']))
      || input.privacy.version !== privacyVersion || input.privacy.acknowledged !== true) {
    errors.privacy = 'Acknowledge the current online submission privacy notice.';
  }
  if (!isRecord(input.fields)) {
    errors.fields = 'Assessment fields must be an object.';
    throw new ContractError(undefined, errors);
  }
  if (hasUnsupportedKeys(input.fields, fieldNames)) errors.fields = 'Unsupported assessment fields.';

  const fields = {};
  for (const definition of activeDefinitions) {
    const {key, type, required} = definition;
    const path = `fields.${key}`;
    if (!Object.hasOwn(input.fields, key)) {
      if (required) errors[path] = 'This field is required.';
      continue;
    }
    const raw = input.fields[key];
    if (type === 'confirmation') {
      if (raw !== true) errors[path] = 'Confirm that the information is accurate to the best of your knowledge.';
      else fields[key] = true;
      continue;
    }
    if (type === 'integer' || type === 'decimal') {
      if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0 || raw > Number.MAX_SAFE_INTEGER
          || (type === 'integer' && !Number.isSafeInteger(raw))) {
        errors[path] = type === 'integer' ? 'Enter a non-negative whole number within the supported range.'
          : 'Enter a finite non-negative number within the supported range.';
      } else fields[key] = Object.is(raw, -0) ? 0 : raw;
      continue;
    }
    if (type === 'multi') {
      if (!Array.isArray(raw) || raw.length > definition.values.length
          || raw.some(value => typeof value !== 'string' || !definition.values.includes(value))
          || new Set(raw).size !== raw.length) {
        errors[path] = 'Select supported options without duplicates.';
      } else if (raw.length) {
        fields[key] = definition.values.filter(value => raw.includes(value));
      }
      continue;
    }
    const value = cleanText(raw, {maxLength: definition.maxLength, multiline: type === 'textarea'});
    if (value === null) {
      errors[path] = 'Enter text within the supported length without control characters.';
      continue;
    }
    if (!value) {
      if (required) errors[path] = 'This field is required.';
      continue;
    }
    if (type === 'enum' && !definition.values.includes(value)) errors[path] = 'Select a supported option.';
    else if (type === 'email' && !validEmail(value)) errors[path] = 'Enter a valid email address without a display name.';
    else if (type === 'date' && !validDate(value)) errors[path] = 'Enter a real calendar date in YYYY-MM-DD format.';
    else if (type === 'url' && !validWebsite(value)) errors[path] = 'Enter an absolute HTTP or HTTPS website URL without credentials.';
    else fields[key] = value;
  }

  const allowedMetrics = offeringMetrics.get(fields.offering);
  if (allowedMetrics && fields.licensingMetric && fields.licensingMetric !== 'Unknown'
      && !allowedMetrics.includes(fields.licensingMetric)) {
    errors['fields.licensingMetric'] = 'The selected metric does not match the current form offering options.';
  }
  if (nonCpuMetrics.has(fields.licensingMetric)) {
    for (const {key, condition} of activeDefinitions) {
      if (condition === 'cpu' && Object.hasOwn(fields, key)) {
        errors[`fields.${key}`] = 'Omit processor fields for the selected licensing metric.';
      }
    }
  }
  if (Object.keys(errors).length) throw new ContractError(undefined, errors);
  return {
    schemaVersion: SCHEMA_VERSION,
    formId: FORM_ID,
    language: input.language,
    privacy: {version: privacyVersion, acknowledged: true},
    fields,
  };
}

/**
 * Migration adapter for the current q0...q71 browser FormData. It does not submit.
 * The current preview acknowledgement (q71) is deliberately never online consent.
 * Only a future UI displaying the reviewed online notice may provide the separate
 * onlinePrivacyAcknowledged flag. Existing preview pages remain download-only.
 */
export function mapLegacyFormData(data, {privacyVersion, language = 'en-ZA', onlinePrivacyAcknowledged = false} = {}) {
  requirePrivacyConfiguration(privacyVersion);
  if (onlinePrivacyAcknowledged !== true) {
    throw new ContractError(undefined, {privacy: 'A separate online privacy acknowledgement is required.'});
  }
  if (!data || typeof data.entries !== 'function' || typeof data.getAll !== 'function') {
    throw new ContractError('FormData is required.', {body: 'Use the current assessment FormData.'});
  }
  const supportedNames = new Set(FIELD_DEFINITIONS.map(field => `q${field.index}`));
  for (const [name, value] of data.entries()) {
    if (!supportedNames.has(name) || typeof value !== 'string') {
      throw new ContractError(undefined, {fields: 'Unsupported form field or attachment.'});
    }
  }
  const fields = {};
  const rawMetric = data.getAll('q7')[0];
  for (const definition of FIELD_DEFINITIONS) {
    if (definition.previewOnly || (definition.condition === 'cpu' && nonCpuMetrics.has(rawMetric))) continue;
    const values = data.getAll(`q${definition.index}`);
    if (!values.length) continue;
    if (definition.type === 'multi') {
      fields[definition.key] = values;
      continue;
    }
    if (values.length !== 1) {
      throw new ContractError(undefined, {[`fields.${definition.key}`]: 'Only one value is permitted.'});
    }
    const value = values[0].trim();
    if (!value) continue;
    if (definition.type === 'integer' || definition.type === 'decimal') {
      if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
        throw new ContractError(undefined, {[`fields.${definition.key}`]: 'Enter a decimal number.'});
      }
      fields[definition.key] = Number(value);
    } else if (definition.type === 'confirmation') {
      if (!['Yes', 'No'].includes(value)) {
        throw new ContractError(undefined, {[`fields.${definition.key}`]: 'Select a supported confirmation.'});
      }
      fields[definition.key] = value === 'Yes';
    } else fields[definition.key] = value;
  }
  return validateSubmission({
    schemaVersion: SCHEMA_VERSION, formId: FORM_ID, language,
    privacy: {version: privacyVersion, acknowledged: true}, fields,
  }, {privacyVersion});
}
