/**
 * CALLME - Modal-based calling app
 */

const customers = [
  { id: "CUST-001", name: "Jan Novák", status: "active", notes: "Preferuje odpoledne" },
  { id: "CUST-002", name: "Marie Svobodová", status: "active", notes: "VIP zákazník" },
  { id: "CUST-003", name: "Petr Dvořák", status: "inactive", notes: "" },
  { id: "CUST-004", name: "Eva Černá", status: "active", notes: "Zájem o prémiové služby" },
  { id: "CUST-005", name: "Tomáš Procházka", status: "active", notes: "" },
  { id: "CUST-006", name: "Lucie Králová", status: "pending", notes: "Čeká na zpětné volání" },
  { id: "CUST-007", name: "Martin Veselý", status: "active", notes: "Dlouhodobý zákazník" },
  { id: "CUST-008", name: "Kateřina Horáková", status: "active", notes: "" },
  { id: "CUST-009", name: "Pavel Němec", status: "active", notes: "" },
  { id: "CUST-010", name: "Jana Veselá", status: "pending", notes: "Nový zákazník" }
];

const state = {
  customer: null,
  call: null,
  timer: null,
  startTime: null,
  operator: `OP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
};

const statusText = { active: 'Aktivní', inactive: 'Neaktivní', pending: 'Čeká' };

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('operatorId').textContent = state.operator;
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
  document.getElementById('customerList').innerHTML = list.map(c => `
    <div class="customer-card" onclick="openModal('${c.id}')">
      <div class="customer-avatar">${initials(c.name)}</div>
      <div class="customer-info">
        <div class="customer-name">${c.name}</div>
        <div class="customer-id">${c.id}</div>
      </div>
      <span class="customer-status ${c.status}">${statusText[c.status]}</span>
    </div>
  `).join('');
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

function openModal(id) {
  const c = customers.find(x => x.id === id);
  if (!c) return;

  state.customer = c;

  // Fill modal
  document.getElementById('modalAvatar').textContent = initials(c.name);
  document.getElementById('modalName').textContent = c.name;
  document.getElementById('modalId').textContent = c.id;
  document.getElementById('modalNotes').textContent = c.notes || '';

  // Reset to call state
  document.getElementById('callControls').style.display = 'block';
  document.getElementById('callActive').style.display = 'none';
  document.getElementById('btnCall').disabled = false;

  // Show modal
  document.getElementById('modal').classList.add('active');
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
      }
    }, 2000);

    toast('Hovor zahájen', 'success');
  }, 600);
}

function endCall() {
  // Stop timer
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  // Update status
  const statusEl = document.getElementById('callStatus');
  statusEl.textContent = 'Hovor ukončen';
  statusEl.className = 'call-status ended';

  state.call = null;

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

function updateTimer() {
  if (!state.startTime) return;
  const s = Math.floor((Date.now() - state.startTime) / 1000);
  const m = Math.floor(s / 60);
  document.getElementById('callTimer').textContent =
    `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
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
