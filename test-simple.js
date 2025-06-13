// WhatsApp Support Automation - Production Server
const express = require('express');
const { buildSystemPrompt, detectMessageType, getWelcomeMessage } = require('./prompts');
const UserProfiler = require('./user-profiling');
const TokenOptimizer = require('./token-optimizer');
const MSG91Integration = require('./msg91-integration');
const app = express();

// Initialize systems
const userProfiler = new UserProfiler();
const tokenOptimizer = new TokenOptimizer();
const msg91 = new MSG91Integration();

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
    version: '3.0.0',
    company: 'TechCorp Solutions',
    features: [
      'AI Integration with Dynamic Prompts',
      'WhatsApp Business API',
      'Conversation Management',
      'Context-Aware Responses',
      'Message Type Detection',
      'Escalation Handling',
      'Intelligent Token Optimization',
      'Cost-Effective AI Operations'
    ],
    endpoints: {
      health: 'GET /health',
      testLLM: 'POST /test-llm',
      whatsappWebhook: 'POST /webhook/whatsapp',
      sendMessage: 'POST /send-message',
      testWhatsApp: 'POST /test-whatsapp',
      testPrompts: 'POST /test-prompts',
      testPersonalization: 'POST /test-personalization',
      testTokenOptimization: 'POST /test-token-optimization',
      conversations: 'GET /admin/conversations',
      users: 'GET /admin/users',
      tokenAnalytics: 'GET /admin/token-analytics',
      knowledgeBase: 'GET /admin/knowledge-base',
      testMSG91: 'POST /admin/test-msg91-connection',
      webhookLogs: 'GET /admin/webhook-logs'
    },
    aiCapabilities: {
      messageTypes: ['greeting', 'technical', 'billing', 'escalation', 'general'],
      promptSystem: 'Dynamic context-aware prompts',
      conversationMemory: 'Maintains context across messages',
      businessContext: 'TechCorp Solutions knowledge base',
      userPersonalization: 'Individual user profiling and behavior analysis',
      adaptiveResponses: 'Communication style matching and preference learning',
      tokenOptimization: 'Intelligent cost reduction while maintaining quality',
      costEfficiency: '40-70% token savings through smart optimization',
      whatsappIntegration: 'Real WhatsApp Business API with MSG91',
      webhookSecurity: 'HMAC signature validation and rate limiting'
    },
    whatsappStatus: msg91.getConfigurationStatus(),
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

// Enhance system prompt with user personalization
function enhancePromptWithPersonalization(basePrompt, personalizedContext) {
  let enhancedPrompt = basePrompt;
  
  // Add user profile information
  enhancedPrompt += `

USER PROFILE ANALYSIS:
- User Type: ${personalizedContext.userProfile.type}
- Customer Tier: ${personalizedContext.userProfile.tier}
- Communication Style: ${personalizedContext.userProfile.communicationStyle}
- Technical Level: ${personalizedContext.userProfile.technicalLevel}
- Response Preference: ${personalizedContext.userProfile.responsePreference}

CONVERSATION HISTORY:
- Total Previous Conversations: ${personalizedContext.conversationHistory.totalConversations}
- Satisfaction Score: ${personalizedContext.conversationHistory.satisfactionScore}/5
- Escalation Rate: ${(personalizedContext.conversationHistory.escalationRate * 100).toFixed(1)}%`;

  // Add common issues if available
  if (personalizedContext.conversationHistory.commonIssues.length > 0) {
    enhancedPrompt += `
- Common Issues: ${personalizedContext.conversationHistory.commonIssues.join(', ')}`;
  }

  // Add personalized instructions
  if (personalizedContext.personalizedInstructions.length > 0) {
    enhancedPrompt += `

PERSONALIZED APPROACH:
${personalizedContext.personalizedInstructions.map(instruction => `- ${instruction}`).join('\n')}`;
  }

  // Add contextual reminders
  if (personalizedContext.contextualReminders.length > 0) {
    enhancedPrompt += `

IMPORTANT REMINDERS:
${personalizedContext.contextualReminders.map(reminder => `- ${reminder}`).join('\n')}`;
  }

  return enhancedPrompt;
}

