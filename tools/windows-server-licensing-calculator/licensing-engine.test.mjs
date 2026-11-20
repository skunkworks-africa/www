import test from 'node:test';
import assert from 'node:assert/strict';
import { allocatePacks, calculateEstimate, roundToTwoCores, toCsv } from './licensing-engine.mjs';

const host = (overrides = {}) => ({
  name: 'Host A', processors: 2, coresPerProcessor: 12,
  windowsVms: 2, virtualCoresPerVm: 8, physicalWorkload: false,
  ...overrides
});
const physical = (edition, hosts) => calculateEstimate({ edition, model: 'physical', hosts });
const virtual = (edition, hosts, eligibleSubscriptionOrSA = true) =>
  calculateEstimate({ edition, model: 'virtual', hosts, eligibleSubscriptionOrSA });

test('minimum 16 physical cores on a one-processor server', () => {
  const result = physical('standard', [host({ processors: 1, coresPerProcessor: 4 })]);
  assert.equal(result.licensedCoreUnits, 16);
  assert.equal(result.packs.sixteenCore, 1);
});

test('minimum eight physical core licences for each processor', () => {
  const result = physical('datacenter', [host({ processors: 4, coresPerProcessor: 2, windowsVms: 18 })]);
  assert.equal(result.hosts[0].physicalMinimum, 32);
  assert.equal(result.licensedCoreUnits, 32);
});

test('physical core counts above minimum are respected', () => {
  const result = physical('standard', [host({ processors: 2, coresPerProcessor: 10 })]);
  assert.equal(result.hosts[0].physicalMinimum, 20);
  assert.equal(result.packs.sixteenCore, 1);
  assert.equal(result.packs.twoCore, 2);
});

test('standard licensing stacks in full two-OSE increments', () => {
  for (const [vms, layers, cores] of [[1, 1, 24], [2, 1, 24], [3, 2, 48], [4, 2, 48], [5, 3, 72], [6, 3, 72]]) {
    const result = physical('standard', [host({ windowsVms: vms })]);
    assert.equal(result.hosts[0].layers, layers, 'VM count ' + vms);
    assert.equal(result.licensedCoreUnits, cores, 'VM count ' + vms);
  }
});

test('dedicated host management OSE is additional; workload host consumes OSE', () => {
  const hostOnly = physical('standard', [host({ windowsVms: 2 })]);
  const workload = physical('standard', [host({ windowsVms: 2, physicalWorkload: true })]);
  assert.equal(hostOnly.licensedCoreUnits, 24);
  assert.equal(workload.licensedCoreUnits, 48);
  assert.equal(workload.hosts[0].entitledWindowsVms, 3);
});

test('datacenter physical-core licensing does not stack by VM count', () => {
  const result = physical('datacenter', [host({ windowsVms: 500 })]);
  assert.equal(result.licensedCoreUnits, 24);
  assert.equal(result.hosts[0].entitledWindowsVms, 'unlimited');
});

test('odd physical core totals round purchase units per layer, not only in aggregate', () => {
  const result = physical('standard', [host({ processors: 1, coresPerProcessor: 17, windowsVms: 4 })]);
  assert.equal(result.hosts[0].minimumRequiredCores, 34);
  assert.equal(result.licensedCoreUnits, 36);
  assert.equal(result.packs.sixteenCore, 2);
  assert.equal(result.packs.twoCore, 2);
});

test('multiple unequal hosts are calculated separately', () => {
  const result = physical('standard', [
    host({ name: 'Small', processors: 1, coresPerProcessor: 8, windowsVms: 2 }),
    host({ name: 'Large', processors: 2, coresPerProcessor: 24, windowsVms: 5 })
  ]);
  assert.equal(result.hostCount, 2);
  assert.equal(result.hosts[0].licensedCoreUnits, 16);
  assert.equal(result.hosts[1].licensedCoreUnits, 144);
  assert.equal(result.licensedCoreUnits, 160);
});

test('virtual-core licensing requires eligible licensing rights', () => {
  assert.throws(() => virtual('standard', [host()], false), /qualifying subscription/);
});

test('virtual-core licensing requires a minimum eight virtual cores per VM', () => {
  const result = virtual('standard', [host({ windowsVms: 3, virtualCoresPerVm: 2 })]);
  assert.equal(result.hosts[0].licensedCoreUnits, 24);
  assert.equal(result.hosts[0].layers, null);
});

test('virtual-core licensing has a 16-core customer minimum across included VMs', () => {
  const result = virtual('datacenter', [host({ windowsVms: 1, virtualCoresPerVm: 4 })]);
  assert.equal(result.customerMinimumTopUp, 8);
  assert.equal(result.licensedCoreUnits, 16);
  assert.equal(result.packs.sixteenCore, 1);
});

test('virtual-core mode cannot license Windows Server host workloads', () => {
  assert.throws(() => virtual('standard', [host({ physicalWorkload: true })]), /physical OSE/);
});

test('virtual-core mode does not grant unlimited Datacenter VM rights', () => {
  const result = virtual('datacenter', [host({ windowsVms: 10, virtualCoresPerVm: 12 })]);
  assert.equal(result.licensedCoreUnits, 120);
  assert.equal(result.hosts[0].entitledWindowsVms, 10);
});

test('two-core and sixteen-core pack arithmetic is exact', () => {
  assert.deepEqual(allocatePacks(34), { sixteenCore: 2, twoCore: 1, suppliedCores: 34, packCount: 3 });
  assert.equal(roundToTwoCores(17), 18);
  assert.equal(allocatePacks(0).packCount, 0);
});

test('invalid, fractional and out-of-range inputs are rejected', () => {
  assert.throws(() => physical('standard', [host({ processors: 0 })]), /Physical processors/);
  assert.throws(() => physical('standard', [host({ coresPerProcessor: 1.25 })]), /Cores per processor/);
  assert.throws(() => physical('standard', [host({ windowsVms: -1 })]), /Windows Server VMs/);
  assert.throws(() => physical('standard', []), /between 1 and 100/);
  assert.throws(() => physical('standard', Array(101).fill(host())), /between 1 and 100/);
});

test('CSV is Excel-compatible and escapes spreadsheet formula prefixes', () => {
  const result = physical('standard', [host({ name: '=HYPERLINK("https://example.test")' })]);
  const csv = toCsv(result);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('TOTAL'));
  assert.ok(!csv.includes('"=HYPERLINK'));
});
