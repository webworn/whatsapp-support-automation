# 🚀 WhatsApp Business Webhook Server

Enterprise-grade WhatsApp Business webhook implementation with AI integration.

## ✨ Features

- ✅ **WhatsApp Business API** webhook verification and message processing
- ✅ **Multiple Message Types** support (text, interactive, images, documents)
- ✅ **AI Integration** ready for OpenRouter/LLM responses
- ✅ **Security** with HMAC-SHA256 signature validation
- ✅ **Testing Tools** for simulation and validation
- ✅ **Production Ready** for Railway deployment

## 🚀 Live Demo

**Deployed on Railway:** https://whatsapp-support-automation-production.up.railway.app/

## 📡 API Endpoints

### Webhook Endpoints
- `GET /webhooks/whatsapp-business` - Webhook verification for Meta
- `POST /webhooks/whatsapp-business` - Message webhook receiver
- `POST /webhooks/test-whatsapp-business` - Simple testing endpoint
- `POST /webhooks/simulate-whatsapp-business` - Advanced scenario simulation

### Utility Endpoints
- `GET /health` - Health check
- `GET /` - API information

## 🧪 Quick Test

Test the deployed webhook right now:

```bash
# Health check
curl https://whatsapp-support-automation-production.up.railway.app/health

# Webhook verification
curl "https://whatsapp-support-automation-production.up.railway.app/webhooks/whatsapp-business?hub.mode=subscribe&hub.verify_token=test_verify_token_123&hub.challenge=test123"

# Test message processing
curl -X POST https://whatsapp-support-automation-production.up.railway.app/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "message": "Hello! I need help with my order."}'

# Simulate button reply
curl -X POST https://whatsapp-support-automation-production.up.railway.app/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "button_reply", "phoneNumber": "1234567890"}'

# Simulate image message
curl -X POST https://whatsapp-support-automation-production.up.railway.app/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "image_message", "phoneNumber": "1234567890"}'
```

## ⚙️ Environment Variables

Set these in Railway for production:

```env
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
WHATSAPP_APP_SECRET=your_app_secret_from_meta
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
OPENROUTER_API_KEY=your_openrouter_key
PORT=3000
```

## 📱 WhatsApp Business Setup

### For Meta Developer Console:
1. **Create App**: https://developers.facebook.com/ → New App → Business → WhatsApp
2. **Configure Webhook**: 
   - URL: `https://whatsapp-support-automation-production.up.railway.app/webhooks/whatsapp-business`
   - Verify Token: Use your `WHATSAPP_VERIFY_TOKEN`
3. **Subscribe**: Enable `messages` and `message_deliveries`

### Supported Message Types:
- **Text Messages**: Regular chat messages
- **Interactive Messages**: Button and list replies
- **Media Messages**: Images, documents, audio, video
- **Status Updates**: Delivery and read receipts

## 🎯 Expected Response

Successful webhook test returns:

```json
{
  "success": true,
  "message": "Test webhook processed successfully",
  "aiResponse": "Hi! I'd be happy to help you with 'your message'. Let me assist you right away! 😊"
}
```

## 🔧 Local Development

```bash
# Clone repository
git clone <your-repo-url>
cd whatsapp-development

# Install dependencies
npm install

# Start server
npm start

# Test locally
curl -X POST http://localhost:3000/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "test", "message": "Hello!"}'
```

## 📋 Message Processing Flow

1. **Webhook Received** → Signature validation
2. **Message Extracted** → Content and type identification  
3. **AI Processing** → Generate intelligent response
4. **Response Sent** → Back to WhatsApp user
5. **Status Tracked** → Delivery confirmation

## 🛡️ Security Features

- ✅ HMAC-SHA256 signature validation
- ✅ Input sanitization and validation
- ✅ Rate limiting protection
- ✅ Error handling and logging
- ✅ Environment variable security

## 📚 Documentation

- **[Complete Testing Guide](WHATSAPP-BUSINESS-GUIDE.md)** - Detailed setup and testing
- **[Quick Commands](QUICK-TEST-COMMANDS.md)** - Copy-paste test commands
- **[Test Script](test-webhook.js)** - Validation and testing tool

## 🚀 Deployment

This project is configured for Railway auto-deployment. Push to `main` branch triggers automatic deployment.

```bash
git add .
git commit -m "Update webhook implementation"
git push origin main
```

## 🎉 Ready for Production

Your WhatsApp Business webhook is production-ready with:
- ✅ Scalable architecture
- ✅ Real-time message processing
- ✅ AI-powered responses
- ✅ Comprehensive testing tools
- ✅ Security best practices

**Start receiving WhatsApp messages with AI responses today!** 🚀📱