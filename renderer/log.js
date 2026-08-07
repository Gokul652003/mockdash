// Request log rendering.
function addLog(entry) {
  const li = document.createElement('li');
  li.className = 'log-item';

  const time = new Date(entry.date);
  const hhmmss = time.toTimeString().slice(0, 8);
  const method = entry.method || 'SYS';
  const methodClass = (method || '').toLowerCase();
  const statusCls = statusClass(entry.status);

  li.innerHTML = `
    <span class="log-time">${hhmmss}</span>
    <span class="log-method ${methodClass}">${method}</span>
    <span class="log-status ${statusCls}">${entry.status}</span>
    <span class="log-path">${entry.path}</span>
    <span class="log-duration">${entry.duration}ms</span>`;

  els.logList.classList.remove('empty');
  els.logList.appendChild(li);
  els.logList.scrollTop = els.logList.scrollHeight;
}

function clearLog() {
  els.logList.innerHTML = '';
  els.logList.classList.add('empty');
  els.logList.textContent = 'No requests yet';
}