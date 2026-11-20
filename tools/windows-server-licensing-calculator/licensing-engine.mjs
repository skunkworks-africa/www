/**
 * Skunkworks Windows Server 2025 licensing estimator.
 * Independent rules implementation; not an official Microsoft licensing determination.
 * Sources:
 * https://www.microsoft.com/licensing/guidance/Windows-Server-2025
 * https://www.microsoft.com/licensing/terms/
 */
export const RULES_VERSION = '2026-11-20';
export const LICENSING_GUIDE_URL = 'https://www.microsoft.com/licensing/guidance/Windows-Server-2025';

const MAX_HOSTS = 100;
const limits = { processors: 64, coresPerProcessor: 256, windowsVms: 2000, virtualCoresPerVm: 512 };

function integer(value, name, min, max) {
  const number = Number(value);
  if (value === '' || value === null || value === undefined ||
      !Number.isSafeInteger(number) || number < min || number > max) {
    throw new RangeError(name + ' must be an integer between ' + min + ' and ' + max + '.');
  }
  return number;
}

export function roundToTwoCores(value) {
  const number = integer(value, 'Core count', 0, 200000000);
  return Math.ceil(number / 2) * 2;
}

export function allocatePacks(coreLicenses) {
  const cores = roundToTwoCores(coreLicenses);
  return Object.freeze({
    sixteenCore: Math.floor(cores / 16),
    twoCore: (cores % 16) / 2,
    suppliedCores: cores,
    packCount: Math.floor(cores / 16) + (cores % 16) / 2
  });
}

