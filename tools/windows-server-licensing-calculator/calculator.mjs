import { calculateEstimate, toCsv, RULES_VERSION } from './licensing-engine.mjs';
import { initAnalytics } from './analytics.mjs';

const analytics = initAnalytics();
const form = document.getElementById('calculator-form');
const template = document.getElementById('server-template');
const list = document.getElementById('server-list');
const errorBox = document.getElementById('calculator-error');
const breakdown = document.getElementById('breakdown');
const hostResults = document.getElementById('server-results');
const minimumNote = document.getElementById('customer-minimum-note');
const comparison = document.getElementById('edition-comparison');
const quoteLink = document.getElementById('request-quote');
const actions = ['export-csv', 'print-report', 'copy-results'].map(id => document.getElementById(id));
let nextId = 1;
let currentEstimate = null;

function getInput(host, key) { return host.querySelector('[data-field="' + key + '"]'); }
function getSelection(name) { return form.querySelector('input[name="' + name + '"]:checked')?.value; }
function format(number) { return Number(number).toLocaleString('en-ZA'); }

function syncHostLabels() {
  const hosts = [...list.querySelectorAll('[data-host]')];
  hosts.forEach((host, index) => {
    host.querySelector('[data-host-heading]').textContent = 'Server ' + (index + 1);
    host.querySelector('[data-remove-host]').disabled = hosts.length === 1;
    host.querySelector('[data-remove-host]').setAttribute('aria-label', 'Remove server ' + (index + 1));
  });
}

function addHost(initial = {}) {
  if (list.children.length >= 100) return;
  const host = template.content.firstElementChild.cloneNode(true);
  const id = String(nextId++);
  host.dataset.hostId = id;
  const defaults = {
    name: 'Server ' + id, processors: 2, coresPerProcessor: 12,
    windowsVms: 4, virtualCoresPerVm: 8, physicalWorkload: false,
    ...initial
  };
  for (const [key, value] of Object.entries(defaults)) {
    const element = getInput(host, key);
    if (!element) continue;
    if (element.type === 'checkbox') element.checked = Boolean(value);
    else element.value = String(value);
  }
  getInput(host, 'name').setAttribute('aria-label', 'Server ' + id + ' label');
  host.querySelector('[data-remove-host]').addEventListener('click', () => {
    if (list.children.length < 2) return;
    host.remove();
    syncHostLabels();
    render();
  });
  host.querySelectorAll('input').forEach(input => input.addEventListener('input', render));
  list.append(host);
  syncHostLabels();
  syncModel();
}

function syncModel() {
  const virtual = getSelection('model') === 'virtual';
  document.getElementById('virtual-eligibility').hidden = !virtual;
  document.querySelectorAll('[data-host]').forEach(host => {
    host.querySelector('[data-virtual-field]').hidden = !virtual;
    host.querySelector('[data-workload-field]').hidden = virtual;
    if (virtual) {
      getInput(host, 'physicalWorkload').checked = false;
      getInput(host, 'windowsVms').min = '1';
      if (Number(getInput(host, 'windowsVms').value) < 1) getInput(host, 'windowsVms').value = '1';
    } else getInput(host, 'windowsVms').min = '0';
  });
}

function getConfiguration() {
  const model = getSelection('model');
  const edition = getSelection('edition');
  const hosts = [...list.querySelectorAll('[data-host]')].map(host => ({
    name: getInput(host, 'name').value.trim() || 'Server',
    processors: getInput(host, 'processors').value,
    coresPerProcessor: getInput(host, 'coresPerProcessor').value,
    windowsVms: getInput(host, 'windowsVms').value,
    virtualCoresPerVm: getInput(host, 'virtualCoresPerVm').value,
    physicalWorkload: getInput(host, 'physicalWorkload').checked
  }));
  return {
    model, edition, hosts,
    eligibleSubscriptionOrSA: document.getElementById('eligible-license').checked
  };
}

function text(id, value) { document.getElementById(id).textContent = String(value); }
function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function addCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = String(value);
  row.append(cell);
}

function renderBreakdown(estimate, config) {
  hostResults.replaceChildren();
  for (const host of estimate.hosts) {
    const row = document.createElement('tr');
    [
      host.name, format(host.minimumRequiredCores),
      host.layers === null ? 'Per VM' : host.layers, format(host.licensedCoreUnits),
      host.packs.sixteenCore, host.packs.twoCore
    ].forEach(value => addCell(row, value));
    hostResults.append(row);
  }
  text('rules-version', 'Rules reviewed ' + RULES_VERSION);
  minimumNote.textContent = estimate.customerMinimumTopUp
    ? 'Additional ' + estimate.customerMinimumTopUp + ' core units are included to meet the minimum of 16 core licences per customer in virtual-core mode.'
    : 'Pack counts are equivalent 16-core and 2-core units. Confirm that SKUs can be assigned in the proposed combination under your purchasing programme.';
  comparison.replaceChildren();
  const title = document.createElement('h4');
  title.textContent = 'Edition comparison (core quantities, not prices)';
  const detail = document.createElement('p');
  if (estimate.model === 'physical') {
    const standard = calculateEstimate({ ...config, edition: 'standard' });
    const datacenter = calculateEstimate({ ...config, edition: 'datacenter' });
    detail.textContent = 'Standard: ' + format(standard.licensedCoreUnits) + ' core units across ' +
      format(standard.hostCount) + ' hosts (VM stacking). Datacenter: ' +
      format(datacenter.licensedCoreUnits) + ' core units (unlimited virtual OSEs on fully licensed hosts). ' +
      'The lower core-unit count is not necessarily the lower price.';
  } else {
    detail.textContent = 'Under qualifying virtual-core licensing, both editions license each virtual OSE individually. ' +
      'The unlimited Datacenter physical-host virtualisation right does not apply to this model.';
  }
  comparison.append(title, detail);
  breakdown.hidden = false;
}

