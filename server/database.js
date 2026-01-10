/**
 * Mock database for customers
 * In production, replace with real database (PostgreSQL, MongoDB, etc.)
 *
 * IMPORTANT: Phone numbers are stored securely and NEVER exposed to operators
 * Operators only see customer ID and name
 */

const customers = [
  {
    id: "CUST-001",
    name: "Jan Novák",
    phone: "+420123456789", // Hidden from operators
    email: "jan.novak@email.cz",
    status: "active",
    lastContact: "2025-12-15",
    notes: "Preferuje volání v odpoledních hodinách"
  },
  {
    id: "CUST-002",
    name: "Marie Svobodová",
    phone: "+420987654321", // Hidden from operators
    email: "marie.s@email.cz",
    status: "active",
    lastContact: "2025-12-10",
    notes: "VIP zákazník"
  },
  {
    id: "CUST-003",
    name: "Petr Dvořák",
    phone: "+420555123456", // Hidden from operators
    email: "petr.dvorak@email.cz",
    status: "inactive",
    lastContact: "2025-11-20",
    notes: ""
  },
  {
    id: "CUST-004",
    name: "Eva Černá",
    phone: "+420666789012", // Hidden from operators
    email: "eva.cerna@email.cz",
    status: "active",
    lastContact: "2025-12-18",
    notes: "Zájem o prémiové služby"
  },
  {
    id: "CUST-005",
    name: "Tomáš Procházka",
    phone: "+420777345678", // Hidden from operators
    email: "tomas.p@email.cz",
    status: "active",
    lastContact: "2025-12-12",
    notes: ""
  },
  {
    id: "CUST-006",
    name: "Lucie Králová",
    phone: "+420888901234", // Hidden from operators
    email: "lucie.kralova@email.cz",
    status: "pending",
    lastContact: "2025-12-01",
    notes: "Čeká na zpětné volání"
  },
  {
    id: "CUST-007",
    name: "Martin Veselý",
    phone: "+420999567890", // Hidden from operators
    email: "martin.v@email.cz",
    status: "active",
    lastContact: "2025-12-19",
    notes: "Dlouhodobý zákazník"
  },
  {
    id: "CUST-008",
    name: "Kateřina Horáková",
    phone: "+420111234567", // Hidden from operators
    email: "katerina.h@email.cz",
    status: "active",
    lastContact: "2025-12-17",
    notes: ""
  }
];

// Call history log
const callHistory = [];

/**
 * Get all customers (without phone numbers - for operator view)
 */
function getCustomersForOperator() {
  return customers.map(({ phone, ...customer }) => customer);
}

/**
 * Get single customer by ID (without phone number)
 */
function getCustomerById(id) {
  const customer = customers.find(c => c.id === id);
  if (!customer) return null;
  const { phone, ...safeCustomer } = customer;
  return safeCustomer;
}

/**
 * Get customer phone number (internal use only - for Twilio)
 * This should NEVER be exposed to the frontend
 */
function getCustomerPhone(id) {
  const customer = customers.find(c => c.id === id);
  return customer ? customer.phone : null;
}

/**
 * Add call to history
 */
function addCallToHistory(callRecord) {
  callHistory.push({
    ...callRecord,
    timestamp: new Date().toISOString()
  });
  return callRecord;
}

/**
 * Get call history for a customer
 */
function getCallHistory(customerId) {
  return callHistory.filter(call => call.customerId === customerId);
}

/**
 * Update customer's last contact date
 */
function updateLastContact(id) {
  const customer = customers.find(c => c.id === id);
  if (customer) {
    customer.lastContact = new Date().toISOString().split('T')[0];
  }
}

module.exports = {
  getCustomersForOperator,
  getCustomerById,
  getCustomerPhone,
  addCallToHistory,
  getCallHistory,
  updateLastContact
};
