# Environment Setup for WhatsApp Testing

## Plan ID: todo25062025
## Created: June 25, 2025

## Railway Environment Variables Configuration

### Required Variables (Already Set)
✅ These are already configured in your Railway deployment:

```bash
WHATSAPP_ACCESS_TOKEN=EAANULRpPnZC8BO3JOSPMBtmfRYm31C45PcZA0DhwFK6DYWWo9ugZAsZCnuHU6ARS7BXkZAkcpZCTwLvXWi4vdabZCgu7nJ5oxRSJw88OzHjuBRZBPvdux6VnSMfpOZAwuNVUsOd8nVddRK7V7n9d0zfsR07iQNoad7jIcOmNZClVdKeJvqquItwoRLdqhm9xWWZBlJMuGjTUfWBu73JBvdhWpdVlJO8v13Itadlm0dLHaAiunpeBhF9YQjZBICe9dOk2vFZB9
WHATSAPP_PHONE_NUMBER_ID=665397593326012
WHATSAPP_WEBHOOK_SECRET=test_webhook_secret_456
WHATSAPP_WEBHOOK_VERIFY_TOKEN=test_verify_token_123
```

### New Variables to Add
🆕 Add these new variables to enable testing:

```bash
# Enable Test Mode
WHATSAPP_TEST_MODE=true

# Test Number (Meta's official test number)
WHATSAPP_TEST_NUMBER=+15556485637

# Business Account ID (for reference)
WHATSAPP_BUSINESS_ACCOUNT_ID=1437200930610622

# Optional: Test Session Configuration
TEST_SESSION_TIMEOUT=3600
MAX_TEST_MESSAGES=50
```

## Steps to Add Environment Variables in Railway

1. **Open Railway Dashboard**
   - Go to https://railway.app
   - Navigate to your project: whatsapp-support-automation-production

2. **Access Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Click "New Variable"

3. **Add Each Variable**
   ```
   Variable Name: WHATSAPP_TEST_MODE
   Value: true
   
   Variable Name: WHATSAPP_TEST_NUMBER  
   Value: +15556485637
   
   Variable Name: WHATSAPP_BUSINESS_ACCOUNT_ID
   Value: 1437200930610622
   
   Variable Name: TEST_SESSION_TIMEOUT
   Value: 3600
   
   Variable Name: MAX_TEST_MESSAGES
   Value: 50
   ```

4. **Deploy Changes**
   - Railway will automatically redeploy when variables are added
   - Wait for deployment to complete (usually 2-3 minutes)

## Verification Steps

### 1. Check Application Health
```bash
curl https://whatsapp-support-automation-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "WhatsApp AI Railway Template",
  "version": "3.0.0"
}
```

### 2. Check Test Connection
```bash
curl https://whatsapp-support-automation-production.up.railway.app/api/test/connection
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "status": "connected",
    "testMode": true,
    "testNumber": "+15556485637",
    "phoneNumberId": "665397593326012"
  }
}
```

### 3. Check Test Status
```bash
curl https://whatsapp-support-automation-production.up.railway.app/api/test/status
```

### 4. Access Testing Dashboard
Navigate to: https://whatsapp-support-automation-production.up.railway.app/dashboard/testing

Expected:
- ✅ Testing page loads
- ✅ Connection status shows "Connected"
- ✅ Test mode shows "Enabled"
- ✅ Test number displays: +1 555 648 5637

## Test Phone Number Details

**Meta's Official Test Number:**
- **Phone Number**: +1 555 648 5637
- **Phone Number ID**: 665397593326012
- **Business Account ID**: 1437200930610622

**How it works:**
1. This is Meta's official test number for WhatsApp Business API
2. Messages sent to this number will be received by your webhook
3. You can send messages from your personal WhatsApp to this number
4. The system will process them as real customer messages
5. AI will generate responses using your knowledge base

## Testing Process

### Step 1: Enable Test Mode (Railway)
1. Add environment variables as listed above
2. Wait for Railway to redeploy

### Step 2: Verify System (Dashboard)
1. Login to: https://whatsapp-support-automation-production.up.railway.app/login
2. Use credentials: test@example.com / testpass123
3. Navigate to Dashboard → Testing
4. Check connection status

### Step 3: Test Message Flow
1. Open WhatsApp on your phone
2. Send message to: +1 555 648 5637
3. Watch real-time monitor in dashboard
4. Verify AI response received on your WhatsApp

## Troubleshooting

### Test Mode Not Enabled
**Symptom**: Dashboard shows "Test Mode Disabled"
**Solution**: 
1. Verify WHATSAPP_TEST_MODE=true in Railway
2. Check Railway deployment completed
3. Wait 2-3 minutes for changes to take effect

### Connection Error
**Symptom**: Connection status shows "Error"
**Solution**:
1. Check WHATSAPP_ACCESS_TOKEN is correct
2. Verify WHATSAPP_PHONE_NUMBER_ID matches 665397593326012
3. Test API connection manually

### No Message Received
**Symptom**: Send WhatsApp message but nothing appears in dashboard
**Solution**:
1. Verify webhook URL is configured in Meta Business
2. Check WHATSAPP_WEBHOOK_VERIFY_TOKEN
3. Check webhook logs in dashboard

### AI Not Responding
**Symptom**: Message received but no AI response
**Solution**:
1. Check OPENROUTER_API_KEY is configured
2. Verify knowledge base has documents
3. Check conversation logs for errors

## Success Criteria

### ✅ Configuration Success
- [ ] All environment variables added to Railway
- [ ] Application redeployed successfully
- [ ] Test connection status: "Connected"
- [ ] Test mode enabled in dashboard

### ✅ Functional Success
- [ ] Can access /dashboard/testing page
- [ ] Can send message from personal WhatsApp to +1 555 648 5637
- [ ] Message appears in real-time monitor
- [ ] AI generates response using knowledge base
- [ ] Response received on personal WhatsApp
- [ ] Conversation tracked in dashboard

### ✅ No Breaking Changes
- [ ] Existing login/dashboard functionality works
- [ ] Production conversations unaffected
- [ ] All original features preserved
- [ ] No performance degradation

## Next Steps After Setup

1. **Test with Sample Messages**
   - "Hello, I need help with my order"
   - "What are your business hours?"
   - "Can you tell me about your services?"

2. **Verify Knowledge Base Integration**
   - Upload sample documents in Knowledge Base
   - Test AI responses use document content
   - Verify contextual responses

3. **Monitor Performance**
   - Check response times in dashboard
   - Monitor webhook success rates
   - Verify no impact on existing system

4. **User Training**
   - Document testing process for team
   - Create test scenarios
   - Establish testing best practices