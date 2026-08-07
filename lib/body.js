const { renderTemplate } = require('./templating');

function filterArray(items, query = {}) {
  const keys = Object.keys(query).filter((k) =>
    items.some((it) => it && typeof it === 'object' && k in it)
  );
  if (keys.length === 0) return items;
  return items.filter((item) =>
    keys.every((k) => item != null && String(item[k]) === String(query[k]))
  );
}

function renderBody(template, ctx) {
  if (template == null || template === '') return '';
  if (Array.isArray(template)) {
    template = filterArray(template, ctx.query);
  }
  if (typeof template === 'object') {
    const render = (val) => {
      if (typeof val === 'string') return renderTemplate(val, ctx);
      if (Array.isArray(val)) return val.map(render);
      if (val && typeof val === 'object') {
        const out = {};
        for (const k of Object.keys(val)) out[k] = render(val[k]);
        return out;
      }
      return val;
    };
    return render(template);
  }
  return renderTemplate(template, ctx);
}

module.exports = { renderBody, filterArray };