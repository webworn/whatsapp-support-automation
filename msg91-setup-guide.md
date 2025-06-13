# MSG91 WhatsApp Business API Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Create MSG91 Account

1. **Visit:** https://msg91.com/
2. **Sign up** for a new account
3. **Verify** your email and phone number
4. **Complete** KYC verification (required for WhatsApp Business API)

### Step 2: WhatsApp Business API Setup

1. **Go to:** MSG91 Dashboard → WhatsApp
2. **Click:** "Get WhatsApp Business API"
3. **Choose:** Business verification method
4. **Submit:** Required business documents
5. **Wait:** 24-48 hours for approval

### Step 3: Get Your API Credentials

Once approved, you'll get:

```env
# Add these to your .env file
MSG91_AUTH_KEY=your-auth-key-here
MSG91_WHATSAPP_TOKEN=your-whatsapp-token-here
MSG91_SENDER_ID=your-business-phone-number
MSG91_WEBHOOK_SECRET=your-webhook-secret
```

### Step 4: Configure Webhook URL

1. **In MSG91 Dashboard:**
   - Go to WhatsApp → Settings → Webhooks
   - Set webhook URL: `https://your-railway-app.railway.app/webhook/whatsapp`
   - Enable: "Incoming Messages"
   - Enable: "Delivery Reports"
   - Set secret key for signature validation

### Step 5: Test Configuration

Use our built-in test endpoints:

```bash
# Test API connection
curl -X POST https://your-app.railway.app/admin/test-msg91-connection

# Send test message
curl -X POST https://your-app.railway.app/send-message \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","message":"Test message from your WhatsApp bot!"}'
```

## 📋 Required Environment Variables

```env
# MSG91 WhatsApp Business API
MSG91_AUTH_KEY=your-auth-key-here
MSG91_WHATSAPP_TOKEN=your-whatsapp-token-here
MSG91_SENDER_ID=your-business-phone-number
MSG91_WEBHOOK_SECRET=your-webhook-secret
MSG91_BASE_URL=https://api.msg91.com/api

# Existing (keep these)
OPENROUTER_API_KEY=your-openrouter-key
NODE_ENV=production
PORT=3000
```

## 🔒 Security Setup

1. **Webhook Signature Validation:** Enabled automatically
2. **IP Whitelisting:** Configure in MSG91 dashboard
3. **Rate Limiting:** Built into our system
4. **HTTPS Only:** Required for production

## 📱 WhatsApp Business Account Requirements

- **Business Phone Number:** Must be dedicated to WhatsApp Business
- **Business Verification:** Valid business documents required
- **Display Name:** Your business name (cannot be changed easily)
- **Profile:** Business description and logo

## 🧪 Testing Checklist

- [ ] MSG91 account created and verified
- [ ] WhatsApp Business API approved
- [ ] Webhook URL configured
- [ ] Environment variables set
- [ ] Test message sent successfully
- [ ] Incoming messages received
- [ ] AI responses working
- [ ] Message delivery confirmations received

## 📞 Support

- **MSG91 Support:** https://help.msg91.com/
- **WhatsApp Business API Docs:** https://developers.facebook.com/docs/whatsapp/
- **Our Support:** Check logs at `/admin/webhook-logs`

## 💡 Pro Tips

1. **Start with Sandbox:** MSG91 provides sandbox for testing
2. **Phone Number Format:** Use international format (+1234567890)
3. **Message Templates:** Pre-approved templates for marketing messages
4. **Rate Limits:** WhatsApp has strict rate limits - our system handles this
5. **Business Hours:** Configure auto-responses for off-hours

## 🚨 Common Issues

**Issue:** "Phone number not registered"
**Solution:** Number must be registered with WhatsApp Business API

**Issue:** "Webhook not receiving messages"
**Solution:** Check webhook URL and ensure it's publicly accessible

**Issue:** "Message delivery failed"
**Solution:** Verify phone number format and MSG91 account balance

**Issue:** "Authentication failed"
**Solution:** Check AUTH_KEY and WHATSAPP_TOKEN in environment variables