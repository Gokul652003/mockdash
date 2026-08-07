const crypto = require('crypto');

function resolveExpr(expr, ctx) {
  const parts = expr.split('.');
  const root = parts[0];

  if (root === 'random') {
    const kind = parts[1];
    if (kind === 'guid') return crypto.randomBytes(16).toString('hex');
    if (kind === 'int') {
      const a = parseInt(parts[2] || '1', 10);
      const b = parseInt(parts[3] || '1000', 10);
      return Math.floor(Math.random() * (b - a + 1)) + a;
    }
    return Math.random();
  }

  if (root === 'timestamp') {
    const kind = parts[1];
    if (kind === 'iso') return new Date().toISOString();
    return Math.floor(Date.now() / 1000);
  }

  let value = ctx[parts[0]];
  for (let i = 1; i < parts.length && value != null; i++) {
    value = value[parts[i]];
  }
  return value != null ? value : '';
}

function renderTemplate(str, ctx) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*([a-zA-Z0-9._-]+)\s*\}\}/g, (_m, expr) => {
    return String(resolveExpr(expr, ctx));
  });
}

module.exports = { resolveExpr, renderTemplate };