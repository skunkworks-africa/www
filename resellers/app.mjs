import { checklist } from './model.mjs';
const form = document.querySelector('#application');
const list = document.querySelector('#checklist');
const review = document.querySelector('#review');
const data = () => Object.fromEntries(new FormData(form));
function update() {
  const fields = data();
  form.elements.registration.required = fields.businessType === 'company';
  document.querySelector('#registration-label').hidden = fields.businessType !== 'company';
  if (fields.businessType !== 'company') form.elements.registration.value = '';
  list.replaceChildren(...checklist(fields).map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  review.hidden = true;
}
form.addEventListener('input', update);
form.addEventListener('reset', () => setTimeout(update, 0));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const summary = document.querySelector('#summary'); summary.replaceChildren();
  for (const [key, value] of Object.entries(data())) {
    const control = form.elements.namedItem(key);
    const dt = document.createElement('dt'); dt.textContent = control.closest('label').childNodes[0].textContent.trim();
    const dd = document.createElement('dd'); dd.textContent = control.type === 'checkbox' ? 'Confirmed' : value || 'Not provided';
    summary.append(dt, dd);
  }
  review.hidden = false; review.focus();
});
update();
