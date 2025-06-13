# WhatsApp Support Automation

🤖 Enterprise-grade WhatsApp customer support automation with AI integration.

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## ✨ Features

- ✅ OpenRouter AI Integration (Claude 3 Haiku)
- ✅ WhatsApp Business API Ready
- ✅ Session Management
- ✅ Health Monitoring
- ✅ Production Ready

## 🔧 Environment Variables

Set these in Railway:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
NODE_ENV=production
PORT=3000
```

## 📡 API Endpoints

- `GET /health` - Health check
- `POST /test-llm` - Test AI integration

## 🧪 Test the AI

```bash
curl -X POST https://your-app.railway.app/test-llm \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

## 🚀 Generated with Claude Code

Built with enterprise-grade architecture and best practices.