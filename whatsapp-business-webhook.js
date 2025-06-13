// WhatsApp Business API Webhook Handler
// Direct integration with Meta's WhatsApp Business API for testing

const crypto = require('crypto');

class WhatsAppBusinessWebhook {
  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
    this.appSecret = process.env.WHATSAPP_APP_SECRET;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    // Meta's WhatsApp Business API endpoint
    this.apiUrl = 'https://graph.facebook.com/v18.0';
  }

  // Webhook verification (required by Meta)
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('✅ Webhook verified successfully');
      return challenge;
    } else {
      console.log('❌ Webhook verification failed');
      return null;
    }
  }

  // Validate webhook signature from Meta
  validateSignature(payload, signature) {
    if (!this.appSecret) {
      console.warn('⚠️ No app secret configured - signature validation disabled');
      return true; // Allow in testing mode
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(payload)
        .digest('hex');

      const receivedSignature = signature.replace('sha256=', '');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

      if (!isValid) {
        console.error('❌ Invalid webhook signature from Meta');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Signature validation error:', error);
      return false;
    }
  }

  // Process incoming webhook from WhatsApp Business API
  processWebhookEvent(webhookBody) {
    try {
      const entry = webhookBody.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value) {
        throw new Error('Invalid webhook structure');
      }

      // Handle different webhook types
      if (value.messages) {
        return this.processIncomingMessage(value);
      } else if (value.statuses) {
        return this.processMessageStatus(value);
      } else {
        console.log('📥 Unhandled webhook type:', JSON.stringify(value, null, 2));
        return null;
      }
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      throw error;
    }
  }

  // Process incoming messages
  processIncomingMessage(value) {
    const message = value.messages[0];
    const contact = value.contacts[0];
    const metadata = value.metadata;

    const messageData = {
      messageId: message.id,
      from: message.from,
      to: metadata.phone_number_id,
      timestamp: parseInt(message.timestamp) * 1000, // Convert to milliseconds
      type: message.type,
      contact: {
        name: contact.profile?.name || 'Unknown',
        waId: contact.wa_id
      }
    };

    // Extract message content based on type
    switch (message.type) {
      case 'text':
        messageData.text = message.text.body;
        break;
      case 'image':
        messageData.image = {
          id: message.image.id,
          mime_type: message.image.mime_type,
          sha256: message.image.sha256,
          caption: message.image.caption
        };
        break;
      case 'document':
        messageData.document = {
          id: message.document.id,
          filename: message.document.filename,
          mime_type: message.document.mime_type,
          sha256: message.document.sha256,
          caption: message.document.caption
        };
        break;
      case 'audio':
        messageData.audio = {
          id: message.audio.id,
          mime_type: message.audio.mime_type,
          sha256: message.audio.sha256,
          voice: message.audio.voice || false
        };
        break;
      case 'location':
        messageData.location = {
          latitude: message.location.latitude,
          longitude: message.location.longitude,
          name: message.location.name,
          address: message.location.address
        };
        break;
      case 'interactive':
        if (message.interactive.type === 'button_reply') {
          messageData.buttonReply = {
            id: message.interactive.button_reply.id,
            title: message.interactive.button_reply.title
          };
        } else if (message.interactive.type === 'list_reply') {
          messageData.listReply = {
            id: message.interactive.list_reply.id,
            title: message.interactive.list_reply.title,
            description: message.interactive.list_reply.description
          };
        }
        break;
      default:
        console.log(`📱 Unhandled message type: ${message.type}`);
    }

    return messageData;
  }

  // Process message status updates (delivered, read, etc.)
  processMessageStatus(value) {
    const status = value.statuses[0];
    
    return {
      messageId: status.id,
      status: status.status,
      timestamp: parseInt(status.timestamp) * 1000,
      recipientId: status.recipient_id,
      pricing: status.pricing,
      errors: status.errors || []
    };
  }

  // Send WhatsApp message via Business API
  async sendMessage(to, message, messageType = 'text') {
    if (!this.accessToken || !this.phoneNumberId) {
      return this.simulateMessageSending(to, message);
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      let messageData;
      
      switch (messageType) {
        case 'text':
          messageData = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: { body: message }
          };
          break;
        case 'template':
          messageData = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: message // message should be template object
          };
          break;
        default:
          throw new Error(`Unsupported message type: ${messageType}`);
      }

      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${result.error?.message || response.statusText}`);
      }

      console.log(`📤 WhatsApp message sent to ${to}: "${typeof message === 'string' ? message : 'template message'}"`);
      
      return {
        success: true,
        messageId: result.messages[0].id,
        status: 'sent',
        provider: 'whatsapp_business_api',
        timestamp: new Date().toISOString(),
        recipient: to
      };

    } catch (error) {
      console.error('❌ WhatsApp Business API error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'whatsapp_business_api',
        timestamp: new Date().toISOString(),
        recipient: to
      };
    }
  }

  // Send interactive message with buttons
  async sendInteractiveMessage(to, text, buttons) {
    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: text },
        action: {
          buttons: buttons.map((button, index) => ({
            type: 'reply',
            reply: {
              id: button.id || `btn_${index}`,
              title: button.title
            }
          }))
        }
      }
    };

    return await this.sendMessage(to, messageData, 'interactive');
  }

  // Send template message
  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    const templateData = {
      name: templateName,
      language: { code: languageCode },
      components: components
    };

    return await this.sendMessage(to, templateData, 'template');
  }

  // Download media from WhatsApp
  async downloadMedia(mediaId) {
    if (!this.accessToken) {
      throw new Error('Access token not configured');
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      // First, get media URL
      const mediaResponse = await fetch(`${this.apiUrl}/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const mediaData = await mediaResponse.json();
      
      if (!mediaResponse.ok) {
        throw new Error(`Media fetch error: ${mediaData.error?.message}`);
      }

      // Download the actual media file
      const fileResponse = await fetch(mediaData.url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to download media file');
      }

      return {
        buffer: await fileResponse.buffer(),
        mimeType: mediaData.mime_type,
        sha256: mediaData.sha256,
        fileSize: mediaData.file_size
      };

    } catch (error) {
      console.error('❌ Media download error:', error);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    if (!this.accessToken || !this.phoneNumberId) {
      console.log(`📖 [DEMO] Would mark message ${messageId} as read`);
      return { success: true, demo: true };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Mark as read error: ${result.error?.message}`);
      }

      return { success: true, messageId };

    } catch (error) {
      console.error('❌ Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // Simulate message sending for testing
  simulateMessageSending(to, message) {
    console.log(`📤 [DEMO] Would send WhatsApp message to ${to}: "${message}"`);
    
    return {
      success: true,
      messageId: `wamid.demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'demo_sent',
      provider: 'whatsapp_business_api_demo',
      timestamp: new Date().toISOString(),
      recipient: to,
      note: 'Demo mode - add WHATSAPP_ACCESS_TOKEN for real delivery'
    };
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      verifyToken: !!this.verifyToken && this.verifyToken !== 'your-verify-token',
      accessToken: !!this.accessToken,
      phoneNumberId: !!this.phoneNumberId,
      businessAccountId: !!this.businessAccountId,
      appSecret: !!this.appSecret,
      isDemo: !this.accessToken || !this.phoneNumberId,
      webhookUrl: '/webhook/whatsapp-business'
    };
  }

  // Validate phone number format for WhatsApp
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // WhatsApp requires country code (no + sign)
    const isValid = /^\d{10,15}$/.test(cleanNumber);
    
    return {
      isValid,
      cleanNumber,
      formattedNumber: cleanNumber,
      originalNumber: phoneNumber
    };
  }

  // Create a comprehensive webhook test payload
  createTestWebhookPayload(phoneNumber, message, messageType = 'text') {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const basePayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: this.businessAccountId || 'test_business_account_id',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550123456',
              phone_number_id: this.phoneNumberId || 'test_phone_number_id'
            },
            contacts: [{
              profile: {
                name: 'Test User'
              },
              wa_id: phoneNumber
            }],
            messages: [{
              from: phoneNumber,
              id: `wamid.test_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: timestamp.toString(),
              type: messageType
            }]
          },
          field: 'messages'
        }]
      }]
    };

    // Add message content based on type
    const messageObj = basePayload.entry[0].changes[0].value.messages[0];
    
    switch (messageType) {
      case 'text':
        messageObj.text = { body: message };
        break;
      case 'image':
        messageObj.image = {
          caption: message,
          mime_type: 'image/jpeg',
          sha256: 'test_sha256',
          id: 'test_image_id'
        };
        break;
      case 'document':
        messageObj.document = {
          caption: message,
          filename: 'test_document.pdf',
          mime_type: 'application/pdf',
          sha256: 'test_sha256',
          id: 'test_document_id'
        };
        break;
    }

    return basePayload;
  }
}

module.exports = WhatsAppBusinessWebhook;