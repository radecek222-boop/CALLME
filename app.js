/**
 * CALLME - Modal-based calling app with call history
 */

const customers = [
  { id: "CUST-001", name: "Jan Novák", status: "active", notes: "Preferuje odpoledne", calls: [] },
  { id: "CUST-002", name: "Marie Svobodová", status: "active", notes: "VIP zákazník", calls: [
    { operator: 2, time: "2025-01-09 14:30", connected: true, duration: "03:45" }
  ]},
  { id: "CUST-003", name: "Petr Dvořák", status: "inactive", notes: "", calls: [] },
  { id: "CUST-004", name: "Eva Černá", status: "active", notes: "Zájem o prémiové služby", calls: [
    { operator: 1, time: "2025-01-08 10:15", connected: false, duration: "00:00" },
    { operator: 3, time: "2025-01-09 09:20", connected: true, duration: "05:12" }
  ]},
  { id: "CUST-005", name: "Tomáš Procházka", status: "active", notes: "", calls: [] },
  { id: "CUST-006", name: "Lucie Králová", status: "pending", notes: "Čeká na zpětné volání", calls: [
    { operator: 2, time: "2025-01-10 08:00", connected: false, duration: "00:00" }
  ]},
  { id: "CUST-007", name: "Martin Veselý", status: "active", notes: "Dlouhodobý zákazník", calls: [
    { operator: 4, time: "2025-01-07 16:45", connected: true, duration: "12:30" }
  ]},
  { id: "CUST-008", name: "Kateřina Horáková", status: "active", notes: "", calls: [] },
  { id: "CUST-009", name: "Pavel Němec", status: "active", notes: "", calls: [] },
  { id: "CUST-010", name: "Jana Veselá", status: "pending", notes: "Nový zákazník", calls: [] }
];

// Random operator 1-5
const currentOperator = Math.floor(Math.random() * 5) + 1;

const state = {
  customer: null,
  call: null,
  timer: null,
  startTime: null,
  wasConnected: false
};

const statusText = { active: 'Aktivní', inactive: 'Neaktivní', pending: 'Čeká' };

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('operatorId').textContent = `Operátor č.${currentOperator}`;
  document.getElementById('statusDot').classList.add('demo');
  document.getElementById('statusText').textContent = 'Demo';

  renderList(customers);

  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderList(customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    ));
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });

  // Call buttons
  document.getElementById('btnCall').addEventListener('click', startCall);
  document.getElementById('btnEnd').addEventListener('click', endCall);
});

function renderList(list) {
  document.getElementById('customerList').innerHTML = list.map(c => {
    const lastCall = c.calls.length > 0 ? c.calls[c.calls.length - 1] : null;
    const callStatus = c.calls.length === 0 ? 'no-call' : 'called';
    const callLabel = c.calls.length === 0 ? 'Nevoláno' : 'Voláno';

    return `
      <div class="customer-card" onclick="openModal('${c.id}')">
        <div class="customer-avatar">${initials(c.name)}</div>
        <div class="customer-info">
          <div class="customer-name">${c.name}</div>
          <div class="customer-meta">
            <span class="customer-id">${c.id}</span>
            <span class="call-badge ${callStatus}">${callLabel}</span>
          </div>
        </div>
        <span class="customer-status ${c.status}">${statusText[c.status]}</span>
      </div>
    `;
  }).join('');
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

function openModal(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;

  state.customer = c;
  state.wasConnected = false;

  // Fill modal
  document.getElementById('modalAvatar').textContent = initials(c.name);
  document.getElementById('modalName').textContent = c.name;
  document.getElementById('modalId').textContent = c.id;
  document.getElementById('modalNotes').textContent = c.notes || '';

  // Render call history
  renderCallHistory(c);

  // Reset to call state
  document.getElementById('callControls').style.display = 'block';
  document.getElementById('callActive').style.display = 'none';
  document.getElementById('btnCall').disabled = false;
  document.getElementById('btnCall').innerHTML = '<span class="btn-icon">📞</span><span>ZAVOLAT</span>';

  // Show modal
  document.getElementById('modal').classList.add('active');
}

function renderCallHistory(c) {
  const container = document.getElementById('callHistory');

  if (c.calls.length === 0) {
    container.innerHTML = '<div class="no-history">Ještě nevoláno</div>';
    return;
  }

  container.innerHTML = c.calls.map(call => `
    <div class="history-item ${call.connected ? 'connected' : 'missed'}">
      <div class="history-operator">Operátor č.${call.operator}</div>
      <div class="history-time">${call.time}</div>
      <div class="history-status">
        ${call.connected
          ? `<span class="connected-badge">✓ Spojeno</span> <span class="duration">${call.duration}</span>`
          : '<span class="missed-badge">✗ Nespojeno</span>'
        }
      </div>
    </div>
  `).reverse().join('');
}

function closeModal() {
  if (state.call) {
    if (!confirm('Probíhá hovor. Ukončit?')) return;
    endCall();
  }
  document.getElementById('modal').classList.remove('active');
  state.customer = null;
}

function startCall() {
  if (!state.customer) return;

  const btn = document.getElementById('btnCall');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border:2px solid rgba(57,255,20,0.2);border-top-color:#39ff14;border-radius:50%;animation:spin 1s linear infinite;"></span>';

  setTimeout(() => {
    state.call = true;
    state.startTime = Date.now();
    state.wasConnected = false;

    // Switch UI
    document.getElementById('callControls').style.display = 'none';
    document.getElementById('callActive').style.display = 'block';

    // Set ringing
    const statusEl = document.getElementById('callStatus');
    statusEl.textContent = 'Vyzvání...';
    statusEl.className = 'call-status ringing';

    // Start timer
    updateTimer();
    state.timer = setInterval(updateTimer, 1000);

    // Simulate connect after 2s
    setTimeout(() => {
      if (state.call) {
        statusEl.textContent = 'Spojeno';
        statusEl.className = 'call-status connected';
        state.wasConnected = true;
      }
    }, 2000);

    toast('Hovor zahájen', 'success');
  }, 600);
}

function endCall() {
  // Calculate duration
  const duration = state.startTime ? formatDuration(Date.now() - state.startTime) : '00:00';

  // Stop timer
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  // Save call to history
  if (state.customer) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    state.customer.calls.push({
      operator: currentOperator,
      time: timeStr,
      connected: state.wasConnected,
      duration: state.wasConnected ? duration : '00:00'
    });

    // Update history in modal
    renderCallHistory(state.customer);

    // Update list
    renderList(customers);
  }

  // Update status
  const statusEl = document.getElementById('callStatus');
  statusEl.textContent = 'Hovor ukončen';
  statusEl.className = 'call-status ended';

  state.call = null;
  state.startTime = null;

  toast('Hovor ukončen', 'success');

  // Reset after delay
  setTimeout(() => {
    document.getElementById('callControls').style.display = 'block';
    document.getElementById('callActive').style.display = 'none';
    document.getElementById('callTimer').textContent = '00:00';
    document.getElementById('btnCall').disabled = false;
    document.getElementById('btnCall').innerHTML = '<span class="btn-icon">📞</span><span>ZAVOLAT</span>';
  }, 1500);
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function updateTimer() {
  if (!state.startTime) return;
  document.getElementById('callTimer').textContent = formatDuration(Date.now() - state.startTime);
}

function toast(msg, type) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Global
window.openModal = openModal;
