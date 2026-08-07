const http = require('http');
const crypto = require('crypto');

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

function normEndpoint(ep) {
  return {
    name: ep.name || '',
    method: ep.method || 'GET',
    path: ep.path || '/',
    status: Number(ep.status) || 200,
    delay: Number(ep.delay) || 0,
    contentType: ep.contentType || 'application/json',
    headers: ep.headers || {},
    body: ep.body ?? {},
    enabled: ep.enabled !== false,
  };
}

class MockServer {
  constructor() {
    this.server = null;
    this.running = false;
    this.port = 3000;
    this.endpoints = [];
    this.statusListeners = [];
  }

  onStatus(fn) { this.statusListeners.push(fn); }

  _emitStatus(status) {
    this.statusListeners.forEach((fn) => fn(status));
  }

  getState() {
    return { running: this.running, port: this.port };
  }

  getEndpoints() {
    return this.endpoints.map((ep) => ({ ...ep }));
  }

  addEndpoint(ep) {
    const id = crypto.randomBytes(8).toString('hex');
    const created = { id, ...normEndpoint(ep) };
    this.endpoints.push(created);
    return created;
  }

  updateEndpoint(ep) {
    const idx = this.endpoints.findIndex((e) => e.id === ep.id);
    if (idx === -1) return { ok: false, error: 'Endpoint not found' };
    this.endpoints[idx] = { ...this.endpoints[idx], ...normEndpoint(ep), id: ep.id };
    return { ok: true, endpoint: this.endpoints[idx] };
  }

  removeEndpoint(id) {
    this.endpoints = this.endpoints.filter((e) => e.id !== id);
    return { ok: true };
  }

  matchEndpoint(method, pathname) {
    for (const ep of this.endpoints) {
      if (ep.method !== '*' && ep.method !== method) continue;
      const params = matchPath(ep.path, pathname);
      if (params) return { def: ep, params };
    }
    return null;
  }

  handleRequest(req, res, startTime) {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let parsedBody = null;
      try { parsedBody = body ? JSON.parse(body) : null; } catch (_e) { parsedBody = body; }

      const url = new URL(req.url, 'http://localhost');
      const pathname = this.urlDecode(url.pathname);
      const query = Object.fromEntries(url.searchParams.entries());
      const ctx = { request: { query, params: {}, body: parsedBody, header: req.headers } };
      ctx.query = query;
      ctx.params = {};
      ctx.body = parsedBody;
      ctx.header = req.headers;

      const matched = this.matchEndpoint(req.method, pathname);
      if (!matched) {
        this.respond(req, res, null, ctx, startTime, 404, null);
        return;
      }

      ctx.params = matched.params;
      ctx.request.params = matched.params;

      this.respond(req, res, matched.def, ctx, startTime, matched.def.status, matched);
    });
  }

  urlDecode(s) {
    try { return decodeURIComponent(s); } catch (_e) { return s; }
  }

  respond(req, res, def, ctx, startTime, status) {
    let bodyStr = '{"error":"Not Found"}';
    let contentType = 'application/json';
    let code = 404;

    if (def) {
      code = status;
      const rendered = this.renderBody(def.body, ctx);
      bodyStr = typeof rendered === 'string' ? rendered : JSON.stringify(rendered);
      contentType = def.contentType || 'application/json';
    }

    res.statusCode = code;
    res.setHeader('Content-Type', contentType);
    res.end(bodyStr);
  }

  start(config = {}) {
    if (this.running) return { ok: false, error: 'Server already running' };

    this.port = Number(config.port) || 3000;

    this.server = http.createServer((req, res) => {
      const startTime = Date.now();
      this.handleRequest(req, res, startTime);
    });

    return new Promise((resolve) => {
      this.server.on('error', (err) => {
        resolve({ ok: false, error: err.message });
        this.server = null;
      });

      this.server.listen(this.port, () => {
        this.running = true;
        this._emitStatus({ running: true, port: this.port });
        resolve({ ok: true, port: this.port });
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.server) return resolve({ ok: true });
      this.server.close(() => {
        this.running = false;
        this.server = null;
        this._emitStatus({ running: false, port: this.port });
        resolve({ ok: true });
      });
    });
  }
}

module.exports = MockServer;
module.exports.matchPath = matchPath;