async function generateAIResponse(message, conversation) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    // Get all conversations for this user for profiling
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.phone === conversation.phone);
    
    // Generate personalized context based on user history
    const personalizedContext = userProfiler.generatePersonalizedContext(
      conversation.phone, 
      userConversations
    );
    
    // Detect message type for appropriate prompting
    const messageType = detectMessageType(message, conversation);
    
    // Build dynamic system prompt with personalization
    const baseSystemPrompt = buildSystemPrompt(conversation, messageType);
    
    // OPTIMIZE TOKENS WHILE MAINTAINING PERSONALIZATION
    const optimization = tokenOptimizer.optimizeForAI(message, conversation, personalizedContext);
    
    console.log(`🔧 Token optimization: ${optimization.optimization.originalEstimate} → ${optimization.optimization.finalTokens} tokens (${optimization.optimization.savingsPercentage}% saved)`);
    
    // Use optimized data for AI call
    const messages = [
      {
        role: 'system',
        content: optimization.optimizedData.systemPrompt
      }
    ];
    
    // Add optimized conversation context
    if (optimization.optimizedData.conversationContext) {
      // Parse the summarized conversation and add as messages
      const contextLines = optimization.optimizedData.conversationContext.split('\n').filter(line => line.trim());
      contextLines.forEach(line => {
        if (line.includes('User:')) {
          messages.push({ role: 'user', content: line.replace('User:', '').trim() });
        } else if (line.includes('AI:')) {
          messages.push({ role: 'assistant', content: line.replace('AI:', '').trim() });
        }
      });
    }
    
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
      tokens_used: tokensUsed,
      optimization: {
        tokensSaved: optimization.optimization.tokenSavings,
        savingsPercentage: optimization.optimization.savingsPercentage,
        strategies: optimization.optimization.strategies
      }
    };

  } catch (error) {
    throw error;
  }
}

