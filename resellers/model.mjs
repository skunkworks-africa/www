export function checklist(data) {
  const items = [data.businessType === 'soleTrader' ? 'Business trading evidence and authorised proprietor verification' : 'Company registration and authorised representative verification', 'Business address evidence', 'Reseller agreement'];
  if (data.paymentTerms === 'credit') items.push('Separate credit assessment and finance approval; credit is not guaranteed');
  if (data.country && !['south africa', 'za'].includes(data.country.trim().toLowerCase())) items.push('Country-specific business verification reviewed by Sales Agents');
  return items;
}
// Pure policy evaluation only. The backend must supply authenticated, persisted evidence.
export function approvalOutcome({owners, principals, decisions, version, evidenceComplete, agreementSigned}) {
  if (!Array.isArray(owners) || !owners.length || !Array.isArray(principals) || principals.length !== 2 || new Set(principals).size !== 2 || !Number.isInteger(version) || version < 1) return 'blocked';
  const required = [...new Set([...owners, ...principals])];
  if (required.some(id => typeof id !== 'string' || !id.trim())) return 'blocked';
  const votes = Array.isArray(decisions) ? decisions.filter(d => d.version === version && required.includes(d.actorId)) : [];
  if (votes.some(d => d.decision === 'reject')) return 'rejected';
  if (!evidenceComplete || !agreementSigned) return 'blocked';
  // Conflicting or duplicate votes must be reconciled by the persisted approval service.
  if (required.some(id => votes.filter(d => d.actorId === id).length > 1)) return 'blocked';
  return required.every(id => votes.some(d => d.actorId === id && d.decision === 'approve')) ? 'approved' : 'pending';
}
