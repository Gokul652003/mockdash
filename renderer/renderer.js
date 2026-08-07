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