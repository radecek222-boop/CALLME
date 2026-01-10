/**
 * CALLME - Operator Call Center Application
 * Frontend JavaScript
 */

// Application State
const state = {
  customers: [],
  selectedCustomer: null,
  currentCall: null,
  callTimer: null,
  callStartTime: null,
  twilioConfigured: false,
  operatorId: `OP-${generateId()}`
};

// DOM Elements
const elements = {
  customerList: document.getElementById('customerList'),
  searchInput: document.getElementById('searchInput'),
  selectedCustomerPanel: document.getElementById('selectedCustomerPanel'),
  noSelectionPanel: document.getElementById('noSelectionPanel'),
  callButton: document.getElementById('callButton'),
  callStatus: document.getElementById('callStatus'),
  callTimer: document.getElementById('callTimer'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize application
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await checkTwilioStatus();
  await loadCustomers();
  setupEventListeners();
}

// Generate random ID
function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Check Twilio configuration status
async function checkTwilioStatus() {
  try {
    const response = await fetch('/api/twilio/status');
    const data = await response.json();
    state.twilioConfigured = data.configured;

    elements.statusDot.classList.toggle('demo', !data.configured);
    elements.statusText.textContent = data.configured ? 'Online' : 'Demo Mode';
  } catch (error) {
    console.error('Failed to check Twilio status:', error);
    elements.statusText.textContent = 'Offline';
  }
}

// Load customers from API
async function loadCustomers() {
  try {
    showLoading(true);
    const response = await fetch('/api/customers');
    state.customers = await response.json();
    renderCustomerList(state.customers);
  } catch (error) {
    console.error('Failed to load customers:', error);
    showToast('Nepodařilo se načíst zákazníky', 'error');
  } finally {
    showLoading(false);
  }
}

// Render customer list
function renderCustomerList(customers) {
  elements.customerList.innerHTML = customers.map(customer => `
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
async function handleCallButton() {
  if (state.currentCall) {
    await endCall();
  } else {
    await initiateCall();
  }
}

// Initiate call to customer
async function initiateCall() {
  if (!state.selectedCustomer) {
    showToast('Vyberte zákazníka', 'warning');
    return;
  }

  try {
    elements.callButton.disabled = true;
    elements.callButton.innerHTML = '<span class="spinner"></span> Spojuji...';

    const response = await fetch('/api/call/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: state.selectedCustomer.id,
        operatorId: state.operatorId
      })
    });

    const data = await response.json();

    if (data.success) {
      state.currentCall = data;
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

      // Simulate connection after 2 seconds (in real scenario, Twilio webhook would update this)
      setTimeout(() => {
        if (state.currentCall) {
          updateCallStatus('connected', 'Spojeno');
        }
      }, 2000);

      showToast(data.demoMode
        ? 'Demo hovor zahájen (Twilio není nakonfigurováno)'
        : 'Hovor zahájen', 'success');
    } else {
      showToast(data.error || 'Nepodařilo se zahájit hovor', 'error');
      resetCallUI();
    }
  } catch (error) {
    console.error('Call initiation failed:', error);
    showToast('Chyba při zahajování hovoru', 'error');
    resetCallUI();
  }
}

// End active call
async function endCall() {
  if (!state.currentCall) return;

  try {
    const response = await fetch('/api/call/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callSid: state.currentCall.callSid })
    });

    await response.json();

    stopCallTimer();
    updateCallStatus('ended', 'Hovor ukončen');

    showToast('Hovor byl ukončen', 'success');

    // Reset after showing ended status
    setTimeout(() => {
      resetCallUI();
    }, 2000);

  } catch (error) {
    console.error('Failed to end call:', error);
    showToast('Chyba při ukončování hovoru', 'error');
  }
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

// Show/hide loading state
function showLoading(show) {
  if (show) {
    elements.customerList.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }
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
