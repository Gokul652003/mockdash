// Sidebar endpoint list rendering and selection.
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