export function calculateEstimate(configuration) {
  if (!configuration || typeof configuration !== 'object') throw new TypeError('A configuration is required.');
  const { edition, model, hosts, eligibleSubscriptionOrSA = false } = configuration;
  if (!['standard', 'datacenter'].includes(edition)) throw new RangeError('Select Standard or Datacenter.');
  if (!['physical', 'virtual'].includes(model)) throw new RangeError('Select a licensing model.');
  if (!Array.isArray(hosts) || hosts.length === 0 || hosts.length > MAX_HOSTS) {
    throw new RangeError('Provide between 1 and 100 hosts.');
  }
  if (model === 'virtual' && eligibleSubscriptionOrSA !== true) {
    throw new RangeError('Virtual-core licensing requires a qualifying subscription or active Software Assurance.');
  }

  const results = hosts.map((item, index) => {
    const host = item || {};
    const name = String(host.name || 'Server ' + (index + 1)).trim().slice(0, 80);
    const processors = integer(host.processors, 'Physical processors', 1, limits.processors);
    const coresPerProcessor = integer(host.coresPerProcessor, 'Cores per processor', 1, limits.coresPerProcessor);
    const windowsVms = integer(host.windowsVms, 'Windows Server VMs', model === 'virtual' ? 1 : 0, limits.windowsVms);
    const virtualCoresPerVm = integer(host.virtualCoresPerVm ?? 8, 'Virtual cores per VM', 1, limits.virtualCoresPerVm);
    const physicalWorkload = Boolean(host.physicalWorkload);

    const actualCores = processors * coresPerProcessor;
    const physicalMinimum = Math.max(16, processors * Math.max(8, coresPerProcessor));
    if (model === 'virtual') {
      if (physicalWorkload) {
        throw new RangeError(name + ': virtual-core licensing does not license Windows Server in the physical OSE.');
      }
      const coresPerVirtualOse = roundToTwoCores(Math.max(8, virtualCoresPerVm));
      const requiredCores = coresPerVirtualOse * windowsVms;
      return {
        name, processors, coresPerProcessor, actualCores, physicalMinimum,
        windowsVms, virtualCoresPerVm, physicalWorkload,
        layers: null, minimumRequiredCores: requiredCores,
        licensedCoreUnits: requiredCores,
        entitledWindowsVms: windowsVms,
        packs: allocatePacks(requiredCores)
      };
    }
    // A dedicated host-management OSE does not consume an additional Standard right.
    // A physical OSE running other Windows workloads DOES count against the two OSEs.
    const operatingEnvironments = windowsVms + (physicalWorkload ? 1 : 0);
    const layers = edition === 'standard' ? Math.max(1, Math.ceil(operatingEnvironments / 2)) : 1;
    // Each Standard stacking layer must cover all cores; 2-core SKU rounding is per layer.
    const licensedCoreUnits = roundToTwoCores(physicalMinimum) * layers;
    const entitledWindowsVms = edition === 'datacenter'
      ? 'unlimited'
      : layers * 2 - (physicalWorkload ? 1 : 0);
    return {
      name, processors, coresPerProcessor, actualCores, physicalMinimum,
      windowsVms, virtualCoresPerVm, physicalWorkload, layers,
      minimumRequiredCores: physicalMinimum * layers,
      licensedCoreUnits, entitledWindowsVms,
      packs: allocatePacks(licensedCoreUnits)
    };
  });

  const minimumRequiredCores = results.reduce((sum, h) => sum + h.minimumRequiredCores, 0);
  const byHostCoreUnits = results.reduce((sum, h) => sum + h.licensedCoreUnits, 0);
  // Virtual-core licensing is subject to a 16-core minimum PER CUSTOMER, not per VM.
  // Treat this estimate as the customer's total Windows Server VM estate for that minimum.
  const customerMinimumTopUp = model === 'virtual' ? Math.max(0, 16 - byHostCoreUnits) : 0;
  const licensedCoreUnits = byHostCoreUnits + customerMinimumTopUp;
  const packs = allocatePacks(licensedCoreUnits);
  return {
    edition, model, rulesVersion: RULES_VERSION,
    hosts: results, hostCount: results.length,
    minimumRequiredCores, licensedCoreUnits, customerMinimumTopUp, packs,
    notes: [
      'This is an estimate, not a licence entitlement, quote or compliance certification.',
      'Core packs shown as 16-core and 2-core equivalents; verify product SKUs and agreement terms.',
      'Windows Server CALs, RDS CALs, External Connectors and other access rights are not included.',
      model === 'virtual'
        ? 'Virtual-core licensing requires eligible subscription/Software Assurance; at least 8 virtual cores per VM and 16 per customer. Each VM is licensed individually.'
        : 'Physical-core licensing requires at least 8 cores per processor and 16 per server; Standard stacking relicenses all cores for each additional two OSEs.',
      'Licensing for failover, VM movement, mixed OS editions, clustering and Azure Arc pay-as-you-go must be assessed separately.'
    ]
  };
}

export function toCsv(estimate) {
  const quote = value => {
    let valueText = String(value ?? '');
    // Prevent spreadsheet applications from evaluating untrusted labels as formulas.
    if (/^[\\s\\x00-\\x1f]*[=+@-]/.test(valueText)) valueText = "'" + valueText;
    return '"' + valueText.replaceAll('"', '""') + '"';
  };
  const header = ['Server', 'Edition', 'Model', 'Processors', 'Cores / processor',
    'Windows VMs', 'Layers', 'Minimum cores', 'Core licences to purchase', '16-core packs', '2-core packs'];
  const lines = estimate.hosts.map(h => [
    h.name, estimate.edition, estimate.model, h.processors, h.coresPerProcessor, h.windowsVms,
    h.layers ?? 'per VM', h.minimumRequiredCores, h.licensedCoreUnits,
    h.packs.sixteenCore, h.packs.twoCore
  ].map(quote).join(','));
  lines.push(['TOTAL', estimate.edition, estimate.model, '', '', '', '', estimate.minimumRequiredCores,
    estimate.licensedCoreUnits, estimate.packs.sixteenCore, estimate.packs.twoCore].map(quote).join(','));
  return '\uFEFF' + header.map(quote).join(',') + '\r\n' + lines.join('\r\n') + '\r\n';
}
