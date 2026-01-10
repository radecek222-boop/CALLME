/**
 * CALLME - Operator Call Center Application
 * Static version for GitHub Pages (demo mode)
 */

// Mock Customer Database (phone numbers hidden - never exposed)
const customers = [
  {
    id: "CUST-001",
    name: "Jan Novák",
    email: "jan.novak@email.cz",
    status: "active",
    lastContact: "2025-12-15",
    notes: "Preferuje volání v odpoledních hodinách"
  },
  {
    id: "CUST-002",
    name: "Marie Svobodová",
    email: "marie.s@email.cz",
    status: "active",
    lastContact: "2025-12-10",
    notes: "VIP zákazník"
  },
  {
    id: "CUST-003",
    name: "Petr Dvořák",
    email: "petr.dvorak@email.cz",
    status: "inactive",
    lastContact: "2025-11-20",
    notes: ""
  },
  {
    id: "CUST-004",
    name: "Eva Černá",
    email: "eva.cerna@email.cz",
    status: "active",
    lastContact: "2025-12-18",
    notes: "Zájem o prémiové služby"
  },
  {
    id: "CUST-005",
    name: "Tomáš Procházka",
    email: "tomas.p@email.cz",
    status: "active",
    lastContact: "2025-12-12",
    notes: ""
  },
  {
    id: "CUST-006",
    name: "Lucie Králová",
    email: "lucie.kralova@email.cz",
    status: "pending",
    lastContact: "2025-12-01",
    notes: "Čeká na zpětné volání"
  },
  {
    id: "CUST-007",
    name: "Martin Veselý",
    email: "martin.v@email.cz",
    status: "active",
    lastContact: "2025-12-19",
    notes: "Dlouhodobý zákazník"
  },
  {
    id: "CUST-008",
    name: "Kateřina Horáková",
    email: "katerina.h@email.cz",
    status: "active",
    lastContact: "2025-12-17",
    notes: ""
  }
];

// Application State
const state = {
  customers: customers,
  selectedCustomer: null,
  currentCall: null,
  callTimer: null,
  callStartTime: null,
  operatorId: `OP-${generateId()}`
};

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// DOM Elements
let elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
  elements = {
    customerList: document.getElementById('customerList'),
    searchInput: document.getElementById('searchInput'),
    selectedCustomerPanel: document.getElementById('selectedCustomerPanel'),
    noSelectionPanel: document.getElementById('noSelectionPanel'),
    callButton: document.getElementById('callButton'),
    callStatus: document.getElementById('callStatus'),
    callTimer: document.getElementById('callTimer'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    toastContainer: document.getElementById('toastContainer'),
    operatorIdDisplay: document.getElementById('operatorId')
  };

  // Set demo mode indicator
  elements.statusDot.classList.add('demo');
  elements.statusText.textContent = 'Demo Mode';
  elements.operatorIdDisplay.textContent = state.operatorId;

  renderCustomerList(state.customers);
  setupEventListeners();

  showToast('Aplikace běží v demo režimu', 'warning');
}

// Render customer list
function renderCustomerList(customersList) {
  elements.customerList.innerHTML = customersList.map(customer => `
    <div class="customer-card ${state.selectedCustomer?.id === customer.id ? 'selected' : ''}"
         data-id="${customer.id}"
         onclick="selectCustomer('${customer.id}')">
      <div class="customer-info">
        <div class="customer-avatar">${getInitials(customer.name)}</div>
        <div class="customer-details">
          <h3>${customer.name}</h3>
          <span class="customer-id">${customer.id}</span>
        </div>
      </div>
      <span class="customer-status ${customer.status}">${getStatusLabel(customer.status)}</span>
    </div>
  `).join('');
}

// Get customer initials
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Get status label in Czech
function getStatusLabel(status) {
  const labels = {
    active: 'Aktivní',
    inactive: 'Neaktivní',
    pending: 'Čeká'
  };
  return labels[status] || status;
}

