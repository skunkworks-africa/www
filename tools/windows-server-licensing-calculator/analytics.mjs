/**
 * Consent-aware analytics integration.
 * Configure GTM by adding <meta name="skw-gtm-id" content="GTM-XXXXXXX"> to the page
 * only after the container's privacy configuration has been reviewed.
 * No optional tags are loaded before affirmative consent.
 */
const STORAGE_KEY = 'skw:calculator:analytics:v1';
const VALID_GTM = /^GTM-[A-Z0-9]{5,20}$/;

export function initAnalytics() {
  const banner = document.getElementById('analytics-consent');
  const dialog = document.getElementById('analytics-dialog');
  const preferences = document.getElementById('analytics-preferences');
  const close = document.getElementById('close-preferences');
  const gtmId = document.querySelector('meta[name="skw-gtm-id"]')?.content?.trim() || '';
  let decision = null;
  try { decision = localStorage.getItem(STORAGE_KEY); } catch { /* storage may be disabled */ }
  let loaded = false;

  function loadTag() {
    if (loaded || decision !== 'allow' || !VALID_GTM.test(gtmId)) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(gtmId);
    document.head.append(script);
  }

  function choose(choice) {
    decision = choice === 'allow' ? 'allow' : 'deny';
    try { localStorage.setItem(STORAGE_KEY, decision); } catch { /* session-only preference */ }
    banner.hidden = true;
    dialog.close?.();
    loadTag();
    if (decision === 'deny' && loaded) {
      // A previously loaded third-party script cannot be unloaded in this document.
      // Refresh to prevent additional optional events after revocation.
      window.location.reload();
    }
  }

  document.querySelectorAll('[data-consent-accept]').forEach(button => {
    button.addEventListener('click', () => choose('allow'));
  });
  document.querySelectorAll('[data-consent-reject]').forEach(button => {
    button.addEventListener('click', () => choose('deny'));
  });
  preferences?.addEventListener('click', () => dialog.showModal());
  close?.addEventListener('click', () => dialog.close());
  banner.hidden = decision === 'allow' || decision === 'deny';
  loadTag();

  return {
    track(eventName) {
      if (decision !== 'allow' || !loaded) return;
      if (!/^[a-z][a-z0-9_]{2,48}$/.test(eventName)) return;
      // Deliberately excludes server labels, core quantities, VM counts, and PII.
      window.dataLayer?.push({ event: 'skw_' + eventName });
    }
  };
}
