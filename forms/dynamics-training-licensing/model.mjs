export const SALES_EMAIL = 'sales@skunkworks.africa';

export const NEEDS = Object.freeze({
  training: 'Dynamics ERP training and support skills',
  licensing: 'Microsoft or Google software licensing',
  implementation: 'ERP implementation or integration',
  discovery: 'Help defining our requirements'
});

const sections = [
  { title: 'Organisation and contact', fields: [
    ['company', 'Organisation'], ['contactName', 'Contact name'], ['email', 'Work email'],
    ['country', 'Country'], ['role', 'Role'], ['phone', 'Phone / WhatsApp']
  ] },
  { title: 'Objectives', fields: [['outcomes', 'What we would like to achieve']] },
  { title: 'Training requirements', need: 'training', fields: [
    ['dynamicsProducts', 'Dynamics products'], ['trainingLearners', 'Approximate learner count'],
    ['learnerRoles', 'Learner roles'], ['experience', 'Current experience'],
    ['trainingGoals', 'Desired skills and support examples'], ['delivery', 'Preferred delivery']
  ] },
  { title: 'Licensing requirements', need: 'licensing', fields: [
    ['vendors', 'Vendors'], ['licensingProducts', 'Products and approximate quantities'],
    ['licenceAudience', 'Licences for'], ['licensingType', 'Subscription requirement'],
    ['licenceCountries', 'Countries where licences will be used']
  ] },
  { title: 'Implementation or integration', need: 'implementation', fields: [
    ['currentSystem', 'Current system'], ['implementationGoals', 'Problem to solve'],
    ['integrations', 'Systems to connect'], ['estimatedUsers', 'Approximate users']
  ] },
  { title: 'Timing and discovery call', fields: [
    ['timeline', 'Target timeframe'], ['budget', 'Budget guidance (optional)'],
    ['callAvailability', 'Preferred call times and timezone'], ['callAttendees', 'Suggested attendees']
  ] }
];

const clean = value => String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();

// Use a fixed field list: stale answers from deselected services and unrelated form
// controls must never be included in an enquiry, even outside the browser UI.
export function buildEnquiry(data) {
  const needs = [...new Set(data.getAll('needs'))].filter(value => Object.hasOwn(NEEDS, value));
  return {
    needs,
    consent: data.get('consent') === 'on',
    sections: sections.filter(section => !section.need || needs.includes(section.need)).map(section => ({
      title: section.title,
      answers: section.fields.map(([name, label]) => ({
        name, label, value: data.getAll(name).map(clean).filter(Boolean).join(', ')
      })).filter(answer => answer.value)
    }))
  };
}

export function buildSummary(enquiry) {
  const lines = [
    'SKUNKWORKS AFRICA — DYNAMICS TRAINING AND LICENSING ENQUIRY',
    '', 'Help requested:', ...enquiry.needs.map(need => '- ' + NEEDS[need])
  ];
  for (const section of enquiry.sections) {
    lines.push('', section.title.toUpperCase());
    if (!section.answers.length) lines.push('Details to discuss during the discovery call.');
    for (const { label, value } of section.answers) lines.push(label + ': ' + value);
  }
  lines.push('', 'Permission to process this enquiry and contact me: ' + (enquiry.consent ? 'Yes' : 'Not provided'));
  lines.push('', 'Call times are preferences only; please confirm availability with me.');
  return lines.join('\n');
}

// Mail clients impose different URI limits. Never silently truncate an enquiry.
// Long enquiries use a subject-only draft and the visible copy/download options.
export function emailDraft(enquiry, maxLength = 1800) {
  const company = enquiry.sections.flatMap(section => section.answers).find(answer => answer.name === 'company')?.value || 'New enquiry';
  const subject = ('Dynamics training and licensing enquiry — ' + company).replace(/[\r\n]/g, ' ');
  const base = 'mailto:' + SALES_EMAIL + '?subject=' + encodeURIComponent(subject);
  const full = base + '&body=' + encodeURIComponent(buildSummary(enquiry));
  return full.length <= maxLength ? { href: full, includesSummary: true } : { href: base, includesSummary: false };
}
