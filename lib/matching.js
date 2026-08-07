function matchPath(route, urlPath) {
  const routeParts = route.split('/').filter(Boolean);
  const urlParts = urlPath.split('/').filter(Boolean);
  if (routeParts.length !== urlParts.length) return null;
  const params = {};
  for (let i = 0; i < routeParts.length; i++) {
    const r = routeParts[i];
    const u = urlParts[i];
    if (r.startsWith(':')) {
      params[r.slice(1)] = u;
    } else if (r !== u) {
      return null;
    }
  }
  return params;
}

function matchEndpoint(method, pathname, endpoints) {
  for (const ep of endpoints) {
    if (ep.method !== '*' && ep.method !== method) continue;
    const params = matchPath(ep.path, pathname);
    if (params) return { def: ep, params };
  }
  return null;
}

module.exports = { matchPath, matchEndpoint };