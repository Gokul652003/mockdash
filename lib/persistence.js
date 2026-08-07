const fs = require('fs');

function save(file, endpoints) {
  try {
    fs.writeFileSync(file, JSON.stringify({ endpoints }, null, 2));
  } catch (_e) { /* ignore write errors */ }
}

function load(file, normalize) {
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return (data.endpoints || []).map(normalize);
    }
  } catch (_e) { /* fall through to empty */ }
  return [];
}

module.exports = { save, load };