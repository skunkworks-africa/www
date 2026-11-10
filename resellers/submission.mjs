// Browser-independent mapping for the authenticated applicant API.
// Never send approval state, identity details, document contents or client-controlled actor IDs.
const normalizeCountry=c=>String(c||'').trim().toUpperCase();
export function applicationPayload(fields,noticeVersion) {
  if(!fields||!noticeVersion)throw new Error('Application configuration unavailable');
  const country=normalizeCountry(fields.country);
  const businessType=fields.businessType==='soleTrader'?'sole_trader':fields.businessType;
  if(!/^[A-Z]{2}$/.test(country))throw new Error('Enter a two-letter ISO country code (for example ZA).');
  if(!['company','sole_trader'].includes(businessType))throw new Error('Choose a business type.');
  if(fields.authority!=='on'||fields.acknowledgement!=='on')throw new Error('Both declarations are required.');
  const payload={
    company:String(fields.company||'').trim(),country,businessType,
    registration:String(fields.registration||'').trim(),city:String(fields.city||'').trim(),
    website:String(fields.website||'').trim(),contactName:String(fields.contactName||'').trim(),
    email:String(fields.email||'').trim(),phone:String(fields.phone||'').trim(),
    focus:String(fields.focus||''),paymentTerms:String(fields.paymentTerms||''),
    source:String(fields.source||''),noticeVersion,accepted:true
  };
  if(businessType==='company'&&!payload.registration)throw new Error('Company registration number is required.');
  return payload;
}
