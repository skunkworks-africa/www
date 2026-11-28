import { buildEnquiry, buildSummary, emailDraft, SALES_EMAIL } from './model.mjs';

const form = document.getElementById('discovery-form');
if (form) {
  const errors = document.getElementById('form-errors');
  const status = document.getElementById('form-status');
  const review = document.getElementById('enquiry-review');
  const summary = document.getElementById('enquiry-summary');
  const needs = [...form.querySelectorAll('[name="needs"]')];
  const conditionalSections = [...form.querySelectorAll('[data-show-for]')];

  function updateSections() {
    const selected = new Set(needs.filter(input => input.checked).map(input => input.value));
    for (const section of conditionalSections) {
      const enabled = selected.has(section.dataset.showFor);
      section.hidden = !enabled;
      section.disabled = !enabled;
    }
    needs[0].setCustomValidity(selected.size ? '' : 'Select at least one area, or choose help defining your requirements.');
  }

  function labelFor(control) {
    if (control.name === 'needs') return 'What would you like help with?';
    return control.labels?.[0]?.textContent.trim().replace(/\s+/g, ' ') || control.name;
  }

  function validate() {
    updateSections();
    errors.replaceChildren();
    errors.hidden = true;
    const invalid = [];
    for (const control of form.querySelectorAll('input, select, textarea')) {
      control.removeAttribute('aria-invalid');
      if (control.required && ['text', 'email'].includes(control.type)) {
        control.setCustomValidity(control.value.trim() ? '' : 'Please complete this required field.');
      }
      if (control.willValidate && !control.validity.valid) {
        control.setAttribute('aria-invalid', 'true');
        invalid.push(control);
      }
    }
    if (!invalid.length) return true;
    review.hidden = true;
    const heading = document.createElement('p');
    heading.textContent = 'Please check the following before reviewing your enquiry:';
    const list = document.createElement('ul');
    for (const control of invalid) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + control.id;
      link.textContent = labelFor(control) + ' — ' + control.validationMessage;
      link.addEventListener('click', event => { event.preventDefault(); control.focus(); });
      item.append(link);
      list.append(item);
    }
    errors.append(heading, list);
    errors.hidden = false;
    errors.focus();
    status.textContent = 'Your answers are still on this page. Please check the highlighted fields.';
    return false;
  }

  const currentEnquiry = () => buildEnquiry(new FormData(form));

  function showReview() {
    if (!validate()) return false;
    summary.textContent = buildSummary(currentEnquiry());
    review.hidden = false;
    review.focus();
    status.textContent = 'Review your answers below, then open an email to send them to Skunkworks.';
    return true;
  }

  function changed(event) {
    if (event.target.matches('[name="needs"]')) updateSections();
    if (event.target.matches('input, select, textarea')) {
      event.target.removeAttribute('aria-invalid');
      if (event.target.name !== 'needs') event.target.setCustomValidity('');
      if (!review.hidden) {
        review.hidden = true;
        status.textContent = 'Your answers changed. Review the enquiry again before sending.';
      }
    }
  }

  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  form.addEventListener('submit', event => { event.preventDefault(); showReview(); });

  document.getElementById('email-enquiry').addEventListener('click', () => {
    if (!validate()) return;
    const draft = emailDraft(currentEnquiry());
    const deliveryNote = document.getElementById('email-status') || status;
    deliveryNote.textContent = draft.includesSummary
      ? 'Your email app has been asked to open a draft. Review it and select Send. This website cannot confirm email delivery.'
      : 'This enquiry is too long to include reliably in an email link. A draft addressed to ' + SALES_EMAIL + ' will open. Copy the full summary into the draft, or download it and attach the file, before selecting Send.';
    window.location.href = draft.href;
  });

  document.getElementById('copy-enquiry').addEventListener('click', async () => {
    if (!validate()) return;
    const text = buildSummary(currentEnquiry());
    const deliveryNote = document.getElementById('email-status') || status;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      deliveryNote.textContent = 'Enquiry copied. Paste it into an email to ' + SALES_EMAIL + ' and select Send.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(summary);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      deliveryNote.textContent = 'Automatic copying is unavailable. The summary is selected: copy it manually, or download the text file.';
    }
  });

  document.getElementById('download-enquiry').addEventListener('click', () => {
    if (!validate()) return;
    const blob = new Blob([buildSummary(currentEnquiry())], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skunkworks-dynamics-training-licensing-enquiry.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const deliveryNote = document.getElementById('email-status') || status;
    deliveryNote.textContent = 'Your download has started. Attach the text file to an email to ' + SALES_EMAIL + ' and send it.';
  });

  updateSections();
  status.textContent = '';
  document.getElementById('review-enquiry').disabled = false;
}
