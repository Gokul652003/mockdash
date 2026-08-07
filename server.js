const http = require('http');
const crypto = require('crypto');

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

  start(config = {}) {
    if (this.running) return { ok: false, error: 'Server already running' };

    this.port = Number(config.port) || 3000;

    this.server = http.createServer((req, res) => {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end('{"error":"Not Found"}');
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