/**
 * CALLME - Operator Call Center Application
 * Main server entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = require('./database');
const twilioService = require('./twilioService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Simple operator session tracking (in production use proper auth)
const operatorSessions = new Map();

// ============================================
// API ROUTES
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    twilio: twilioService.getStatus()
  });
});

/**
 * Get Twilio configuration status
 */
app.get('/api/twilio/status', (req, res) => {
  res.json(twilioService.getStatus());
});

/**
 * Get all customers (without phone numbers)
 * Operators see only ID, name, status, etc.
 */
app.get('/api/customers', (req, res) => {
  const customers = db.getCustomersForOperator();
  res.json(customers);
});

/**
 * Get single customer details (without phone number)
 */
app.get('/api/customers/:id', (req, res) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

/**
 * Initiate call to customer
 * Phone number is retrieved server-side and NEVER sent to client
 */
app.post('/api/call/initiate', async (req, res) => {
  const { customerId, operatorId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  // Get customer data (including hidden phone number)
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // Get phone number server-side (never expose to client)
  const customerPhone = db.getCustomerPhone(customerId);
  if (!customerPhone) {
    return res.status(400).json({ error: 'Customer phone not available' });
  }

  // Generate operator ID if not provided
  const opId = operatorId || `OP-${uuidv4().substring(0, 8)}`;

  // Initiate call through Twilio
  const callResult = await twilioService.initiateCall(customerPhone, opId, customerId);

  // Log call to history
  const callRecord = db.addCallToHistory({
    callSid: callResult.callSid,
    customerId: customerId,
    customerName: customer.name,
    operatorId: opId,
    status: callResult.status,
    startTime: callResult.startTime
  });

  // Update customer's last contact
  db.updateLastContact(customerId);

  // Return call info (WITHOUT phone number)
  res.json({
    success: callResult.success,
    callSid: callResult.callSid,
    status: callResult.status,
    customerId: customerId,
    customerName: customer.name,
    operatorId: opId,
    message: callResult.message,
    demoMode: callResult.demoMode || false
  });
});

/**
 * Get call status
 */
app.get('/api/call/status/:callSid', async (req, res) => {
  const status = await twilioService.getCallStatus(req.params.callSid);
  res.json(status);
});

/**
 * End active call
 */
app.post('/api/call/end', async (req, res) => {
  const { callSid } = req.body;

  if (!callSid) {
    return res.status(400).json({ error: 'Call SID is required' });
  }

  const result = await twilioService.endCall(callSid);
  res.json(result);
});

/**
 * Get call history for a customer
 */
app.get('/api/customers/:id/calls', (req, res) => {
  const history = db.getCallHistory(req.params.id);
  res.json(history);
});

/**
 * Twilio webhook for call status updates
 */
app.post('/api/twilio/webhook/status', (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;

  console.log(`Call ${CallSid} status update: ${CallStatus}`);

  // Update call record in database
  // In production, update the call history record

  res.status(200).send('OK');
});

/**
 * Twilio webhook for TwiML instructions
 */
app.post('/api/twilio/webhook/voice', (req, res) => {
  const twiml = twilioService.generateTwiML('Dobrý den, spojuji vás s naším operátorem.');
  res.type('text/xml');
  res.send(twiml);
});

// ============================================
// Serve frontend
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// Start server
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   CALLME - Operator Call Center Application           ║
║                                                       ║
║   Server running on: http://localhost:${PORT}            ║
║                                                       ║
║   Twilio Status: ${twilioService.getStatus().configured ? 'Configured' : 'Demo Mode'}                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
