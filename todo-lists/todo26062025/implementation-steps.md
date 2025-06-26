# Implementation Steps - WhatsApp Test Number Fix

## Phase 1: Environment Configuration Fix (30 min)

### Step 1.1: Fix Test Mode Environment Variable
- [ ] Update `whatsapp.config.ts` line 46
- [ ] Change from `WHATSAPP_TEST_MODE` to `TEST_MODE_ENABLED`
- [ ] Or add both for backward compatibility

### Step 1.2: Map Test Credentials Properly  
- [ ] Update WhatsApp service to detect test mode
- [ ] Use `TEST_ACCESS_TOKEN` when test mode is enabled
- [ ] Use `TEST_PHONE_NUMBER_ID` when test mode is enabled
- [ ] Use `TEST_VERIFY_TOKEN` for webhook verification

### Step 1.3: Verify Current Environment Variables
- [ ] Check Railway environment variables are set correctly
- [ ] Confirm test credentials are valid and not expired
- [ ] Validate webhook verification token matches

## Phase 2: WhatsApp Service Updates (45 min)

### Step 2.1: Update WhatsApp Service Logic
- [ ] Modify `whatsapp.service.ts` to support test mode
- [ ] Add test credential detection logic
- [ ] Implement credential switching based on test mode
- [ ] Add logging to show which credentials are being used

### Step 2.2: Update Configuration Loading
- [ ] Fix `whatsapp.config.ts` credential mapping
- [ ] Ensure test mode properly loads test credentials
- [ ] Add validation for required test credentials

### Step 2.3: Update Webhook Service
- [ ] Fix webhook verification token handling
- [ ] Ensure proper token selection for test vs production
- [ ] Add enhanced logging for webhook verification

## Phase 3: Testing & Validation (45 min)

### Step 3.1: Local Testing
- [ ] Test webhook verification endpoint
- [ ] Test WhatsApp API connection with test credentials
- [ ] Test AI response generation
- [ ] Test complete message flow with test webhook

### Step 3.2: Production Deployment
- [ ] Deploy configuration changes to Railway
- [ ] Verify deployment successful
- [ ] Check all health endpoints
- [ ] Validate environment variables loaded correctly

### Step 3.3: End-to-End Testing
- [ ] Send test message to `+15556485637`
- [ ] Verify webhook receives message
- [ ] Confirm AI response generation
- [ ] Validate response sent back to WhatsApp
- [ ] Check message delivery status

## Phase 4: Verification & Documentation (30 min)

### Step 4.1: Meta Integration Testing
- [ ] Test webhook verification in Meta Business Manager
- [ ] Verify green checkmark appears
- [ ] Test actual message sending to test number
- [ ] Confirm bidirectional communication works

### Step 4.2: Regression Testing
- [ ] Test all existing endpoints still work
- [ ] Verify production functionality unaffected
- [ ] Check authentication still works
- [ ] Validate frontend pages load correctly

### Step 4.3: Documentation Update
- [ ] Update PROGRESS_LOG.md with fix details
- [ ] Document new test mode configuration
- [ ] Update CLAUDE.md with current status
- [ ] Create troubleshooting guide for future issues

## Critical File Changes Required

### Files to Modify:
1. `src/config/whatsapp.config.ts` - Fix test mode environment variable
2. `src/modules/whatsapp/whatsapp.service.ts` - Add test credential support
3. `src/modules/webhook/webhook.service.ts` - Fix webhook verification
4. Environment variables in Railway - Ensure proper mapping

### Testing Files:
1. Test webhook endpoint functionality
2. Test AI response generation
3. Test WhatsApp API connection
4. Test complete message flow

## Success Metrics
- [ ] Webhook verification returns challenge correctly
- [ ] Test messages to `+15556485637` get AI responses
- [ ] Response time < 10 seconds end-to-end
- [ ] No errors in Railway logs
- [ ] Meta Business Manager shows webhook as healthy

## Risk Mitigation
- [ ] Backup current configuration before changes
- [ ] Test changes in development environment first
- [ ] Have rollback plan ready
- [ ] Monitor Railway logs during deployment
- [ ] Keep production credentials as fallback