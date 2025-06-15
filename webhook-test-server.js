#!/usr/bin/env node

const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'WhatsApp Webhook Test Server'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Business Webhook Test Server',
    endpoints: {
      health: 'GET /health',
      webhook_verify: 'GET /webhooks/whatsapp-business',
      webhook_receive: 'POST /webhooks/whatsapp-business',
      test_webhook: 'POST /webhooks/test-whatsapp-business',
      simulate_webhook: 'POST /webhooks/simulate-whatsapp-business'
    },
    status: 'ready'
  });
});

// WhatsApp Business webhook verification (GET)
app.get('/webhooks/whatsapp-business', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📞 Webhook verification request:', { mode, hasToken: !!token, hasChallenge: !!challenge });

  if (mode === 'subscribe' && token) {
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'test_verify_token_123';
    
    if (token === expectedToken) {
      console.log('✅ Webhook verification successful');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Invalid verification token');
      res.status(403).send('Forbidden');
    }
  } else {
    console.log('❌ Invalid verification request');
    res.status(400).send('Bad Request');
  }
});

// WhatsApp Business webhook receiver (POST)
app.post('/webhooks/whatsapp-business', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = req.body;

  console.log('📨 Received WhatsApp Business webhook:', {
    hasSignature: !!signature,
    payloadSize: JSON.stringify(payload).length,
    entries: payload.entry?.length || 0
  });

  try {
    // Validate signature if provided
    if (signature && process.env.WHATSAPP_APP_SECRET) {
      const isValid = validateWhatsAppSignature(payload, signature);
      if (!isValid) {
        console.log('❌ Invalid webhook signature');
        return res.status(401).send('Unauthorized');
      }
    }

    // Process webhook
    await processWhatsAppWebhook(payload);

    console.log('✅ Webhook processed successfully');
    res.status(200).json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test WhatsApp message sending
app.post('/webhooks/test-send-message', async (req, res) => {
  const { to, message } = req.body;
  
  if (!to || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: to, message' 
    });
  }

  try {
    console.log('🧪 Testing WhatsApp message sending:', { to, message });
    const result = await sendWhatsAppMessage(to, message);
    
    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      result: result
    });
  } catch (error) {
    console.error('❌ Failed to send test message:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test webhook endpoint
app.post('/webhooks/test-whatsapp-business', (req, res) => {
  const { phoneNumber, message, messageType } = req.body;

  console.log('🧪 Test webhook request:', { phoneNumber, message, messageType });

  // Create sample WhatsApp Business webhook payload
  const testPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_business_account_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+1234567890',
            phone_number_id: 'test_phone_number_id'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: phoneNumber || '1234567890'
          }],
          messages: [{
            id: `test_msg_${Date.now()}`,
            from: phoneNumber || '1234567890',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: messageType || 'text',
            text: {
              body: message || 'Hello! This is a test message for WhatsApp Business webhook.'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    processWhatsAppWebhook(testPayload);
    
    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      testPayload,
      aiResponse: simulateAIResponse(message || 'Hello!')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate different webhook scenarios
app.post('/webhooks/simulate-whatsapp-business', (req, res) => {
  const { scenario, phoneNumber, message } = req.body;

  console.log('🎭 Simulating webhook scenario:', scenario);

  let payload;

  switch (scenario) {
    case 'text_message':
      payload = createTextMessagePayload(phoneNumber || '1234567890', message || 'I need help with my order');
      break;
    case 'button_reply':
      payload = createButtonReplyPayload(phoneNumber || '1234567890');
      break;
    case 'image_message':
      payload = createImageMessagePayload(phoneNumber || '1234567890');
      break;
    case 'status_update':
      payload = createStatusUpdatePayload();
      break;
    default:
      return res.status(400).json({ error: 'Invalid scenario' });
  }

  try {
    processWhatsAppWebhook(payload);
    
    res.json({
      success: true,
      message: `${scenario} simulation completed`,
      scenario,
      payload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function validateWhatsAppSignature(payload, signature) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true; // Skip validation if no secret set

  const payloadString = JSON.stringify(payload);
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payloadString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function processWhatsAppWebhook(payload) {
  if (!payload.entry) return;

  for (const entry of payload.entry) {
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          await processMessages(change.value);
        } else if (change.field === 'message_status') {
          processStatuses(change.value);
        }
      }
    }
  }
}

async function processMessages(value) {
  if (!value.messages) return;

  for (const message of value.messages) {
    console.log('📱 Processing message:', {
      id: message.id,
      from: message.from,
      type: message.type,
      content: extractMessageContent(message)
    });

    // Generate AI response using real LLM
    const aiResponse = await generateAIResponse(extractMessageContent(message));
    console.log('🤖 AI Response:', aiResponse);

    // Send response back via WhatsApp API
    try {
      await sendWhatsAppMessage(message.from, aiResponse);
      console.log('✅ Response sent successfully to:', message.from);
    } catch (error) {
      console.error('❌ Failed to send response:', error.message);
    }
  }
}

function processStatuses(value) {
  if (!value.statuses) return;

  value.statuses.forEach(status => {
    console.log('📊 Status update:', {
      messageId: status.id,
      status: status.status,
      recipient: status.recipient_id
    });
  });
}

function extractMessageContent(message) {
  switch (message.type) {
    case 'text':
      return message.text?.body || '';
    case 'interactive':
      return message.interactive?.button_reply?.title || 
             message.interactive?.list_reply?.title || 
             '[Interactive message]';
    case 'image':
      return message.image?.caption || '[Image message]';
    case 'document':
      return message.document?.caption || '[Document message]';
    default:
      return `[${message.type} message]`;
  }
}

async function generateAIResponse(message, context = {}) {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!openrouterApiKey) {
    console.log('⚠️ OPENROUTER_API_KEY not set, using fallback response');
    return simulateFallbackResponse(message);
  }

  try {
    const systemPrompt = buildSystemPrompt(context);
    
    const payload = {
      model: 'anthropic/claude-3-haiku', // Fast and cost-effective for WhatsApp
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300, // Keep responses concise for WhatsApp
      temperature: 0.7
    };

    console.log('🤖 Calling OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://whatsapp-support-automation-production.up.railway.app',
        'X-Title': 'WhatsApp Support Automation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Invalid response format from OpenRouter');
    }

    console.log('✅ OpenRouter API response received');
    return aiResponse.trim();

  } catch (error) {
    console.error('❌ OpenRouter API failed:', error.message);
    return simulateFallbackResponse(message);
  }
}

function buildSystemPrompt(context) {
  return `You are a helpful WhatsApp customer support assistant for an enterprise business.

Guidelines:
- Be concise and friendly
- Keep responses under 300 characters when possible for WhatsApp
- Use simple, clear language
- If you cannot help with something, politely offer to escalate to a human agent
- Use emojis sparingly and appropriately
- Always be professional and helpful
- Respond in the user's preferred language when possible

Current conversation context:
- Platform: WhatsApp Business
- Response format: Text message
- Keep it conversational and helpful

Please provide a helpful response to the user's message.`;
}

function simulateFallbackResponse(message) {
  const responses = [
    `Hi! I'd be happy to help you with "${message}". Let me assist you right away! 😊`,
    `Thanks for reaching out! I understand you mentioned "${message}". How can I help you further?`,
    `Hello! I see you're asking about "${message}". I'm here to help - what specific information do you need?`,
    `Great question about "${message}"! Let me provide you with the best assistance possible. 🔧`,
    `Hi there! I received your message about "${message}". I'm your AI assistant and I'm ready to help! 🚀`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Send message via WhatsApp Business API
async function sendWhatsAppMessage(to, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '665397593326012';
  
  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN not configured');
  }

  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: message
    }
  };

  console.log('📤 Sending WhatsApp message:', { to, message: message.substring(0, 50) + '...' });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('✅ WhatsApp API response:', result);
  return result;
}

// Payload creators for simulation
function createTextMessagePayload(phoneNumber, message) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_business_account_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+1234567890',
            phone_number_id: 'test_phone_number_id'
          },
          contacts: [{ profile: { name: 'Test User' }, wa_id: phoneNumber }],
          messages: [{
            id: `test_msg_${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: { body: message }
          }]
        },
        field: 'messages'
      }]
    }]
  };
}

function createButtonReplyPayload(phoneNumber) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_business_account_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+1234567890',
            phone_number_id: 'test_phone_number_id'
          },
          contacts: [{ profile: { name: 'Test User' }, wa_id: phoneNumber }],
          messages: [{
            id: `test_msg_${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'interactive',
            interactive: {
              type: 'button_reply',
              button_reply: {
                id: 'tech_support',
                title: 'Technical Support'
              }
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };
}

function createImageMessagePayload(phoneNumber) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_business_account_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+1234567890',
            phone_number_id: 'test_phone_number_id'
          },
          contacts: [{ profile: { name: 'Test User' }, wa_id: phoneNumber }],
          messages: [{
            id: `test_msg_${Date.now()}`,
            from: phoneNumber,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'image',
            image: {
              caption: 'Screenshot of the issue I\'m experiencing',
              mime_type: 'image/jpeg',
              sha256: 'test_sha256_hash',
              id: 'test_image_id'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };
}

function createStatusUpdatePayload() {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_business_account_id',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '+1234567890',
            phone_number_id: 'test_phone_number_id'
          },
          statuses: [{
            id: 'test_msg_123',
            status: 'delivered',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            recipient_id: '1234567890'
          }]
        },
        field: 'message_status'
      }]
    }]
  };
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 WhatsApp Webhook Test Server Started!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/webhooks/whatsapp-business (webhook verification)`);
  console.log(`   POST http://localhost:${PORT}/webhooks/whatsapp-business (webhook receiver)`);
  console.log(`   POST http://localhost:${PORT}/webhooks/test-whatsapp-business (testing)`);
  console.log(`   POST http://localhost:${PORT}/webhooks/simulate-whatsapp-business (simulation)`);
  console.log('');
  console.log('🧪 Ready for testing! Use the commands in QUICK-TEST-COMMANDS.md');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});