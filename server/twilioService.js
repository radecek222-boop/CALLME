/**
 * Twilio VoIP Service
 * Handles all phone call operations through Twilio API
 *
 * Setup required:
 * 1. Create Twilio account at https://www.twilio.com
 * 2. Get Account SID and Auth Token from Console
 * 3. Buy a phone number for outbound calls
 * 4. Set environment variables in .env file
 */

const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      try {
        this.client = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('Twilio service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Twilio:', error.message);
        this.isConfigured = false;
      }
    } else {
      console.log('Twilio credentials not configured - running in demo mode');
      this.isConfigured = false;
    }
  }

  /**
   * Initiate an outbound call to customer
   * The operator connects through their browser/softphone
   *
   * @param {string} customerPhone - Customer's phone number (hidden from operator)
   * @param {string} operatorId - Operator's identifier
   * @param {string} customerId - Customer ID for logging
   * @returns {Promise<object>} Call details
   */
  async initiateCall(customerPhone, operatorId, customerId) {
    if (!this.isConfigured) {
      // Demo mode - simulate call
      return this.simulateCall(customerId, operatorId);
    }

    try {
      const call = await this.client.calls.create({
        url: process.env.TWILIO_TWIML_URL || 'http://demo.twilio.com/docs/voice.xml',
        to: customerPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        // Record call for quality assurance (optional)
        record: process.env.TWILIO_RECORD_CALLS === 'true',
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        customerId: customerId,
        operatorId: operatorId,
        startTime: new Date().toISOString(),
        message: 'Call initiated successfully'
      };
    } catch (error) {
      console.error('Twilio call error:', error.message);
      return {
        success: false,
        error: error.message,
        customerId: customerId,
        operatorId: operatorId
      };
    }
  }

  /**
   * Get call status
   */
  async getCallStatus(callSid) {
    if (!this.isConfigured) {
      return { status: 'demo-mode', message: 'Twilio not configured' };
    }

    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * End an active call
   */
  async endCall(callSid) {
    if (!this.isConfigured) {
      return { success: true, message: 'Demo call ended' };
    }

    try {
      await this.client.calls(callSid).update({ status: 'completed' });
      return { success: true, message: 'Call ended successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate TwiML for call handling
   * Used when Twilio requests instructions for the call
   */
  generateTwiML(message) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    response.say({
      voice: 'alice',
      language: 'cs-CZ'
    }, message || 'Dobrý den, spojuji vás s operátorem.');

    // Connect to operator (conference or dial)
    response.dial().conference('operator-room');

    return response.toString();
  }

  /**
   * Simulate call for demo mode
   */
  simulateCall(customerId, operatorId) {
    const demoCallSid = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      callSid: demoCallSid,
      status: 'demo-initiated',
      customerId: customerId,
      operatorId: operatorId,
      startTime: new Date().toISOString(),
      message: 'Demo call initiated (Twilio not configured)',
      demoMode: true
    };
  }

  /**
   * Check if Twilio is properly configured
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      phoneNumber: this.isConfigured ? process.env.TWILIO_PHONE_NUMBER : null,
      message: this.isConfigured
        ? 'Twilio is configured and ready'
        : 'Twilio not configured - running in demo mode'
    };
  }
}

module.exports = new TwilioService();
