(() => {
  'use strict';

  const config = window.SKUNKWORKS_WORKFLOW_CONFIG;
  if (!config) {
    console.error('Sales automation configuration is missing.');
    return;
  }

  const STORAGE_KEY = 'skunkworks.salesAutomation.v1';
  const form = document.getElementById('campaign-form');
  const channelBody = document.getElementById('channel-body');
  const stageList = document.getElementById('stage-list');
  const actionList = document.getElementById('action-list');

  const defaultState = () => ({
    version: config.version,
    campaign: {
      sku: 'DELL-LAT-5490-REF',
      title: 'Dell Latitude 5490 — Refurbished',
      tier: 'B',
      stock: 1,
      cost: '',
      price: 8500,
      minMargin: config.defaultMinMargin,
      campaignOwner: 'Commercial',
      salesOwner: 'Sales',
      marketingOwner: 'Marketing',
      productUrl: '',
      campaignName: 'dell-5490-september',
      commercialApproved: false,
      stockVerified: false,
      warrantyVerified: false,
      storeLive: false,
      fulfilmentReady: false,
      reportingReady: false
    },
    channels: Object.fromEntries(config.channels.map((channel) => [
      channel.id,
      { status: 'not-planned', url: '', note: '' }
    ])),
    metrics: {
      spend: 0,
      leads: 0,
      quotes: 0,
      orders: 0,
      revenue: 0,
      grossProfit: 0
    },
    leadSlaMinutes: 15,
    utm: {
      source: 'facebook',
      medium: 'paid-social',
      content: ''
    },
    updatedAt: null
  });

  let state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || parsed.version !== config.version) return defaultState();
      return mergeState(defaultState(), parsed);
    } catch (error) {
      console.warn('Could not load saved workflow state.', error);
      return defaultState();
    }
  }

  function mergeState(base, incoming) {
    return {
      ...base,
      ...incoming,
      campaign: { ...base.campaign, ...(incoming.campaign || {}) },
      channels: { ...base.channels, ...(incoming.channels || {}) },
      metrics: { ...base.metrics, ...(incoming.metrics || {}) },
      utm: { ...base.utm, ...(incoming.utm || {}) }
    };
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      document.getElementById('save-state').textContent = 'Saved locally';
      document.getElementById('last-saved').textContent = new Date(state.updatedAt).toLocaleString();
    } catch (error) {
      document.getElementById('save-state').textContent = 'Local save failed';
      console.warn('Could not save workflow state.', error);
    }
  }

  function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function money(value) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 2
    }).format(numberValue(value));
  }

  function percent(value) {
    return Number.isFinite(value) ? value.toFixed(1) + '%' : '—';
  }

  function getCommercials() {
    const priceInclVat = numberValue(state.campaign.price);
    const costExVat = numberValue(state.campaign.cost);
    if (!priceInclVat || !costExVat) {
      return { netSelling: 0, grossProfit: 0, margin: NaN };
    }
    const netSelling = priceInclVat / (1 + config.vatRate);
    const grossProfit = netSelling - costExVat;
    const margin = netSelling > 0 ? (grossProfit / netSelling) * 100 : NaN;
    return { netSelling, grossProfit, margin };
  }

  function canonicalStoreUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'store.skunkworks.africa';
    } catch {
      return false;
    }
  }

  function isRequiredChannel(channel) {
    return channel.tiers.includes(state.campaign.tier) && Boolean(channel.core);
  }

  function isRecommendedChannel(channel) {
    return channel.tiers.includes(state.campaign.tier);
  }

  function statusReady(status) {
    return status === 'ready' || status === 'live';
  }

  function channelStats() {
    let live = 0;
    let required = 0;
    let blocked = 0;
    let readyRequired = 0;

    config.channels.forEach((channel) => {
      const item = state.channels[channel.id] || {};
      if (item.status === 'live') live += 1;
      if (isRequiredChannel(channel)) {
        required += 1;
        if (statusReady(item.status)) readyRequired += 1;
        if (item.status === 'blocked') blocked += 1;
      }
    });

    return { live, required, blocked, readyRequired };
  }

  function evaluateStages() {
    const c = state.campaign;
    const commercials = getCommercials();
    const stats = channelStats();
    const liveAcquisition = config.channels.filter((channel) => {
      if (channel.id === 'shopify') return false;
      return (state.channels[channel.id] || {}).status === 'live';
    }).length;
    const hasReportingActivity = Object.values(state.metrics).some((value) => numberValue(value) > 0);

    return [
      {
        ...config.stages[0],
        complete: Boolean(c.sku && c.title && numberValue(c.price) > 0 && numberValue(c.stock) > 0 && c.campaignOwner),
        reason: 'SKU, title, available stock, selling price and campaign owner are required.'
      },
      {
        ...config.stages[1],
        complete: Boolean(
          numberValue(c.cost) > 0 &&
          c.commercialApproved &&
          c.stockVerified &&
          c.warrantyVerified &&
          Number.isFinite(commercials.margin) &&
          commercials.margin >= numberValue(c.minMargin)
        ),
        reason: Number.isFinite(commercials.margin) && commercials.margin < numberValue(c.minMargin)
          ? 'Gross margin is below the configured minimum.'
          : 'Supplier cost plus commercial, stock and warranty approvals are required.'
      },
      {
        ...config.stages[2],
        complete: Boolean(c.storeLive && canonicalStoreUrl(c.productUrl)),
        reason: 'A verified canonical store.skunkworks.africa product URL is required.'
      },
      {
        ...config.stages[3],
        complete: stats.required > 0 && stats.readyRequired === stats.required,
        reason: 'Every required channel for this tier must be Ready or Live.'
      },
      {
        ...config.stages[4],
        complete: Boolean(c.campaignName && liveAcquisition >= 2),
        reason: 'Set a campaign name and put at least two acquisition channels Live.'
      },
      {
        ...config.stages[5],
        complete: Boolean(c.salesOwner && numberValue(state.leadSlaMinutes) > 0),
        reason: 'Assign a sales owner and response-time target.'
      },
      {
        ...config.stages[6],
        complete: Boolean(c.fulfilmentReady),
        reason: 'Confirm fulfilment and operational hand-off readiness.'
      },
      {
        ...config.stages[7],
        complete: Boolean(c.reportingReady && hasReportingActivity),
        reason: 'Confirm reporting readiness and capture at least one weekly KPI.'
      }
    ];
  }

  function populateForm() {
    Object.entries(state.campaign).forEach(([key, value]) => {
      const control = form.elements.namedItem(key);
      if (!control) return;
      if (control.type === 'checkbox') control.checked = Boolean(value);
      else control.value = value ?? '';
    });

    document.getElementById('lead-sla').value = String(state.leadSlaMinutes);
    document.getElementById('utm-source').value = state.utm.source || '';
    document.getElementById('utm-medium').value = state.utm.medium || '';
    document.getElementById('utm-content').value = state.utm.content || '';

    document.querySelectorAll('[data-metric]').forEach((input) => {
      input.value = state.metrics[input.dataset.metric] ?? 0;
    });
  }

  function renderChannels() {
    channelBody.innerHTML = '';
    config.channels.forEach((channel) => {
      const saved = state.channels[channel.id] || { status: 'not-planned', url: '', note: '' };
      const required = isRequiredChannel(channel);
      const recommended = isRecommendedChannel(channel);
      const tr = document.createElement('tr');
      if (saved.status === 'blocked') tr.classList.add('blocked');

      const statusOptions = config.statusOptions.map((status) => {
        const label = status.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        const selected = saved.status === status ? ' selected' : '';
        return '<option value="' + status + '"' + selected + '>' + label + '</option>';
      }).join('');

      const requirement = required
        ? '<span class="requirement">Required</span>'
        : recommended
          ? '<span class="requirement optional">Recommended</span>'
          : '<span class="requirement optional">Not standard for tier</span>';

      tr.innerHTML =
        '<td>' + escapeHtml(channel.name) + '</td>' +
        '<td>' + escapeHtml(channel.role) + '</td>' +
        '<td>' + requirement + '</td>' +
        '<td><select data-channel="' + channel.id + '" data-field="status" aria-label="' + escapeHtml(channel.name) + ' status">' + statusOptions + '</select></td>' +
        '<td><input data-channel="' + channel.id + '" data-field="url" type="url" value="' + escapeAttr(saved.url || '') + '" aria-label="' + escapeHtml(channel.name) + ' evidence URL"></td>' +
        '<td><input data-channel="' + channel.id + '" data-field="note" value="' + escapeAttr(saved.note || '') + '" aria-label="' + escapeHtml(channel.name) + ' note"></td>';

      channelBody.appendChild(tr);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function renderStages() {
    const stages = evaluateStages();
    stageList.innerHTML = '';
    stages.forEach((stage, index) => {
      const li = document.createElement('li');
      li.className = 'stage-item' + (stage.complete ? ' complete' : '');
      li.innerHTML =
        '<span class="stage-number">' + (index + 1) + '</span>' +
        '<div class="stage-copy"><strong>' + escapeHtml(stage.name) + '</strong><small>' + escapeHtml(stage.complete ? stage.description : stage.reason) + ' · Owner: ' + escapeHtml(stage.owner) + '</small></div>' +
        '<span class="stage-status">' + (stage.complete ? 'Complete' : 'Pending') + '</span>';
      stageList.appendChild(li);
    });
    return stages;
  }

  function renderSummary() {
    const commercials = getCommercials();
    const stats = channelStats();
    const stages = evaluateStages();
    const completeCount = stages.filter((stage) => stage.complete).length;
    const progress = Math.round((completeCount / stages.length) * 100);
    const firstPendingIndex = stages.findIndex((stage) => !stage.complete);

    document.getElementById('kpi-progress').textContent = progress + '%';
    document.getElementById('kpi-stage').textContent = firstPendingIndex === -1
      ? 'Workflow complete'
      : 'Stage ' + (firstPendingIndex + 1) + ' of ' + stages.length;

    document.getElementById('kpi-margin').textContent = percent(commercials.margin);
    document.getElementById('kpi-margin-value').textContent = Number.isFinite(commercials.margin)
      ? 'Gross profit ' + money(commercials.grossProfit) + ' excl. VAT'
      : 'Enter supplier cost';

    document.getElementById('kpi-live').textContent = String(stats.live);
    document.getElementById('kpi-required').textContent = String(stats.required) + ' required for Tier ' + state.campaign.tier;
    document.getElementById('kpi-blockers').textContent = String(stats.blocked);
    document.getElementById('tier-badge').textContent = 'Tier ' + state.campaign.tier;

    renderActions(stages, commercials, stats);
    renderUtm();
    renderMetrics();
  }

  function renderActions(stages, commercials, stats) {
    const actions = [];
    const c = state.campaign;

    stages.forEach((stage, index) => {
      if (!stage.complete) {
        actions.push({
          title: 'Stage ' + (index + 1) + ': ' + stage.name,
          detail: stage.reason,
          owner: stage.owner
        });
      }
    });

    if (Number.isFinite(commercials.margin) && commercials.margin < numberValue(c.minMargin)) {
      actions.unshift({
        title: 'Resolve margin shortfall',
        detail: 'Current margin ' + percent(commercials.margin) + ' is below the ' + numberValue(c.minMargin).toFixed(1) + '% policy floor.',
        owner: 'Commercial / Finance'
      });
    }

    if (stats.blocked > 0) {
      actions.unshift({
        title: 'Clear required channel blockers',
        detail: stats.blocked + ' required channel' + (stats.blocked === 1 ? ' is' : 's are') + ' blocked.',
        owner: c.marketingOwner || 'Marketing'
      });
    }

    if (!actions.length) {
      actions.push({
        title: 'Workflow complete',
        detail: 'Review profitability and performance before increasing spend or replenishing stock.',
        owner: 'Sales / Marketing'
      });
    }

    actionList.innerHTML = actions.slice(0, 7).map((action) =>
      '<li><strong>' + escapeHtml(action.title) + '</strong><small>' + escapeHtml(action.detail) + '</small><small>Suggested owner: ' + escapeHtml(action.owner) + '</small></li>'
    ).join('');
  }

  function renderUtm() {
    const output = document.getElementById('utm-output');
    if (!canonicalStoreUrl(state.campaign.productUrl)) {
      output.value = 'Enter a canonical store.skunkworks.africa product URL first.';
      return;
    }
    const url = new URL(state.campaign.productUrl);
    if (state.utm.source) url.searchParams.set('utm_source', state.utm.source);
    if (state.utm.medium) url.searchParams.set('utm_medium', state.utm.medium);
    if (state.campaign.campaignName) url.searchParams.set('utm_campaign', state.campaign.campaignName);
    if (state.utm.content) url.searchParams.set('utm_content', state.utm.content);
    if (state.campaign.sku) url.searchParams.set('utm_term', state.campaign.sku);
    output.value = url.toString();
  }

  function renderMetrics() {
    const m = state.metrics;
    const spend = numberValue(m.spend);
    const leads = numberValue(m.leads);
    const quotes = numberValue(m.quotes);
    const orders = numberValue(m.orders);
    const revenue = numberValue(m.revenue);

    document.getElementById('metric-cpl').textContent = spend > 0 && leads > 0 ? money(spend / leads) : '—';
    document.getElementById('metric-l2q').textContent = leads > 0 ? percent((quotes / leads) * 100) : '—';
    document.getElementById('metric-q2o').textContent = quotes > 0 ? percent((orders / quotes) * 100) : '—';
    document.getElementById('metric-roas').textContent = spend > 0 ? (revenue / spend).toFixed(2) + '×' : '—';
  }

  function renderAll() {
    populateForm();
    renderChannels();
    renderStages();
    renderSummary();
    if (state.updatedAt) {
      document.getElementById('last-saved').textContent = new Date(state.updatedAt).toLocaleString();
    }
  }

  function handleCampaignInput(event) {
    const control = event.target;
    if (!control.name) return;
    const value = control.type === 'checkbox'
      ? control.checked
      : control.type === 'number'
        ? (control.value === '' ? '' : numberValue(control.value))
        : control.value;
    state.campaign[control.name] = value;
    saveState();

    if (control.name === 'tier') renderChannels();
    renderStages();
    renderSummary();
  }

  function handleChannelInput(event) {
    const control = event.target.closest('[data-channel][data-field]');
    if (!control) return;
    const id = control.dataset.channel;
    const field = control.dataset.field;
    state.channels[id] = state.channels[id] || { status: 'not-planned', url: '', note: '' };
    state.channels[id][field] = control.value;
    saveState();
    if (field === 'status') renderChannels();
    renderStages();
    renderSummary();
  }

  function planRecommended() {
    config.channels.forEach((channel) => {
      const current = state.channels[channel.id] || {};
      state.channels[channel.id] = {
        status: isRecommendedChannel(channel) ? (current.status === 'live' ? 'live' : 'planned') : 'not-planned',
        url: current.url || '',
        note: current.note || ''
      };
    });
    saveState();
    renderChannels();
    renderStages();
    renderSummary();
  }

  function clearChannels() {
    config.channels.forEach((channel) => {
      const current = state.channels[channel.id] || {};
      state.channels[channel.id] = { status: 'not-planned', url: current.url || '', note: current.note || '' };
    });
    saveState();
    renderChannels();
    renderStages();
    renderSummary();
  }

  function updateUtm() {
    state.utm.source = document.getElementById('utm-source').value.trim();
    state.utm.medium = document.getElementById('utm-medium').value.trim();
    state.utm.content = document.getElementById('utm-content').value.trim();
    saveState();
    renderUtm();
  }

  function updateMetric(event) {
    const input = event.target.closest('[data-metric]');
    if (!input) return;
    state.metrics[input.dataset.metric] = numberValue(input.value);
    saveState();
    renderStages();
    renderSummary();
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      workflow: 'Skunkworks Africa Sales Automation',
      data: state
    };
    download(
      safeFilename((state.campaign.sku || 'campaign') + '-workflow.json'),
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  }

  function exportCsv() {
    const rows = [
      ['SKU','Product','Tier','Channel','Role','Requirement','Status','Evidence URL','Note']
    ];
    config.channels.forEach((channel) => {
      const item = state.channels[channel.id] || {};
      rows.push([
        state.campaign.sku || '',
        state.campaign.title || '',
        state.campaign.tier || '',
        channel.name,
        channel.role,
        isRequiredChannel(channel) ? 'Required' : (isRecommendedChannel(channel) ? 'Recommended' : 'Not standard'),
        item.status || 'not-planned',
        item.url || '',
        item.note || ''
      ]);
    });
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    download(safeFilename((state.campaign.sku || 'campaign') + '-channels.csv'), csv, 'text/csv;charset=utf-8');
  }

  function csvCell(value) {
    return '"' + String(value ?? '').replace(/"/g, '""') + '"';
  }

  function safeFilename(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copyUtm() {
    const value = document.getElementById('utm-output').value;
    if (!value.startsWith('https://')) return;
    try {
      await navigator.clipboard.writeText(value);
      const button = document.getElementById('copy-utm');
      const original = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = original; }, 1200);
    } catch {
      document.getElementById('utm-output').select();
    }
  }

  function resetWorkflow() {
    if (!window.confirm('Reset the local sales automation workflow to its starter state?')) return;
    state = defaultState();
    saveState();
    renderAll();
  }

  form.addEventListener('input', handleCampaignInput);
  form.addEventListener('change', handleCampaignInput);
  channelBody.addEventListener('input', handleChannelInput);
  channelBody.addEventListener('change', handleChannelInput);

  document.getElementById('plan-recommended').addEventListener('click', planRecommended);
  document.getElementById('clear-channels').addEventListener('click', clearChannels);
  document.getElementById('export-json').addEventListener('click', exportJson);
  document.getElementById('export-csv').addEventListener('click', exportCsv);
  document.getElementById('reset-workflow').addEventListener('click', resetWorkflow);
  document.getElementById('copy-utm').addEventListener('click', copyUtm);
  document.getElementById('lead-sla').addEventListener('change', (event) => {
    state.leadSlaMinutes = numberValue(event.target.value);
    saveState();
    renderStages();
    renderSummary();
  });

  ['utm-source','utm-medium','utm-content'].forEach((id) => {
    document.getElementById(id).addEventListener('input', updateUtm);
  });

  document.querySelectorAll('[data-metric]').forEach((input) => {
    input.addEventListener('input', updateMetric);
  });

  renderAll();
})();