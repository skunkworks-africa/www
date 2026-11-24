(() => {
  const form = document.querySelector('#application-form');
  const review = document.querySelector('#review');
  const summary = document.querySelector('#summary');
  if (!form || !review || !summary) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const entries = [
      ['Full name', data.get('fullName')],
      ['Business name', data.get('businessName')],
      ['Email address', data.get('email')],
      ['Telephone number', data.get('phone')],
      ['Microsoft 365 users', data.get('users')],
      ['Existing domain', data.get('domain') || 'Not supplied'],
      ['Needs', data.get('needs') || 'Not supplied']
    ];
    summary.innerHTML = entries.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd>`).join('');
    review.hidden = false;
    review.focus();
  });

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }
})();