function summaryText(estimate) {
  return [
    'Skunkworks Windows Server 2025 licensing estimate',
    'Model: ' + estimate.model + ' cores',
    'Edition: ' + estimate.edition,
    'Physical servers: ' + estimate.hostCount,
    'Minimum required cores: ' + estimate.minimumRequiredCores,
    'Core licence units to purchase: ' + estimate.licensedCoreUnits,
    '16-core packs: ' + estimate.packs.sixteenCore,
    '2-core packs: ' + estimate.packs.twoCore,
    ...estimate.hosts.map(host => host.name + ': ' + host.processors + ' CPU(s) × ' +
      host.coresPerProcessor + ' cores, ' + host.windowsVms + ' Windows Server VM(s), ' +
      host.licensedCoreUnits + ' licence units'),
    'Estimate only. CALs, agreement terms, mobility and prices not included.',
    'Guidance: https://www.microsoft.com/licensing/guidance/Windows-Server-2025'
  ].join('\n');
}

function render() {
  try {
    if (!form.checkValidity()) throw new RangeError('Enter valid whole-number counts within the permitted ranges.');
    const config = getConfiguration();
    const estimate = calculateEstimate(config);
    currentEstimate = estimate;
    text('licensed-cores', format(estimate.licensedCoreUnits));
    text('result-hosts', format(estimate.hostCount));
    text('result-edition', estimate.edition === 'standard' ? 'Standard' : 'Datacenter');
    text('result-sixteen', format(estimate.packs.sixteenCore));
    text('result-two', format(estimate.packs.twoCore));
    text('result-description', estimate.model === 'physical'
      ? 'Minimum physical core licensing with Standard VM stacking where applicable.'
      : 'Virtual-core licences per VM, including the customer-wide minimum if applicable.');
    renderBreakdown(estimate, config);
    actions.forEach(button => { button.disabled = false; });
    const body = summaryText(estimate);
    const safeBody = body.length > 1800 ? body.slice(0, 1600) + '\n(Attach downloaded CSV for complete breakdown.)' : body;
    quoteLink.href = 'mailto:sales@skunkworks.africa?subject=' +
      encodeURIComponent('Windows Server 2025 licensing quotation') + '&body=' + encodeURIComponent(safeBody);
    showError('');
  } catch (error) {
    currentEstimate = null;
    ['licensed-cores', 'result-hosts', 'result-edition', 'result-sixteen', 'result-two'].forEach(id => text(id, '—'));
    text('result-description', 'Review the inputs to complete the estimate.');
    breakdown.hidden = true;
    actions.forEach(button => { button.disabled = true; });
    quoteLink.href = 'mailto:sales@skunkworks.africa?subject=Windows%20Server%202025%20licensing%20enquiry';
    showError(error instanceof Error ? error.message : 'Unable to calculate. Please review your inputs.');
  }
}

form.addEventListener('change', event => {
  if (event.target.name === 'model') syncModel();
  render();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  render();
  if (!currentEstimate) {
    const firstInvalid = form.querySelector('input:invalid');
    if (firstInvalid) firstInvalid.focus();
    else errorBox.focus?.();
    return;
  }
  analytics.track('calculator_calculated');
  document.getElementById('results').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
document.getElementById('add-server').addEventListener('click', () => {
  if (list.children.length >= 100) {
    showError('This calculator supports up to 100 servers per estimate.');
    return;
  }
  addHost({ processors: 1, coresPerProcessor: 16, windowsVms: 2 });
  render();
  list.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
document.getElementById('reset-calculator').addEventListener('click', () => {
  form.querySelector('input[name="edition"][value="standard"]').checked = true;
  form.querySelector('input[name="model"][value="physical"]').checked = true;
  document.getElementById('eligible-license').checked = false;
  list.replaceChildren();
  nextId = 1;
  addHost();
  syncModel();
  render();
});
document.getElementById('export-csv').addEventListener('click', () => {
  if (!currentEstimate) return;
  const url = URL.createObjectURL(new Blob([toCsv(currentEstimate)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'skunkworks-windows-server-licensing-estimate.csv';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  analytics.track('calculator_csv_download');
});
document.getElementById('print-report').addEventListener('click', () => {
  if (!currentEstimate) return;
  analytics.track('calculator_print');
  window.print();
});
document.getElementById('copy-results').addEventListener('click', async () => {
  if (!currentEstimate) return;
  const summary = summaryText(currentEstimate);
  try {
    await navigator.clipboard.writeText(summary);
    text('result-description', 'Estimate copied to your clipboard.');
    analytics.track('calculator_copy');
  } catch {
    text('result-description', 'Clipboard permission denied. Download the CSV instead.');
  }
});
quoteLink.addEventListener('click', () => analytics.track('calculator_quote_click'));
addHost();
render();
