/**
 * CALLME - Modal-based calling app with call history
 * Includes warranty/out-of-warranty filter
 */

const customers = [
  // Záruční servis (přihlášení zákazníci)
  { id: "NCE25-00001923-52", name: "Jan Novák", status: "active", serviceType: "warranty", seller: "Šimon Strejček", notes: "C244 - Levante", calls: [] },
  { id: "NCE25-00002417-37", name: "Marie Svobodová", status: "active", serviceType: "warranty", seller: "Šimon Strejček", notes: "C074 Trionfo, VIP zákazník", calls: [
    { operator: 2, time: "2025-01-09 14:30", connected: true, duration: "03:45" }
  ]},
  { id: "NBU26-00001886-50", name: "Petr Dvořák", status: "active", serviceType: "warranty", seller: "Natálie Vimrová", notes: "B995 Meraviglia", calls: [] },
  { id: "OLM4-00003872-49", name: "Eva Černá", status: "active", serviceType: "warranty", seller: "Monika Jančová", notes: "Konferenční stolek Mesa", calls: [
    { operator: 1, time: "2025-01-08 10:15", connected: false, duration: "00:00" },
    { operator: 3, time: "2025-01-09 09:20", connected: true, duration: "05:12" }
  ]},
  { id: "NCE25-00002429-38", name: "Tomáš Procházka", status: "active", serviceType: "warranty", seller: "Šimon Strejček", notes: "C074 Trionfo", calls: [] },
  { id: "NBU26-00002110-40", name: "Lucie Králová", status: "pending", serviceType: "warranty", seller: "Natálie Vimrová", notes: "C255 Macao, čeká na díly", calls: [
    { operator: 2, time: "2025-01-10 08:00", connected: false, duration: "00:00" }
  ]},
  { id: "NCE25-00001945-04", name: "Martin Veselý", status: "active", serviceType: "warranty", seller: "Natálie Vimrová", notes: "C200 GREG", calls: [
    { operator: 4, time: "2025-01-07 16:45", connected: true, duration: "12:30" }
  ]},

  // Mimozáruční servis (bez přihlášení)
  { id: "POZ/2025/30-12/01", name: "Kateřina Horáková", status: "active", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "C244 Levante, Pod Ateliéry", calls: [] },
  { id: "POZ/2025/08-12/01", name: "Pavel Němec", status: "active", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "V826-016-2584, Úvaly", calls: [] },
  { id: "POZ/2026/07-01/01", name: "Jana Veselá", status: "pending", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "C244 Levante", calls: [] },
  { id: "POZ/2026/06-01/01", name: "Karel Novotný", status: "active", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "Senovážné náměstí", calls: [] },
  { id: "POZ/2025/29-12/01", name: "Alena Marková", status: "active", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "C244, Artistů", calls: [
    { operator: 3, time: "2025-12-29 11:00", connected: true, duration: "08:22" }
  ]},
  { id: "POZ/2025/17-12/01", name: "Roman Fiala", status: "inactive", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "ILJA, Bratislava", calls: [] },
  { id: "POZ/2025/09-12/01", name: "Simona Benešová", status: "active", serviceType: "out-of-warranty", seller: "Mimozáruční servis", notes: "B790 Forza, Jesenice", calls: [] }
];

// Random operator 1-5
const currentOperator = Math.floor(Math.random() * 5) + 1;

const state = {
  customer: null,
  call: null,
  timer: null,
  startTime: null,
  wasConnected: false,
  includeOutOfWarranty: true
};

const statusText = { active: 'Aktivní', inactive: 'Neaktivní', pending: 'Čeká' };
const serviceTypeText = { 'warranty': 'Záruční', 'out-of-warranty': 'Mimozáruční' };

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('operatorId').textContent = `Operátor č.${currentOperator}`;
  document.getElementById('statusDot').classList.add('demo');
  document.getElementById('statusText').textContent = 'Demo';

  // Initial render
  applyFilters();

  // Search
  document.getElementById('searchInput').addEventListener('input', applyFilters);

  // Out of warranty checkbox
  document.getElementById('includeOutOfWarranty').addEventListener('change', (e) => {
    state.includeOutOfWarranty = e.target.checked;
    applyFilters();
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

function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase();

  let filtered = customers.filter(c => {
    // Text search
    const matchesSearch = c.name.toLowerCase().includes(query) ||
                          c.id.toLowerCase().includes(query) ||
                          (c.seller && c.seller.toLowerCase().includes(query));

    // Service type filter
    const matchesServiceType = state.includeOutOfWarranty || c.serviceType === 'warranty';

    return matchesSearch && matchesServiceType;
  });

  renderList(filtered);
}

function renderList(list) {
  if (list.length === 0) {
    document.getElementById('customerList').innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div>Žádní zákazníci nenalezeni</div>
      </div>
    `;
    return;
  }

  document.getElementById('customerList').innerHTML = list.map(c => {
    const callStatus = c.calls.length === 0 ? 'no-call' : 'called';
    const callLabel = c.calls.length === 0 ? 'Nevoláno' : 'Voláno';
    const serviceClass = c.serviceType === 'out-of-warranty' ? 'out-of-warranty' : 'warranty';

    return `
      <div class="customer-card" onclick="openModal('${c.id}')">
        <div class="customer-avatar">${initials(c.name)}</div>
        <div class="customer-info">
          <div class="customer-name">${c.name}</div>
          <div class="customer-meta">
            <span class="customer-id">${c.id}</span>
            <span class="call-badge ${callStatus}">${callLabel}</span>
          </div>
          <div class="customer-service ${serviceClass}">${serviceTypeText[c.serviceType]}</div>
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

  // Service type badge
  const serviceEl = document.getElementById('modalServiceType');
  serviceEl.textContent = serviceTypeText[c.serviceType] + (c.seller ? ` • ${c.seller}` : '');
  serviceEl.className = `modal-service-type ${c.serviceType === 'out-of-warranty' ? 'out-of-warranty' : 'warranty'}`;

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
    applyFilters();
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
