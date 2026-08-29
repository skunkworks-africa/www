(() => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-mobile-menu]');
  const header = document.querySelector('[data-header]');
  const year = document.querySelector('[data-year]');
  const desktop = window.matchMedia('(min-width: 821px)');

  const closeMenu = () => {
    if (!button || !menu) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    if (!button || !menu) return;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', 'Close navigation');
    document.body.style.overflow = 'hidden';
    menu.querySelector('a')?.focus();
  };

  button?.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    open ? closeMenu() : openMenu();
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  desktop.addEventListener?.('change', (event) => {
    if (event.matches) closeMenu();
  });

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.dataset.scrolled = String(window.scrollY > 24);
    lastY = window.scrollY;
  }, { passive: true });

  if (year) year.textContent = String(new Date().getFullYear());
})();