// WhatsApp Webhook endpoint with MSG91 validation
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-msg91-signature'] || req.headers['signature'];
    const timestamp = req.headers['x-msg91-timestamp'] || req.headers['timestamp'] || Date.now().toString();
    
    console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Validate webhook signature (if not in demo mode)
    if (!msg91.validateWebhookSignature(rawBody, signature, timestamp)) {
      return res.status(401).json({
        error: 'Invalid webhook signature'
      });
    }
    
    // Process webhook data using MSG91 integration
    const messageData = msg91.processIncomingWebhook(req.body);
    
    if (!messageData.from || !messageData.message) {
      return res.status(400).json({
        error: 'Missing required fields: phone number and message'
      });
    }
    
    // Clean phone number
    const cleanPhone = messageData.from.replace(/[^\d]/g, '');
    
    console.log(`📱 Processing ${messageData.messageType} message from ${cleanPhone}: "${messageData.message}"`);
    
    // Handle different message types
    if (messageData.messageType !== 'text') {
      // For now, acknowledge non-text messages
      await sendWhatsAppMessage(cleanPhone, "Thank you for your message. Our team will review it and get back to you soon! 📎");
      
      return res.json({
        success: true,
        message: 'Non-text message acknowledged',
        messageType: messageData.messageType
      });
    }
    
    // Process text message with AI
    const aiResponse = await processIncomingMessage(cleanPhone, messageData.message);
    
    console.log(`🤖 AI Response: "${aiResponse}"`);
    
    // Send response back via WhatsApp
    const deliveryResult = await sendWhatsAppMessage(cleanPhone, aiResponse);
    
    res.json({
      success: true,
      message: 'Message processed successfully',
      messageId: messageData.messageId,
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

async function sendWhatsAppMessage(phoneNumber, message, messageType = 'text', options = {}) {
  return await msg91.sendMessage(phoneNumber, message, messageType, options);
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

// Test WhatsApp flow endpoint with detailed analysis
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
    const conversation = getOrCreateConversation(cleanPhone);
    
    // Detect message type for analysis
    const messageType = detectMessageType(message, conversation);
    
    const aiResponse = await processIncomingMessage(cleanPhone, message);
    
    res.json({
      success: true,
      phone: cleanPhone,
      incomingMessage: message,
      detectedType: messageType,
      aiResponse: aiResponse,
      conversationStats: {
        totalMessages: conversation.messages.length,
        conversationAge: Math.round((Date.now() - conversation.createdAt.getTime()) / 1000),
        lastActivity: conversation.updatedAt
      },
      note: 'This simulates a complete WhatsApp conversation flow with prompt analysis'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

// Prompt testing endpoint
app.post('/test-prompts', async (req, res) => {
  try {
    const { message, messageType = 'general', conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    // Create mock conversation for testing
    const mockConversation = {
      phone: 'test-123',
      messages: conversationHistory.map(msg => ({
        direction: msg.direction || 'inbound',
        content: msg.content,
        timestamp: new Date()
      })),
      status: 'active',
      createdAt: new Date(Date.now() - 300000), // 5 minutes ago
      updatedAt: new Date()
    };
    
    // Build system prompt
    const systemPrompt = buildSystemPrompt(mockConversation, messageType);
    const detectedType = detectMessageType(message, mockConversation);
    
    res.json({
      success: true,
      input: {
        message,
        requestedType: messageType,
        conversationHistory: conversationHistory.length
      },
      analysis: {
        detectedMessageType: detectedType,
        systemPrompt: systemPrompt,
        promptLength: systemPrompt.length
      },
      note: 'This shows how the AI prompt system would handle your message'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Prompt test failed',
      message: error.message
    });
  }
});

// Business knowledge endpoint
app.get('/admin/knowledge-base', (req, res) => {
  const { prompts: promptSystem } = require('./prompts');
  
  res.json({
    companyInfo: {
      name: 'TechCorp Solutions',
      services: ['Web development', 'Mobile apps', 'Cloud solutions', 'IT consulting'],
      businessHours: 'Monday-Friday 9AM-6PM EST',
      supportAvailable: '24/7 via WhatsApp'
    },
    promptSystem: {
      totalPrompts: Object.keys(promptSystem).length,
      categories: Object.keys(promptSystem),
      features: [
        'Dynamic prompt selection',
        'Context-aware responses',
        'Message type detection',
        'Escalation handling',
        'Multi-scenario support',
        'User profiling & personalization'
      ]
    },
    messageTypes: [
      'greeting - New customer welcome',
      'technical - Technical support issues',
      'billing - Payment and billing inquiries',
      'escalation - Human agent handoff',
      'general - Standard customer service'
    ]
  });
});

// User profiles endpoint
app.get('/admin/users', (req, res) => {
  const userSummaries = Array.from(conversations.keys()).map(phone => {
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.phone === phone);
    
    return userProfiler.getUserSummary(phone) || {
      phone,
      totalConversations: userConversations.length,
      totalMessages: userConversations.reduce((sum, conv) => sum + conv.messages.length, 0),
      userType: 'unknown'
    };
  }).filter(Boolean);
  
  res.json({
    totalUsers: userSummaries.length,
    users: userSummaries.sort((a, b) => b.totalConversations - a.totalConversations)
  });
});

// Specific user profile endpoint
app.get('/admin/users/:phone', (req, res) => {
  const phone = req.params.phone;
  const userConversations = Array.from(conversations.values())
    .filter(conv => conv.phone === phone);
  
  if (userConversations.length === 0) {
    return res.status(404).json({
      error: 'User not found'
    });
  }
  
  const personalizedContext = userProfiler.generatePersonalizedContext(phone, userConversations);
  const userSummary = userProfiler.getUserSummary(phone);
  
  res.json({
    userSummary,
    personalizedContext,
    conversations: userConversations.map(conv => ({
      messages: conv.messages.length,
      status: conv.status,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: conv.messages[conv.messages.length - 1]?.content
    }))
  });
});

// Test personalization endpoint
app.post('/test-personalization', async (req, res) => {
  try {
    const { phone, message, simulateHistory = false } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({
        error: 'Phone number and message are required'
      });
    }
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // If simulateHistory is true, create some fake conversation history
    if (simulateHistory && !conversations.has(cleanPhone)) {
      const mockConversation = {
        phone: cleanPhone,
        messages: [
          { direction: 'inbound', content: 'Hi, my website is down', timestamp: new Date(Date.now() - 86400000) },
          { direction: 'outbound', content: 'I\'ll help you check that right away', timestamp: new Date(Date.now() - 86400000) },
          { direction: 'inbound', content: 'Thanks, it\'s working now', timestamp: new Date(Date.now() - 86400000) },
          { direction: 'inbound', content: 'Hello, I need a refund', timestamp: new Date(Date.now() - 3600000) },
          { direction: 'outbound', content: 'I can help with that refund request', timestamp: new Date(Date.now() - 3600000) }
        ],
        status: 'active',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000)
      };
      conversations.set(cleanPhone, mockConversation);
    }
    
    // Get current conversation or create new one
    const conversation = getOrCreateConversation(cleanPhone);
    
    // Generate AI response with personalization
    const aiResponse = await processIncomingMessage(cleanPhone, message);
    
    // Get personalization details
    const userConversations = Array.from(conversations.values())
      .filter(conv => conv.phone === cleanPhone);
    const personalizedContext = userProfiler.generatePersonalizedContext(cleanPhone, userConversations);
    
    res.json({
      success: true,
      phone: cleanPhone,
      message,
      aiResponse,
      personalization: personalizedContext,
      conversationCount: userConversations.length,
      note: 'This shows how AI responses are personalized based on user history'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Personalization test failed',
      message: error.message
    });
  }
});

// Token optimization testing endpoint
app.post('/test-token-optimization', async (req, res) => {
  try {
    const { phone, message, includeHistory = true } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({
        error: 'Phone number and message are required'
      });
    }
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Create test conversation with history
    if (includeHistory && !conversations.has(cleanPhone)) {
      const testConversation = {
        phone: cleanPhone,
        messages: [
          { direction: 'inbound', content: 'Hi, I need help with my website hosting', timestamp: new Date(Date.now() - 3600000) },
          { direction: 'outbound', content: 'I\'d be happy to help with your hosting issue. Can you describe the specific problem?', timestamp: new Date(Date.now() - 3600000) },
          { direction: 'inbound', content: 'The site keeps going down during peak hours', timestamp: new Date(Date.now() - 3500000) },
          { direction: 'outbound', content: 'That sounds like a capacity issue. Let me check your hosting plan and usage.', timestamp: new Date(Date.now() - 3500000) },
          { direction: 'inbound', content: 'I\'m on the basic plan but getting lots of traffic lately', timestamp: new Date(Date.now() - 3400000) },
          { direction: 'outbound', content: 'Your traffic has indeed increased. I recommend upgrading to our pro plan for better performance.', timestamp: new Date(Date.now() - 3400000) },
          { direction: 'inbound', content: 'What would that cost and how quickly can we upgrade?', timestamp: new Date(Date.now() - 1800000) },
          { direction: 'outbound', content: 'The pro plan is $49/month and I can upgrade you immediately. Would you like me to proceed?', timestamp: new Date(Date.now() - 1800000) }
        ],
        status: 'active',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 1800000)
      };
      conversations.set(cleanPhone, testConversation);
    }
    
    const conversation = getOrCreateConversation(cleanPhone);
    const userConversations = [conversation];
    const personalizedContext = userProfiler.generatePersonalizedContext(cleanPhone, userConversations);
    
    // Test with and without optimization
    const originalEstimate = tokenOptimizer.estimateTokens(message, conversation, personalizedContext);
    const optimization = tokenOptimizer.optimizeForAI(message, conversation, personalizedContext);
    
    res.json({
      success: true,
      testMessage: message,
      conversationLength: conversation.messages.length,
      tokenAnalysis: {
        withoutOptimization: originalEstimate,
        withOptimization: optimization.optimization.finalTokens,
        tokensSaved: optimization.optimization.tokenSavings,
        savingsPercentage: optimization.optimization.savingsPercentage,
        costSavings: (optimization.optimization.tokenSavings / 1000) * 0.0025
      },
      optimizationStrategies: optimization.optimization.strategies,
      optimizedPrompt: optimization.optimizedData.systemPrompt,
      originalPromptLength: JSON.stringify(personalizedContext).length,
      optimizedPromptLength: optimization.optimizedData.systemPrompt.length
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Token optimization test failed',
      message: error.message
    });
  }
});

// Token optimization analytics endpoint
app.get('/admin/token-analytics', (req, res) => {
  const cacheStats = tokenOptimizer.getCacheStats();
  
  // Calculate average savings from conversations
  const conversationList = Array.from(conversations.values());
  let totalOriginalTokens = 0;
  let totalOptimizedTokens = 0;
  let totalSavings = 0;
  
  conversationList.forEach(conv => {
    if (conv.messages.length > 0) {
      const userConversations = [conv];
      const personalizedContext = userProfiler.generatePersonalizedContext(conv.phone, userConversations);
      const lastMessage = conv.messages[conv.messages.length - 1];
      
      if (lastMessage && lastMessage.direction === 'inbound') {
        const originalEstimate = tokenOptimizer.estimateTokens(lastMessage.content, conv, personalizedContext);
        const optimization = tokenOptimizer.optimizeForAI(lastMessage.content, conv, personalizedContext);
        
        totalOriginalTokens += originalEstimate;
        totalOptimizedTokens += optimization.optimization.finalTokens;
        totalSavings += optimization.optimization.tokenSavings;
      }
    }
  });
  
  const averageSavingsPercentage = totalOriginalTokens > 0 ? 
    Math.round((totalSavings / totalOriginalTokens) * 100) : 0;
    
  const estimatedCostSavings = (totalSavings / 1000) * 0.0025;
  
  res.json({
    tokenOptimization: {
      totalConversations: conversationList.length,
      averageSavingsPercentage,
      totalTokensSaved: totalSavings,
      estimatedCostSavings: `$${estimatedCostSavings.toFixed(4)}`,
      cacheStats,
      optimizationFeatures: [
        'Intelligent conversation summarization',
        'Compressed system prompts',
        'Selective context loading',
        'Prompt caching',
        'Smart token management'
      ]
    },
    recommendations: [
      totalSavings < 100 ? 'Consider more aggressive optimization for higher volume' : 'Token optimization is working effectively',
      cacheStats.conversationSummaries < 5 ? 'Cache is building up - more savings expected' : 'Cache is mature and providing good savings',
      averageSavingsPercentage > 50 ? 'Excellent optimization rate' : 'Good optimization rate'
    ]
  });
});

// MSG91 Integration Management Endpoints

// Test MSG91 connection and configuration
app.post('/admin/test-msg91-connection', async (req, res) => {
  try {
    const configStatus = msg91.getConfigurationStatus();
    
    if (configStatus.isDemo) {
      return res.json({
        success: false,
        message: 'MSG91 is in demo mode',
        configuration: configStatus,
        instructions: 'Add MSG91_AUTH_KEY to environment variables to enable real WhatsApp messaging'
      });
    }
    
    // Test account info
    const accountInfo = await msg91.getAccountInfo();
    
    res.json({
      success: true,
      message: 'MSG91 connection successful',
      configuration: configStatus,
      account: accountInfo,
      capabilities: [
        'Send WhatsApp messages',
        'Receive webhooks',
        'Template messages',
        'Media messages',
        'Delivery tracking'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'MSG91 connection test failed',
      message: error.message,
      configuration: msg91.getConfigurationStatus()
    });
  }
});

// Send message with advanced options
app.post('/admin/send-advanced-message', async (req, res) => {
  try {
    const { phone, message, messageType = 'text', template, parameters, mediaUrl } = req.body;
    
    if (!phone || (!message && !template)) {
      return res.status(400).json({
        error: 'Phone number and (message or template) are required'
      });
    }
    
    let result;
    
    if (template) {
      // Send template message
      result = await msg91.sendTemplateMessage(phone, template, parameters || []);
    } else if (mediaUrl) {
      // Send media message
      result = await msg91.sendMediaMessage(phone, mediaUrl, messageType, message);
    } else {
      // Send regular message
      result = await msg91.sendMessage(phone, message, messageType);
    }
    
    res.json({
      success: true,
      result,
      configuration: msg91.getConfigurationStatus()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Advanced message sending failed',
      message: error.message
    });
  }
});

// Get message delivery status
app.get('/admin/message-status/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const status = await msg91.getMessageStatus(messageId);
    
    res.json({
      success: true,
      messageId,
      status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Send bulk messages
app.post('/admin/send-bulk-messages', async (req, res) => {
  try {
    const { recipients } = req.body;
    
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        error: 'Recipients array is required'
      });
    }
    
    if (recipients.length > 100) {
      return res.status(400).json({
        error: 'Maximum 100 recipients per bulk send'
      });
    }
    
    const results = await msg91.sendBulkMessages(recipients);
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
    
    res.json({
      success: true,
      summary,
      results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Bulk message sending failed',
      message: error.message
    });
  }
});

// MSG91 webhook logs and analytics
app.get('/admin/webhook-logs', (req, res) => {
  // This would connect to your logging system in production
  res.json({
    webhookEndpoint: `${req.protocol}://${req.get('host')}/webhook/whatsapp`,
    configuration: msg91.getConfigurationStatus(),
    recentWebhooks: 'Connect to logging system for webhook history',
    setupInstructions: [
      'Set webhook URL in MSG91 dashboard',
      'Enable message and delivery report webhooks',
      'Configure webhook secret for security',
      'Test with sample message'
    ]
  });
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
  console.log(`   POST /test-prompts - Test AI prompt system`);
  console.log(`   POST /test-personalization - Test user personalization`);
  console.log(`   POST /test-token-optimization - Test token savings`);
  console.log(`   GET  /admin/conversations - View conversations`);
  console.log(`   GET  /admin/users - View user profiles`);
  console.log(`   GET  /admin/token-analytics - View cost savings`);
  console.log(`   GET  /admin/knowledge-base - View prompt system`);
  console.log(`   POST /admin/test-msg91-connection - Test WhatsApp API`);
  console.log(`   GET  /admin/webhook-logs - View webhook status`);
  console.log(`📋 Environment check:`);
  console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  const msg91Status = msg91.getConfigurationStatus();
  console.log(`   MSG91_AUTH_KEY: ${msg91Status.authKey ? '✅ Set' : '❌ Missing (demo mode)'}`);
  console.log(`   MSG91_WEBHOOK_SECRET: ${msg91Status.webhookSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`📱 WhatsApp Integration:`);
  console.log(`   Status: ${msg91Status.isDemo ? '⚠️ Demo Mode' : '✅ Production Ready'}`);
  console.log(`   Webhook URL: ${msg91Status.isDemo ? 'Configure in MSG91 dashboard' : 'Ready'}`);
  console.log(`   Message delivery: ${msg91Status.isDemo ? 'Simulated' : 'Real WhatsApp'}`);
  console.log(`🧠 AI Features:`);
  console.log(`   ✅ Dynamic prompt selection`);
  console.log(`   ✅ Context-aware responses`);
  console.log(`   ✅ Message type detection`);
  console.log(`   ✅ Escalation handling`);
  console.log(`   ✅ User profiling & personalization`);
  console.log(`   ✅ Conversation history analysis`);
  console.log(`💰 Cost Optimization:`);
  console.log(`   ✅ Intelligent token reduction (40-70% savings)`);
  console.log(`   ✅ Conversation summarization`);
  console.log(`   ✅ Prompt caching & compression`);
});