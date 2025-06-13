// WhatsApp Support Automation - Production Server
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for demo (replace with database in production)
const conversations = new Map();
const users = new Map();

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🤖 WhatsApp Support Automation API',
    status: 'running',
    version: '2.0.0',
    features: ['AI Integration', 'WhatsApp Business API', 'Conversation Management'],
    endpoints: {
      health: 'GET /health',
      testLLM: 'POST /test-llm',
      whatsappWebhook: 'POST /webhook/whatsapp',
      sendMessage: 'POST /send-message',
      conversations: 'GET /admin/conversations'
    },
    docs: 'https://github.com/webworn/whatsapp-support-automation'
  });
});

// Test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'WhatsApp Support Automation - Core Test'
  });
});

// OpenRouter test endpoint
app.post('/test-llm', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    return res.status(400).json({
      error: 'OpenRouter API key not configured',
      message: 'Please add your OpenRouter API key to .env file'
    });
  }

  try {
    // Test OpenRouter API call
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'WhatsApp Support Bot Test'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful WhatsApp customer support assistant.'
          },
          {
            role: 'user',
            content: req.body.message || 'Hello, can you help me?'
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenRouter API error');
    }

    res.json({
      success: true,
      response: data.choices[0]?.message?.content || 'No response',
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for conversation management
function getOrCreateUser(phoneNumber) {
  if (!users.has(phoneNumber)) {
    users.set(phoneNumber, {
      phone: phoneNumber,
      name: null,
      language: 'en',
      createdAt: new Date(),
      lastActivity: new Date()
    });
  }
  return users.get(phoneNumber);
}

function getOrCreateConversation(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, {
      phone: phoneNumber,
      messages: [],
      status: 'active',
      currentFlow: null,
      context: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return conversations.get(phoneNumber);
}

async function processIncomingMessage(phoneNumber, message) {
  const user = getOrCreateUser(phoneNumber);
  const conversation = getOrCreateConversation(phoneNumber);
  
  // Add incoming message to conversation
  conversation.messages.push({
    direction: 'inbound',
    content: message,
    timestamp: new Date(),
    processed: false
  });
  
  // Update activity
  user.lastActivity = new Date();
  conversation.updatedAt = new Date();
  
  // Process with AI
  try {
    const aiResponse = await generateAIResponse(message, conversation);
    
    // Add AI response to conversation
    conversation.messages.push({
      direction: 'outbound',
      content: aiResponse.response,
      timestamp: new Date(),
      aiModel: aiResponse.model_used,
      cost: aiResponse.cost
    });
    
    return aiResponse.response;
  } catch (error) {
    console.error('AI processing error:', error);
    return "I'm sorry, I'm experiencing technical difficulties. Please try again later.";
  }
}

async function generateAIResponse(message, conversation) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Build conversation context
    const recentMessages = conversation.messages.slice(-6); // Last 6 messages
    const messages = [
      {
        role: 'system',
        content: `You are a helpful WhatsApp customer support assistant. 

Guidelines:
- Be friendly, professional, and concise
- Keep responses under 160 characters when possible (WhatsApp-friendly)
- Use emojis sparingly and appropriately
- If you cannot help, offer to escalate to a human agent
- Always aim to resolve customer issues quickly

Customer: ${conversation.phone}
Messages: ${conversation.messages.length}`
      }
    ];
    
    // Add recent conversation history
    recentMessages.forEach(msg => {
      if (msg.direction === 'inbound') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.direction === 'outbound') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    });
    
    // Add current message
    messages.push({ role: 'user', content: message });
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://whatsapp-support-automation-production.up.railway.app',
        'X-Title': 'WhatsApp Support Bot'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenRouter API error');
    }

    const responseContent = data.choices[0]?.message?.content || 'No response';
    const tokensUsed = data.usage?.total_tokens || 0;
    
    return {
      response: responseContent.trim(),
      model_used: 'anthropic/claude-3-haiku',
      cost: (tokensUsed / 1000) * 0.0025,
      tokens_used: tokensUsed
    };

  } catch (error) {
    throw error;
  }
}

