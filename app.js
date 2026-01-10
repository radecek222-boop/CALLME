/**
 * CALLME - Compact Mobile App with Overlay
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
  selectedCustomer: null,
  currentCall: null,
  callTimer: null,
  callStartTime: null,
  operatorId: `OP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
};

const statusLabels = { active: 'Aktivní', inactive: 'Neaktivní', pending: 'Čeká' };

document.addEventListener('DOMContentLoaded', init);

function init() {
  document.getElementById('operatorId').textContent = state.operatorId;
  document.getElementById('statusDot').classList.add('demo');
  document.getElementById('statusText').textContent = 'Demo';

  renderCustomerList(customers);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    renderCustomerList(customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    ));
  });

  document.getElementById('closeOverlay').addEventListener('click', closeOverlay);
  document.getElementById('callOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'callOverlay') closeOverlay();
  });
  document.getElementById('callButton').addEventListener('click', handleCall);
}

function renderCustomerList(list) {
  document.getElementById('customerList').innerHTML = list.map(c => `
    <div class="customer-card" onclick="openCustomer('${c.id}')">
      <div class="customer-avatar">${getInitials(c.name)}</div>
      <div class="customer-info">
        <div class="customer-name">${c.name}</div>
        <div class="customer-id">${c.id}</div>
      </div>
      <span class="customer-status ${c.status}">${statusLabels[c.status]}</span>
    </div>
  `).join('');
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

function openCustomer(id) {
  const customer = customers.find(c => c.id === id);
  if (!customer) return;

  state.selectedCustomer = customer;
  resetCallUI();

  document.getElementById('overlayAvatar').textContent = getInitials(customer.name);
  document.getElementById('overlayName').textContent = customer.name;
  document.getElementById('overlayId').textContent = customer.id;
  document.getElementById('overlayNotes').textContent = customer.notes || '';

  document.getElementById('callOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  if (state.currentCall) {
    if (!confirm('Probíhá hovor. Opravdu zavřít?')) return;
    endCall();
  }
  document.getElementById('callOverlay').classList.remove('active');
  document.body.style.overflow = '';
  state.selectedCustomer = null;
}

function handleCall() {
  if (state.currentCall) {
    endCall();
  } else {
    initiateCall();
  }
}

function initiateCall() {
  if (!state.selectedCustomer) return;

  const btn = document.getElementById('callButton');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span>';

  setTimeout(() => {
    state.currentCall = { id: `CALL-${Date.now()}` };
    state.callStartTime = new Date();

    btn.className = 'call-button end';
    btn.innerHTML = '<span>📵</span> UKONČIT';
    btn.disabled = false;

    document.getElementById('callStatus').style.display = 'block';
    updateCallStatus('ringing', 'Vyzvání...');
    startTimer();

    setTimeout(() => {
      if (state.currentCall) updateCallStatus('connected', 'Spojeno');
    }, 2000);

    showToast('Demo hovor zahájen', 'success');
  }, 800);
}

function endCall() {
  stopTimer();
  updateCallStatus('ended', 'Ukončeno');
  showToast('Hovor ukončen', 'success');

  setTimeout(resetCallUI, 1500);
}

function resetCallUI() {
  state.currentCall = null;
  state.callStartTime = null;
  stopTimer();

  const btn = document.getElementById('callButton');
  btn.className = 'call-button initiate';
  btn.innerHTML = '<span>📞</span> ZAVOLAT';
  btn.disabled = false;

  document.getElementById('callStatus').style.display = 'none';
  document.getElementById('callTimer').textContent = '00:00';
}

function updateCallStatus(status, text) {
  const el = document.getElementById('callStatusValue');
  el.textContent = text;
  el.className = 'call-status-value ' + status;
}

function startTimer() {
  updateTimerDisplay();
  state.callTimer = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
  if (state.callTimer) {
    clearInterval(state.callTimer);
    state.callTimer = null;
  }
}

function updateTimerDisplay() {
  if (!state.callStartTime) return;
  const s = Math.floor((Date.now() - state.callStartTime) / 1000);
  document.getElementById('callTimer').textContent =
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.openCustomer = openCustomer;
