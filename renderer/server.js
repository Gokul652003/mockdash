// Server start/stop controls.
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