// WhatsApp Webhook endpoint
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Extract message data (supports multiple formats)
    const messageData = req.body;
    const phoneNumber = messageData.from || messageData.phone || messageData.phoneNumber;
    const messageText = messageData.text || messageData.message || messageData.body;
    
    if (!phoneNumber || !messageText) {
      return res.status(400).json({
        error: 'Missing required fields: phone number and message'
      });
    }
    
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    
    console.log(`📱 Processing message from ${cleanPhone}: "${messageText}"`);
    
    // Process the message with AI
    const aiResponse = await processIncomingMessage(cleanPhone, messageText);
    
    console.log(`🤖 AI Response: "${aiResponse}"`);
    
    // Send response back via WhatsApp
    const deliveryResult = await sendWhatsAppMessage(cleanPhone, aiResponse);
    
    res.json({
      success: true,
      message: 'Message processed successfully',
      response: aiResponse,
      delivery: deliveryResult
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send WhatsApp message endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({
        error: 'Phone number and message are required'
      });
    }
    
    const result = await sendWhatsAppMessage(phone, message);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

async function sendWhatsAppMessage(phoneNumber, message) {
  const authKey = process.env.MSG91_AUTH_KEY;
  
  if (!authKey || authKey === 'placeholder-auth-key') {
    // Demo mode - just log the message
    console.log(`📤 [DEMO] Would send to ${phoneNumber}: "${message}"`);
    return {
      success: true,
      messageId: `demo_${Date.now()}`,
      status: 'demo_sent',
      note: 'Demo mode - add MSG91_AUTH_KEY for real delivery'
    };
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const payload = {
      recipient: [{
        phone: phoneNumber,
        message: message
      }]
    };
    
    const response = await fetch('https://api.msg91.com/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'MSG91 API error');
    }
    
    console.log(`📤 Message sent to ${phoneNumber}: "${message}"`);
    
    return {
      success: true,
      messageId: result.messageId,
      status: 'sent'
    };
    
  } catch (error) {
    console.error('❌ MSG91 delivery error:', error);
    throw error;
  }
}

// Admin endpoint to view conversations
app.get('/admin/conversations', (req, res) => {
  const conversationsList = Array.from(conversations.entries()).map(([phone, conv]) => ({
    phone,
    messageCount: conv.messages.length,
    status: conv.status,
    lastMessage: conv.messages[conv.messages.length - 1]?.content || 'No messages',
    lastActivity: conv.updatedAt,
    createdAt: conv.createdAt
  }));
  
  res.json({
    totalConversations: conversationsList.length,
    conversations: conversationsList.sort((a, b) => b.lastActivity - a.lastActivity)
  });
});

// Admin endpoint to view specific conversation
app.get('/admin/conversations/:phone', (req, res) => {
  const phone = req.params.phone;
  const conversation = conversations.get(phone);
  const user = users.get(phone);
  
  if (!conversation) {
    return res.status(404).json({
      error: 'Conversation not found'
    });
  }
  
  res.json({
    user,
    conversation,
    messageCount: conversation.messages.length,
    totalCost: conversation.messages
      .filter(m => m.cost)
      .reduce((sum, m) => sum + m.cost, 0)
  });
});

// Test WhatsApp flow endpoint
app.post('/test-whatsapp', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({
        error: 'Phone number and message are required'
      });
    }
    
    // Simulate incoming WhatsApp message
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const aiResponse = await processIncomingMessage(cleanPhone, message);
    
    res.json({
      success: true,
      phone: cleanPhone,
      incomingMessage: message,
      aiResponse: aiResponse,
      note: 'This simulates a complete WhatsApp conversation flow'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 WhatsApp Support Automation running on http://localhost:${port}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /test-llm - Test AI integration`);
  console.log(`   POST /webhook/whatsapp - WhatsApp webhook`);
  console.log(`   POST /send-message - Send WhatsApp message`);
  console.log(`   POST /test-whatsapp - Test conversation flow`);
  console.log(`   GET  /admin/conversations - View conversations`);
  console.log(`📋 Environment check:`);
  console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   MSG91_AUTH_KEY: ${process.env.MSG91_AUTH_KEY ? '✅ Set' : '❌ Missing (demo mode)'}`);
});