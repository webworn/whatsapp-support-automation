# 🚀 WhatsApp Business Webhook Testing Guide

## 📋 Overview

This guide walks you through testing and using the WhatsApp Business webhook implementation we just built. The system supports both MSG91 and Meta's WhatsApp Business API with comprehensive message processing, AI responses, and testing capabilities.

## 🎯 What's Been Implemented

### ✅ **Core Features**
- **Webhook Verification**: GET endpoint for Meta's webhook verification
- **Message Processing**: Handles text, interactive, image, document, audio, video messages
- **Status Updates**: Tracks message delivery and read receipts
- **AI Integration**: OpenRouter LLM with conversation context
- **Queue Processing**: Async message handling with Bull Queue
- **Testing Endpoints**: Simulation and testing tools

### ✅ **Available Endpoints**
```
GET  /webhooks/whatsapp-business              # Webhook verification
POST /webhooks/whatsapp-business              # Real webhook from Meta
POST /webhooks/test-whatsapp-business         # Simple testing
POST /webhooks/simulate-whatsapp-business     # Advanced scenarios
GET  /webhooks/stats                          # Webhook statistics
GET  /webhooks/health                         # Health check
```

## 🧪 Testing Options

### Option 1: Local Testing (No WhatsApp Account Required)

**1. Start the Development Server**
```bash
npm run start:dev
```

**2. Test Simple Webhook Simulation**
```bash
curl -X POST http://localhost:3000/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "message": "Hello! Testing WhatsApp Business webhook.", "messageType": "text"}'
```

**3. Test Different Message Types**
```bash
# Text message
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "text_message", "phoneNumber": "1234567890", "message": "I need help with my order"}'

# Button reply
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "button_reply", "phoneNumber": "1234567890"}'

# Image message
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "image_message", "phoneNumber": "1234567890"}'

# Status update
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "status_update"}'
```

### Option 2: Real WhatsApp Business API Testing

**Prerequisites:**
1. Meta Developer Account
2. WhatsApp Business Account
3. Approved Business Manager

**Setup Steps:**

**1. Create Meta Developer App**
- Go to https://developers.facebook.com/
- Create new app → Business → WhatsApp
- Get your App ID and App Secret

**2. Configure Environment Variables**
```env
# Add to Railway or your .env file
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token_123
WHATSAPP_APP_SECRET=your_app_secret_from_meta
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

**3. Set Webhook URL in Meta Console**
- Webhook URL: `https://your-app.railway.app/webhooks/whatsapp-business`
- Verify Token: Use the same value as `WHATSAPP_VERIFY_TOKEN`
- Subscribe to: `messages` and `message_deliveries`

## 🔧 Production Deployment Steps

### Step 1: Deploy to Railway

**1. Connect Repository**
```bash
# If not already connected
railway login
railway link
```

**2. Set Environment Variables in Railway**
```bash
railway variables set WHATSAPP_VERIFY_TOKEN=your_verify_token
railway variables set WHATSAPP_APP_SECRET=your_app_secret
railway variables set WHATSAPP_ACCESS_TOKEN=your_access_token
railway variables set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
railway variables set OPENROUTER_API_KEY=your_openrouter_key
```

**3. Deploy**
```bash
railway up
```

### Step 2: Configure WhatsApp Business API

**1. Webhook Verification Test**
```bash
# Test webhook verification (replace with your Railway URL)
curl "https://your-app.railway.app/webhooks/whatsapp-business?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test_challenge"
```

**2. Configure in Meta Developer Console**
- Go to WhatsApp → Configuration
- Webhook URL: `https://your-app.railway.app/webhooks/whatsapp-business`
- Verify Token: Your `WHATSAPP_VERIFY_TOKEN`
- Click "Verify and Save"

**3. Subscribe to Webhook Fields**
- Check: `messages`
- Check: `message_deliveries`
- Click "Subscribe"

## 📱 Real WhatsApp Testing Flow

### Test Message Flow

