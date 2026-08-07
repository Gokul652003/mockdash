// Endpoint form reading, save/delete, and live apply-while-editing.
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

// Live edit: apply form changes to the running server as the user types,
// without alerting, and without persisting to disk (Save persists).
function readLiveForm() {
  if (!selectedId) return null;
  let headers = {};
  try {
    headers = JSON.parse(els.epHeaders.value || '{}');
  } catch (_e) {
    return null;
  }
  let body = els.epBody.value;
  try {
    body = JSON.parse(body);
  } catch (_e) {
    // keep raw string (text response)
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

let liveTimer = null;
function scheduleLiveApply() {
  if (!editing || !selectedId) return;
  clearTimeout(liveTimer);
  liveTimer = setTimeout(async () => {
    const data = readLiveForm();
    if (!data) return;
    const res = await window.api.applyEndpoint(data);
    if (res && res.ok) {
      const idx = endpoints.findIndex((e) => e.id === data.id);
      if (idx > -1) endpoints[idx] = { ...endpoints[idx], ...res.endpoint };
      renderEndpointList();
    }
  }, 250);
}