// Select a customer
function selectCustomer(customerId) {
  const customer = state.customers.find(c => c.id === customerId);
  if (!customer) return;

  state.selectedCustomer = customer;
  renderCustomerList(state.customers);
  renderSelectedCustomer(customer);
}

// Render selected customer panel
function renderSelectedCustomer(customer) {
  elements.noSelectionPanel.style.display = 'none';
  elements.selectedCustomerPanel.style.display = 'block';

  document.getElementById('selectedAvatar').textContent = getInitials(customer.name);
  document.getElementById('selectedName').textContent = customer.name;
  document.getElementById('selectedId').textContent = customer.id;
  document.getElementById('customerNotes').textContent = customer.notes || 'Žádné poznámky';
  document.getElementById('notesSection').style.display = 'block';

  // Reset call UI
  elements.callButton.className = 'call-button initiate';
  elements.callButton.innerHTML = '<span>📞</span> Zavolat zákazníkovi';
  elements.callButton.disabled = false;
  elements.callStatus.style.display = 'none';
  elements.callTimer.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  elements.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = state.customers.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    );
    renderCustomerList(filtered);
  });

  // Call button
  elements.callButton.addEventListener('click', handleCallButton);
}

// Handle call button click
function handleCallButton() {
  if (state.currentCall) {
    endCall();
  } else {
    initiateCall();
  }
}

// Initiate call to customer (demo mode)
function initiateCall() {
  if (!state.selectedCustomer) {
    showToast('Vyberte zákazníka', 'warning');
    return;
  }

  // Simulate call initiation
  elements.callButton.disabled = true;
  elements.callButton.innerHTML = '<span class="spinner"></span> Spojuji...';

  setTimeout(() => {
    const demoCallSid = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    state.currentCall = {
      callSid: demoCallSid,
      customerId: state.selectedCustomer.id,
      customerName: state.selectedCustomer.name
    };
    state.callStartTime = new Date();

    // Update UI for active call
    elements.callButton.className = 'call-button end';
    elements.callButton.innerHTML = '<span>📵</span> Ukončit hovor';
    elements.callButton.disabled = false;

    // Show call status
    elements.callStatus.style.display = 'block';
    updateCallStatus('ringing', 'Vyzvání...');

    // Start call timer
    startCallTimer();

    // Simulate connection after 2 seconds
    setTimeout(() => {
      if (state.currentCall) {
        updateCallStatus('connected', 'Spojeno');
      }
    }, 2000);

    showToast('Demo hovor zahájen (pro reálné volání připojte Twilio)', 'success');
  }, 1000);
}

// End active call
function endCall() {
  if (!state.currentCall) return;

  stopCallTimer();
  updateCallStatus('ended', 'Hovor ukončen');

  showToast('Hovor byl ukončen', 'success');

  // Reset after showing ended status
  setTimeout(() => {
    resetCallUI();
  }, 2000);
}

// Update call status display
function updateCallStatus(status, text) {
  const statusValue = document.getElementById('callStatusValue');
  statusValue.textContent = text;
  statusValue.className = `call-status-value ${status}`;
}

// Start call timer
function startCallTimer() {
  elements.callTimer.style.display = 'block';
  state.callTimer = setInterval(updateTimer, 1000);
  updateTimer();
}

// Stop call timer
function stopCallTimer() {
  if (state.callTimer) {
    clearInterval(state.callTimer);
    state.callTimer = null;
  }
}

// Update timer display
function updateTimer() {
  if (!state.callStartTime) return;

  const elapsed = Math.floor((new Date() - state.callStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  elements.callTimer.textContent = `${minutes}:${seconds}`;
}

// Reset call UI to initial state
function resetCallUI() {
  state.currentCall = null;
  state.callStartTime = null;
  stopCallTimer();

  elements.callButton.className = 'call-button initiate';
  elements.callButton.innerHTML = '<span>📞</span> Zavolat zákazníkovi';
  elements.callButton.disabled = false;
  elements.callStatus.style.display = 'none';
  elements.callTimer.style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Make functions available globally
window.selectCustomer = selectCustomer;
