const els = {
  port: document.getElementById('port'),
  toggleBtn: document.getElementById('toggleBtn'),
  status: document.getElementById('status'),
  endpointList: document.getElementById('endpointList'),
  addBtn: document.getElementById('addBtn'),
  editor: document.getElementById('editor'),
  placeholder: document.getElementById('placeholder'),
  editorTitle: document.getElementById('editorTitle'),
  epName: document.getElementById('epName'),
  epPath: document.getElementById('epPath'),
  epMethod: document.getElementById('epMethod'),
  epStatus: document.getElementById('epStatus'),
  epDelay: document.getElementById('epDelay'),
  epContentType: document.getElementById('epContentType'),
  epHeaders: document.getElementById('epHeaders'),
  epBody: document.getElementById('epBody'),
  enabled: document.getElementById('enabled'),
  saveBtn: document.getElementById('saveBtn'),
  saveMsg: document.getElementById('saveMsg'),
  deleteBtn: document.getElementById('deleteBtn'),
  logList: document.getElementById('logList'),
  clearLogBtn: document.getElementById('clearLogBtn'),
};

let endpoints = [];
let selectedId = null;
let serverRunning = false;
let editing = false;

const METHOD_COLORS = {
  GET: 'accent', POST: 'green', PUT: 'yellow', PATCH: 'yellow', DELETE: 'red', '*': 'muted',
};

function statusClass(code) {
  if (code >= 500) return 's5xx';
  if (code >= 400) return 's4xx';
  if (code >= 300) return 's3xx';
  return 's2xx';
}

function renderEndpointList() {
  const list = els.endpointList;
  list.innerHTML = '';

  if (endpoints.length === 0) {
    list.classList.add('empty');
    list.textContent = 'No endpoints yet. Click + Add';
    return;
  }

  list.classList.remove('empty');

  endpoints.forEach((ep) => {
    const li = document.createElement('li');
    li.className = 'ep-item' + (ep.id === selectedId ? ' active' : '');
    li.dataset.id = ep.id;

    const name = ep.name || ep.path;
    li.innerHTML = `
      <div class="ep-row">
        <span class="ep-method">${ep.method}</span>
        <span class="ep-path">${name}</span>
      </div>
      <div class="ep-meta">
        <span class="ep-status ${statusClass(ep.status)}">${ep.status}</span>
        <span>${ep.enabled ? '' : 'disabled'}</span>
      </div>`;

    li.addEventListener('click', () => selectEndpoint(ep.id));
    list.appendChild(li);
  });
}

function selectEndpoint(id) {
  const ep = endpoints.find((e) => e.id === id);
  if (!ep) return;
  selectedId = id;
  editing = true;

  els.placeholder.classList.add('hidden');
  els.editor.classList.remove('hidden');
  els.editorTitle.textContent = 'Edit Endpoint';
  els.deleteBtn.classList.remove('hidden');

  els.epName.value = ep.name || '';
  els.epPath.value = ep.path || '';
  els.epMethod.value = ep.method || 'GET';
  els.epStatus.value = ep.status;
  els.epDelay.value = ep.delay;
  els.epContentType.value = ep.contentType || 'application/json';
  els.epHeaders.value = JSON.stringify(ep.headers || {}, null, 2);
  els.epBody.value = typeof ep.body === 'string'
    ? ep.body
    : JSON.stringify(ep.body ?? {}, null, 2);
  els.enabled.checked = ep.enabled !== false;

  renderEndpointList();
}

function newEndpoint() {
  selectedId = null;
  editing = false;

  els.placeholder.classList.add('hidden');
  els.editor.classList.remove('hidden');
  els.editorTitle.textContent = 'New Endpoint';
  els.deleteBtn.classList.add('hidden');

  els.epName.value = '';
  els.epPath.value = '/api/example';
  els.epMethod.value = 'GET';
  els.epStatus.value = 200;
  els.epDelay.value = 0;
  els.epContentType.value = 'application/json';
  els.epHeaders.value = '{\n  "X-Mock": "true"\n}';
  els.epBody.value = '{\n  "message": "hello world"\n}';
  els.enabled.checked = true;

  renderEndpointList();
}

function readForm() {
  let headers = {};
  try {
    headers = JSON.parse(els.epHeaders.value || '{}');
  } catch (_e) {
    alert('Headers must be valid JSON');
    return null;
  }

  let body = els.epBody.value;
  try {
    body = JSON.parse(body);
  } catch (_e) {
    // keep as raw string (text response)
  }

  return {
    id: selectedId,
    name: els.epName.value.trim(),
    method: els.epMethod.value,
    path: els.epPath.value.trim() || '/',
    status: Number(els.epStatus.value) || 200,
    delay: Number(els.epDelay.value) || 0,
    contentType: els.epContentType.value,
    headers,
    body,
    enabled: els.enabled.checked,
  };
}

async function save() {
  const data = readForm();
  if (!data) return;

  let result;
  if (editing) {
    result = await window.api.updateEndpoint(data);
    if (result.ok) {
      const idx = endpoints.findIndex((e) => e.id === data.id);
      endpoints[idx] = { ...endpoints[idx], ...result.endpoint };
    }
  } else {
    const created = await window.api.addEndpoint(data);
    endpoints.push(created);
    selectedId = created.id;
    editing = true;
    els.deleteBtn.classList.remove('hidden');
    els.editorTitle.textContent = 'Edit Endpoint';
  }

  els.saveMsg.textContent = 'Saved';
  setTimeout(() => { els.saveMsg.textContent = ''; }, 1500);
  renderEndpointList();
}

async function removeSelected() {
  if (!selectedId) return;
  if (!confirm('Delete this endpoint?')) return;
  await window.api.removeEndpoint(selectedId);
  endpoints = endpoints.filter((e) => e.id !== selectedId);
  selectedId = null;
  editing = false;
  els.editor.classList.add('hidden');
  els.placeholder.classList.remove('hidden');
  renderEndpointList();
}

function updateToggleBtn() {
  els.toggleBtn.textContent = serverRunning ? 'Stop' : 'Start';
  els.toggleBtn.className = 'btn ' + (serverRunning ? 'stop' : 'start');
  els.status.textContent = serverRunning ? `Running on port ${els.port.value}` : 'Stopped';
  els.status.className = 'status ' + (serverRunning ? 'running' : 'stopped');
}

async function toggleServer() {
  if (serverRunning) {
    await window.api.serverStop();
  } else {
    const res = await window.api.serverStart({ port: Number(els.port.value) });
    if (!res.ok) {
      alert('Failed to start: ' + res.error);
      return;
    }
  }
}