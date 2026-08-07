const http = require('http');

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