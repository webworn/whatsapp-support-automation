# WhatsApp Business API Testing Setup

## 🧪 Test Your System with Real WhatsApp Business API

Your system now supports **both MSG91 and Meta's WhatsApp Business API**. This guide helps you test with the official WhatsApp Business API.

## 🚀 Quick Testing Options

### Option 1: Webhook Simulation (No Setup Required)

Test your AI responses immediately:

```bash
# Simulate a WhatsApp Business webhook
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"Hello, I need help with my website"}'
```

### Option 2: WhatsApp Business API (Real Integration)

For real WhatsApp testing, follow these steps:

## 📋 WhatsApp Business API Setup

### Step 1: Create Meta Developer Account

1. **Visit:** https://developers.facebook.com/
2. **Create** a developer account
3. **Create** a new app → Business → WhatsApp
4. **Note** your App ID and App Secret

### Step 2: WhatsApp Business Setup

1. **Go to:** WhatsApp → Getting Started
2. **Add** a phone number for testing
3. **Get** your access token (temporary for testing)
4. **Note** your Phone Number ID

### Step 3: Configure Environment Variables

Add these to Railway:

```env
# WhatsApp Business API (for testing)
WHATSAPP_VERIFY_TOKEN=your-verify-token-here
WHATSAPP_ACCESS_TOKEN=your-access-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_APP_SECRET=your-app-secret
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

### Step 4: Set Webhook URL

1. **In Meta Developer Console:**
   - Go to WhatsApp → Configuration
   - Set webhook URL: `https://whatsapp-support-automation-production.up.railway.app/webhook/whatsapp-business`
   - Set verify token: `your-verify-token-here`
   - Subscribe to: `messages` and `message_deliveries`

## 🧪 Testing Commands

### Test Configuration
```bash
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890"}'
```

### Simulate Different Message Types
```bash
# Text message
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"My website is down","messageType":"text"}'

# Image message
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"Screenshot of error","messageType":"image"}'

# Document message
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"Error log file","messageType":"document"}'
```

### Send Interactive Message
```bash
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/send-interactive-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"1234567890",
    "text":"How can I help you today?",
    "buttons":[
      {"id":"tech_support","title":"Technical Support"},
      {"id":"billing","title":"Billing Question"},
      {"id":"general","title":"General Inquiry"}
    ]
  }'
```

## 📱 Real Testing Flow

### 1. Send Test Message to Your WhatsApp

If you have access tokens configured:

```bash
curl -X POST https://whatsapp-support-automation-production.up.railway.app/admin/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_PHONE_NUMBER","message":"Hello! This is your AI support bot. Send me a message to test! 🤖"}'
```

### 2. Reply from WhatsApp

Send a message from your WhatsApp to the business number. Your system will:
- ✅ Receive the webhook
- ✅ Process with AI
- ✅ Send personalized response
- ✅ Track conversation history

### 3. Monitor in Real-Time

Watch your Railway logs to see:
- Incoming webhook data
- AI processing
- Token optimization
- Response delivery

## 🔧 Webhook Verification

WhatsApp Business API requires webhook verification:

1. **Meta will send GET request to:**
   `https://whatsapp-support-automation-production.up.railway.app/webhook/whatsapp-business?hub.mode=subscribe&hub.verify_token=your-verify-token&hub.challenge=CHALLENGE_STRING`

2. **Your system automatically responds** with the challenge string

3. **Verification complete** - webhooks will start flowing

## 🎯 What Each Test Shows

### Webhook Simulation
- ✅ AI response generation
- ✅ User profiling and personalization
- ✅ Token optimization
- ✅ Conversation management
- ❌ Real WhatsApp delivery

### WhatsApp Business API
- ✅ All simulation features
- ✅ Real WhatsApp message delivery
- ✅ Webhook signature validation
- ✅ Message status tracking
- ✅ Interactive messages and buttons

## 🚨 Testing Limitations

**Free Tier Limits:**
- Meta provides test access tokens (24 hours)
- Limited to 5 phone numbers
- 1000 messages per month
- Business verification required for production

**Demo vs Production:**
- Demo mode: All features work except real WhatsApp delivery
- Production mode: Requires approved Business Manager account

## 💡 Testing Strategy

1. **Start with simulation** - Test AI responses immediately
2. **Use test access tokens** - Test real WhatsApp with temporary setup
3. **Business verification** - For production deployment
4. **Choose MSG91 or Business API** - Based on your needs

## 🎉 Expected Results

**Successful Test Response:**
```json
{
  "success": true,
  "simulation": "WhatsApp Business webhook simulated",
  "messageData": {
    "from": "1234567890",
    "text": "Hello, I need help with my website",
    "type": "text"
  },
  "aiResponse": "Hi! I'm Alex from TechCorp Solutions. I'd be happy to help with your website issue. Can you describe what specific problem you're experiencing? 🔧"
}
```

Your AI system is now ready for real-world WhatsApp testing! 🚀