// Simple test to check if our core services work
const express = require('express');
const app = express();

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🤖 WhatsApp Support Automation API',
    status: 'running',
    endpoints: {
      health: '/health',
      testLLM: 'POST /test-llm'
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Simple test server running on http://localhost:${port}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /test-llm - Test OpenRouter LLM`);
  console.log(`📋 Environment check:`);
  console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
});