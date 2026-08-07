// Wiring and initialisation.
els.addBtn.addEventListener('click', newEndpoint);
els.saveBtn.addEventListener('click', save);
els.deleteBtn.addEventListener('click', removeSelected);
els.toggleBtn.addEventListener('click', toggleServer);
els.clearLogBtn.addEventListener('click', clearLog);

[els.epName, els.epPath, els.epMethod, els.epStatus, els.epDelay,
  els.epContentType, els.epHeaders, els.epBody].forEach((el) => {
  el.addEventListener('input', scheduleLiveApply);
});
els.enabled.addEventListener('change', scheduleLiveApply);

window.api.onLog(addLog);
window.api.onStatus((st) => {
  serverRunning = st.running;
  updateToggleBtn();
});

// Init
clearLog();
updateToggleBtn();
newEndpoint();
window.api.listEndpoints().then((list) => {
  endpoints = list;
  renderEndpointList();
});