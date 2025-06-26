# Environment Setup - WhatsApp Test Number Fix

## Current Environment Analysis

### ❌ Problematic Configuration
```env
# Production (placeholder - not working)
WHATSAPP_ACCESS_TOKEN=placeholder-access-token
WHATSAPP_PHONE_NUMBER_ID=placeholder-phone-number-id  
WHATSAPP_WEBHOOK_VERIFY_TOKEN=placeholder-verify-token

# Test Mode Flag (wrong variable name)
TEST_MODE_ENABLED=true  # Should be WHATSAPP_TEST_MODE

# Test Credentials (correct but not used)
TEST_ACCESS_TOKEN=EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD
TEST_PHONE_NUMBER_ID=665397593326012
TEST_VERIFY_TOKEN=whatsapp_test_verify
```

## ✅ Required Environment Configuration

### Option A: Fix Variable Names (Recommended)
```env
# Test Mode Activation (FIXED NAME)
WHATSAPP_TEST_MODE=true

# Production Credentials (when test mode is false)
WHATSAPP_ACCESS_TOKEN=production-token-here
WHATSAPP_PHONE_NUMBER_ID=production-phone-id-here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=production-verify-token

# Test Credentials (when test mode is true)
WHATSAPP_TEST_ACCESS_TOKEN=EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD
WHATSAPP_TEST_PHONE_NUMBER_ID=665397593326012
WHATSAPP_TEST_VERIFY_TOKEN=testverifytoken123

# Meta Test Number Configuration
WHATSAPP_TEST_NUMBER=+15556485637
WHATSAPP_BUSINESS_ACCOUNT_ID=1437200930610622
```

### Option B: Update Code to Use Current Variables
```env
# Keep current variable names, update code to use them
TEST_MODE_ENABLED=true
TEST_ACCESS_TOKEN=EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD
TEST_PHONE_NUMBER_ID=665397593326012  
TEST_VERIFY_TOKEN=testverifytoken123
```

## Environment Variable Mapping

### Current Code Expectations:
```typescript
// whatsapp.config.ts line 46
enabled: process.env.WHATSAPP_TEST_MODE === 'true'

// whatsapp.service.ts lines 25-26
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
```

### Required Updates:
1. **Test Mode Detection**: Fix variable name mismatch
2. **Credential Selection**: Use test credentials when test mode enabled
3. **Webhook Verification**: Use correct verify token for test mode

## Railway Environment Variables Setup

### Step 1: Current Variables to Keep
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# App Configuration  
PORT=3000
NODE_ENV=production
JWT_SECRET=...

# AI Configuration
OPENROUTER_API_KEY=...
OPENROUTER_PRIMARY_MODEL=anthropic/claude-3-haiku
```

### Step 2: Variables to Add/Update
```bash
# Test Mode Configuration
WHATSAPP_TEST_MODE=true

# Test Credentials (Meta Test Number)
WHATSAPP_TEST_ACCESS_TOKEN=EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD
WHATSAPP_TEST_PHONE_NUMBER_ID=665397593326012
WHATSAPP_TEST_VERIFY_TOKEN=testverifytoken123

# Production Credentials (for future use)
WHATSAPP_ACCESS_TOKEN=production-token-when-available
WHATSAPP_PHONE_NUMBER_ID=production-phone-id-when-available
WHATSAPP_WEBHOOK_VERIFY_TOKEN=production-verify-token
```

### Step 3: Variables to Remove/Replace
```bash
# Remove these (wrong naming)
TEST_MODE_ENABLED  # -> WHATSAPP_TEST_MODE
TEST_ACCESS_TOKEN  # -> WHATSAPP_TEST_ACCESS_TOKEN  
TEST_PHONE_NUMBER_ID  # -> WHATSAPP_TEST_PHONE_NUMBER_ID
TEST_VERIFY_TOKEN  # -> WHATSAPP_TEST_VERIFY_TOKEN
```

## Validation Commands

### Test Environment Loading:
```bash
curl -s https://whatsapp-support-automation-production.up.railway.app/api/test-whatsapp
curl -s https://whatsapp-support-automation-production.up.railway.app/api/test/instructions
```

### Test Webhook Verification:
```bash
curl -s "https://whatsapp-support-automation-production.up.railway.app/api/webhooks/whatsapp-business?hub.mode=subscribe&hub.verify_token=testverifytoken123&hub.challenge=test123"
```

### Test Message Processing:
```bash
curl -s -X POST https://whatsapp-support-automation-production.up.railway.app/api/webhooks/whatsapp-business/test -H "Content-Type: application/json" -d '{"customerPhone":"+15556485637","message":"Test AI response"}'
```

## Security Considerations

### Credential Management:
- [ ] Never commit real credentials to git
- [ ] Use Railway environment variables for all sensitive data
- [ ] Rotate test credentials periodically
- [ ] Monitor for credential exposure in logs

### Access Control:
- [ ] Limit test mode to development/staging environments
- [ ] Implement proper production credential validation
- [ ] Add audit logging for credential usage
- [ ] Monitor for unauthorized access attempts