**1. Send Test Message to Your Business Number**
```bash
# Use this endpoint to send a test message to your WhatsApp
curl -X POST https://your-app.railway.app/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "YOUR_PHONE_NUMBER", "message": "Hello! This is your AI support bot. Send me a message to test! 🤖"}'
```

**2. Reply from WhatsApp**
- Send a message from your WhatsApp to the business number
- The system will:
  - ✅ Receive the webhook
  - ✅ Process with AI
  - ✅ Send personalized response
  - ✅ Track conversation history

**3. Monitor in Real-Time**
```bash
# Check webhook statistics
curl https://your-app.railway.app/webhooks/stats

# Check health status
curl https://your-app.railway.app/webhooks/health
```

## 🎯 Expected Results

### Successful Test Response
```json
{
  "success": true,
  "message": "WhatsApp Business test webhook processed successfully",
  "webhookId": "12345",
  "processingTime": 150
}
```

### AI Response Example
When you send "Hello, I need help with my website" to the business number, you should receive:

```
Hi! I'm Alex from TechCorp Solutions. I'd be happy to help with your website issue. Can you describe what specific problem you're experiencing? 🔧
```

## 🐛 Troubleshooting

### Common Issues

**1. Webhook Verification Failed**
```bash
# Check if verify token matches
echo $WHATSAPP_VERIFY_TOKEN
# Ensure it matches what you set in Meta Console
```

**2. Messages Not Being Received**
```bash
# Check webhook logs
railway logs

# Test webhook directly
curl -X POST https://your-app.railway.app/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "test", "message": "test"}'
```

**3. AI Responses Not Working**
```bash
# Check OpenRouter API key
railway variables get OPENROUTER_API_KEY

# Test AI directly
curl -X POST http://localhost:3000/test-llm \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Debug Commands
```bash
# Check application status
railway status

# View real-time logs
railway logs --follow

# Check environment variables
railway variables

# Test health endpoint
curl https://your-app.railway.app/api/v1/health
```

## 📊 Monitoring & Analytics

### Webhook Statistics
```bash
curl https://your-app.railway.app/webhooks/stats | jq
```

**Response:**
```json
{
  "totalReceived": 150,
  "successfullyProcessed": 145,
  "failed": 5,
  "averageProcessingTime": 200,
  "bySource": {
    "whatsapp_business": 100,
    "msg91": 50
  },
  "byType": {
    "text": 120,
    "interactive": 20,
    "image": 10
  }
}
```

### Health Check
```bash
curl https://your-app.railway.app/webhooks/health | jq
```

## 🚀 Production Checklist

### Before Going Live
- [ ] Webhook verification working
- [ ] Test messages being processed
- [ ] AI responses generating correctly
- [ ] Message delivery confirmations received
- [ ] Error handling working properly
- [ ] Logging and monitoring active
- [ ] Rate limiting configured
- [ ] Security headers in place

### WhatsApp Business Requirements
- [ ] Business account verified
- [ ] Phone number dedicated to WhatsApp Business
- [ ] Display name and profile configured
- [ ] Message templates approved (for marketing)
- [ ] Privacy policy and terms of service published

## 🎉 Next Steps

**1. Customize AI Responses**
- Update prompts in `src/modules/llm/llm.service.ts`
- Add business-specific context and knowledge

**2. Add Conversation Flows**
- Create YAML flow files in `src/modules/flow/`
- Implement structured conversation paths

**3. Enhanced Features**
- Add user authentication
- Implement conversation memory
- Add rich message templates
- Create admin dashboard

**4. Scaling**
- Configure Redis clustering
- Add database read replicas
- Implement horizontal scaling
- Add CDN for media files

## 📞 Support

If you encounter issues:
1. Check the logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Test individual endpoints using the curl commands above
4. Check WhatsApp Business API status in Meta Developer Console

## 🏆 Success!

Your WhatsApp Business webhook is now ready for production! You can:
- ✅ Receive real WhatsApp messages
- ✅ Process them with AI
- ✅ Send intelligent responses
- ✅ Track conversation analytics
- ✅ Handle multiple message types
- ✅ Scale to handle thousands of users

Happy messaging! 🚀📱