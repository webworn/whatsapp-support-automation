# 🚀 Quick Test Commands

## 🧪 Local Testing (No WhatsApp Account Required)

### Start Server
```bash
npm run start:dev
```

### Test Basic Webhook
```bash
curl -X POST http://localhost:3000/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "message": "Hello!", "messageType": "text"}'
```

### Test Different Scenarios
```bash
# Text message
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "text_message", "phoneNumber": "1234567890", "message": "I need help"}'

# Button reply
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "button_reply", "phoneNumber": "1234567890"}'

# Image message
curl -X POST http://localhost:3000/webhooks/simulate-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"scenario": "image_message", "phoneNumber": "1234567890"}'
```

## 🌐 Production Testing (Railway)

### Webhook Verification
```bash
curl "https://your-app.railway.app/webhooks/whatsapp-business?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test"
```

### Test Production Webhook
```bash
curl -X POST https://your-app.railway.app/webhooks/test-whatsapp-business \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "1234567890", "message": "Production test"}'
```

### Check Statistics
```bash
curl https://your-app.railway.app/webhooks/stats | jq
```

### Health Check
```bash
curl https://your-app.railway.app/webhooks/health | jq
```

## ⚙️ Environment Variables for Railway

```bash
railway variables set WHATSAPP_VERIFY_TOKEN=your_verify_token_123
railway variables set WHATSAPP_APP_SECRET=your_app_secret
railway variables set WHATSAPP_ACCESS_TOKEN=your_access_token
railway variables set WHATSAPP_PHONE_NUMBER_ID=your_phone_id
railway variables set OPENROUTER_API_KEY=your_openrouter_key
```

## 🔍 Debug Commands

```bash
# Check logs
railway logs --follow

# Check variables
railway variables

# Test health
curl https://your-app.railway.app/api/v1/health
```

## 📱 WhatsApp Business Setup

1. **Meta Developer Console**: https://developers.facebook.com/
2. **Webhook URL**: `https://your-app.railway.app/webhooks/whatsapp-business`
3. **Subscribe to**: `messages` and `message_deliveries`
4. **Verify Token**: Use same value as `WHATSAPP_VERIFY_TOKEN`

## ✅ Expected Response
```json
{
  "success": true,
  "message": "WhatsApp Business test webhook processed successfully",
  "webhookId": "12345",
  "processingTime": 150
}
```

## 🚨 Quick Troubleshooting

**No response?** Check server is running: `curl http://localhost:3000/api/v1/health`

**Webhook verification failed?** Ensure `WHATSAPP_VERIFY_TOKEN` matches Meta Console

**AI not responding?** Check `OPENROUTER_API_KEY` is set correctly

**Deployment issues?** Check Railway logs: `railway logs`