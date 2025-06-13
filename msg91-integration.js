// MSG91 WhatsApp Business API Integration
// Production-ready integration with real WhatsApp messaging

const crypto = require('crypto');

class MSG91Integration {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.whatsappToken = process.env.MSG91_WHATSAPP_TOKEN;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.webhookSecret = process.env.MSG91_WEBHOOK_SECRET;
    this.baseUrl = process.env.MSG91_BASE_URL || 'https://api.msg91.com/api';
    
    // Message template IDs (to be configured in MSG91 dashboard)
    this.templates = {
      greeting: 'welcome_template_id',
      support: 'support_template_id',
      escalation: 'escalation_template_id'
    };
  }

  // Validate webhook signature from MSG91
  validateWebhookSignature(payload, signature, timestamp) {
    if (!this.webhookSecret) {
      console.warn('⚠️ Webhook secret not configured - signature validation disabled');
      return true; // Allow in demo mode
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(timestamp + payload)
        .digest('hex');

      const receivedSignature = signature.replace('sha256=', '');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

      if (!isValid) {
        console.error('❌ Invalid webhook signature');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Webhook signature validation error:', error);
      return false;
    }
  }

  // Send WhatsApp message via MSG91
  async sendMessage(phoneNumber, message, messageType = 'text', options = {}) {
    if (!this.authKey || this.authKey === 'placeholder-auth-key') {
      return this.simulateMessageSending(phoneNumber, message);
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      // Clean phone number (remove + and spaces)
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      
      const payload = {
        authkey: this.authKey,
        mobiles: cleanPhone,
        message: message,
        route: 4, // Promotional route
        country: options.country || '91', // Default to India, adjust as needed
        ...options
      };

      // For WhatsApp Business API (different endpoint)
      const whatsappPayload = {
        authkey: this.authKey,
        to: cleanPhone,
        message: message,
        media_type: messageType,
        media_url: options.mediaUrl || null,
        filename: options.filename || null
      };

      const response = await fetch(`${this.baseUrl}/v5/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.authKey
        },
        body: JSON.stringify(whatsappPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`MSG91 API Error: ${result.message || response.statusText}`);
      }

      console.log(`📤 WhatsApp message sent to ${cleanPhone}: "${message}"`);
      
      return {
        success: true,
        messageId: result.request_id || result.message_id,
        status: 'sent',
        provider: 'msg91',
        timestamp: new Date().toISOString(),
        recipient: cleanPhone,
        messageType: messageType
      };

    } catch (error) {
      console.error('❌ MSG91 message delivery failed:', error);
      
      return {
        success: false,
        error: error.message,
        provider: 'msg91',
        timestamp: new Date().toISOString(),
        recipient: phoneNumber
      };
    }
  }

  // Send message using pre-approved template
  async sendTemplateMessage(phoneNumber, templateName, parameters = []) {
    const templateId = this.templates[templateName];
    
    if (!templateId) {
      throw new Error(`Template '${templateName}' not found`);
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      
      const payload = {
        authkey: this.authKey,
        to: cleanPhone,
        template_id: templateId,
        params: parameters
      };

      const response = await fetch(`${this.baseUrl}/v5/whatsapp/template/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.authKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`MSG91 Template Error: ${result.message}`);
      }

      console.log(`📤 Template message sent to ${cleanPhone}: ${templateName}`);
      
      return {
        success: true,
        messageId: result.request_id,
        status: 'sent',
        template: templateName,
        provider: 'msg91'
      };

    } catch (error) {
      console.error('❌ Template message failed:', error);
      throw error;
    }
  }

  // Send media message (image, document, etc.)
  async sendMediaMessage(phoneNumber, mediaUrl, mediaType, caption = '') {
    return await this.sendMessage(phoneNumber, caption, mediaType, {
      mediaUrl: mediaUrl,
      filename: mediaType === 'document' ? 'document.pdf' : null
    });
  }

  // Send bulk messages
  async sendBulkMessages(recipients) {
    const results = [];
    
    // Send messages with delay to respect rate limits
    for (const recipient of recipients) {
      try {
        const result = await this.sendMessage(
          recipient.phone,
          recipient.message,
          recipient.messageType || 'text',
          recipient.options || {}
        );
        
        results.push({
          phone: recipient.phone,
          ...result
        });
        
        // Add delay between messages (rate limiting)
        await this.delay(1000); // 1 second delay
        
      } catch (error) {
        results.push({
          phone: recipient.phone,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get message delivery status
  async getMessageStatus(messageId) {
    if (!this.authKey || this.authKey === 'placeholder-auth-key') {
      return { status: 'demo', message: 'Demo mode - no real status available' };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(`${this.baseUrl}/v5/whatsapp/report/${messageId}`, {
        method: 'GET',
        headers: {
          'authkey': this.authKey
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Status check failed: ${result.message}`);
      }

      return {
        messageId: messageId,
        status: result.status,
        deliveredAt: result.delivered_at,
        readAt: result.read_at,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Status check failed:', error);
      return {
        messageId: messageId,
        status: 'unknown',
        error: error.message
      };
    }
  }

  // Check account balance and limits
  async getAccountInfo() {
    if (!this.authKey || this.authKey === 'placeholder-auth-key') {
      return {
        balance: 'N/A (Demo Mode)',
        status: 'demo',
        limits: { daily: 'unlimited', monthly: 'unlimited' }
      };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(`${this.baseUrl}/v5/balance`, {
        method: 'GET',
        headers: {
          'authkey': this.authKey
        }
      });

      const result = await response.json();

      return {
        balance: result.balance,
        currency: result.currency || 'INR',
        lastUpdated: new Date().toISOString(),
        status: 'active'
      };

    } catch (error) {
      console.error('❌ Account info check failed:', error);
      return {
        balance: 'unknown',
        status: 'error',
        error: error.message
      };
    }
  }

  // Process incoming webhook from MSG91
  processIncomingWebhook(webhookData) {
    try {
      // MSG91 webhook structure
      const messageData = {
        messageId: webhookData.messageId || webhookData.request_id,
        from: webhookData.from || webhookData.mobile,
        to: webhookData.to || this.senderId,
        message: webhookData.text || webhookData.message,
        messageType: webhookData.type || 'text',
        timestamp: webhookData.timestamp || new Date().toISOString(),
        status: webhookData.status || 'received'
      };

      // Handle different message types
      if (webhookData.type === 'image') {
        messageData.mediaUrl = webhookData.media_url;
        messageData.caption = webhookData.caption;
      } else if (webhookData.type === 'document') {
        messageData.mediaUrl = webhookData.media_url;
        messageData.filename = webhookData.filename;
      } else if (webhookData.type === 'location') {
        messageData.latitude = webhookData.latitude;
        messageData.longitude = webhookData.longitude;
      }

      return messageData;
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      throw new Error('Invalid webhook data format');
    }
  }

  // Simulate message sending for demo mode
  simulateMessageSending(phoneNumber, message) {
    console.log(`📤 [DEMO] Would send WhatsApp message to ${phoneNumber}: "${message}"`);
    
    return {
      success: true,
      messageId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'demo_sent',
      provider: 'msg91_demo',
      timestamp: new Date().toISOString(),
      recipient: phoneNumber,
      note: 'Demo mode - add MSG91_AUTH_KEY for real delivery'
    };
  }

  // Helper method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // Basic validation (adjust regex based on your target countries)
    const phoneRegex = /^\d{10,15}$/;
    
    return {
      isValid: phoneRegex.test(cleanPhone),
      cleanNumber: cleanPhone,
      originalNumber: phoneNumber
    };
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      authKey: !!this.authKey && this.authKey !== 'placeholder-auth-key',
      whatsappToken: !!this.whatsappToken && this.whatsappToken !== 'placeholder-whatsapp-token',
      senderId: !!this.senderId && this.senderId !== 'placeholder-sender-id',
      webhookSecret: !!this.webhookSecret && this.webhookSecret !== 'placeholder-webhook-secret',
      baseUrl: this.baseUrl,
      isDemo: !this.authKey || this.authKey === 'placeholder-auth-key'
    };
  }
}

module.exports = MSG91Integration;