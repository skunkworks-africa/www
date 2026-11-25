// Public destinations only; do not put credentials, tenant IDs or records here.
// Set a URL only after the corresponding Power Pages site passes its release gate.
export const portalDestinations=Object.freeze({
  customer: null,
  partner: null
});
export function verifiedDestination(kind, value=portalDestinations[kind]) {
  const hosts={customer:'customer.skunkworks.africa',partner:'partner.skunkworks.africa'};
  if(!Object.hasOwn(hosts,kind)||typeof value!=='string')return null;
  try {
    const url=new URL(value);
    if(url.protocol!=='https:'||url.hostname!==hosts[kind]||url.port||url.username||url.password||url.pathname!=='/'||url.search||url.hash)return null;
    return url.href;
  } catch {return null;}
}
