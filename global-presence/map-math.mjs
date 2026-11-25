// Geographic projection helpers. Longitude and latitude are degrees.
export const radians = Math.PI / 180;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const wrapLon = n => ((n + 180) % 360 + 360) % 360 - 180;
export const globeRadius = (width, height, zoom) => Math.min(width, height) * 0.445 * zoom;
export const flatScale = (width, height, zoom) => Math.min(width / 360, height / 180) * 0.96 * zoom;
export function globePoint(lon, lat, centerLon, centerLat) {
  const a = lat * radians, b = centerLat * radians, d = wrapLon(lon - centerLon) * radians;
  return { x: Math.cos(a) * Math.sin(d),
    y: Math.sin(a) * Math.cos(b) - Math.cos(a) * Math.cos(d) * Math.sin(b),
    z: Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(d) * Math.cos(b) };
}
export function inverseGlobe(x, y, centerLon, centerLat) {
  const q = x * x + y * y;
  if (q > 1) return null;
  const z = Math.sqrt(Math.max(0, 1 - q)), b = centerLat * radians;
  return { lat: Math.asin(clamp(y * Math.cos(b) + z * Math.sin(b), -1, 1)) / radians,
    lon: wrapLon(centerLon + Math.atan2(x, z * Math.cos(b) - y * Math.sin(b)) / radians) };
}
export function mapPoint(market, view, width, height) {
  if (view.mode === 'globe') {
    const p = globePoint(market.lon, market.lat, view.lon, view.lat), r = globeRadius(width, height, view.zoom);
    if (p.z < 0.025) return null;
    return {x: width / 2 + p.x * r, y: height / 2 - p.y * r};
  }
  const s = flatScale(width, height, view.zoom);
  return {x: width / 2 + wrapLon(market.lon - view.lon) * s, y: height / 2 - (market.lat - view.lat) * s};
}
export function clusterPoints(points, distance = 36) {
  const groups = [];
  for (const point of points) {
    const group = groups.find(g => Math.hypot(g.x - point.x, g.y - point.y) < distance);
    if (group) group.members.push(point);
    else groups.push({x:point.x, y:point.y, members:[point]});
  }
  return groups;
}
export function matchesMarket(market, query, region, status) {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase();
  return (!region || market.region === region) && (!status || market.status === status)
    && normalize([market.country, market.region, market.status, market.code].join(' ')).includes(normalize(query.trim()));
}
