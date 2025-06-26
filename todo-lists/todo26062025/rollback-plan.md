# Rollback Plan - WhatsApp Test Number Fix

## Emergency Rollback Procedures

### When to Execute Rollback
- [ ] WhatsApp API completely stops working
- [ ] System health endpoints return errors  
- [ ] Frontend becomes inaccessible
- [ ] Database connectivity lost
- [ ] Authentication system fails
- [ ] More than 50% of functionality broken

## Immediate Rollback (< 5 minutes)

### Step 1: Code Rollback
```bash
# If changes were deployed and causing issues
git log --oneline -5  # Check recent commits
git revert HEAD       # Revert last commit
git push origin main  # Deploy rollback immediately
```

### Step 2: Environment Variable Restoration
**Railway Dashboard > Environment Variables:**
```env
# Restore these exact values if changed:
WHATSAPP_ACCESS_TOKEN=placeholder-access-token
WHATSAPP_PHONE_NUMBER_ID=placeholder-phone-number-id
TEST_MODE_ENABLED=true
TEST_ACCESS_TOKEN=EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD
TEST_PHONE_NUMBER_ID=665397593326012
TEST_VERIFY_TOKEN=whatsapp_test_verify
```

### Step 3: Force Redeploy
```bash
# Trigger Railway redeploy
git commit --allow-empty -m "force redeploy for rollback"
git push origin main
```

### Step 4: Immediate Verification
```bash
# Check system health after rollback
curl -s https://whatsapp-support-automation-production.up.railway.app/health
curl -s https://whatsapp-support-automation-production.up.railway.app/api/health
curl -s https://whatsapp-support-automation-production.up.railway.app/
```

**Expected Results:**
- All health endpoints return successful responses
- Frontend loads correctly
- No 500 errors in responses

## Partial Rollback (10-15 minutes)

### Scenario: Only WhatsApp Integration Broken

#### Step 1: Identify Specific Issue
```bash
# Test individual components
curl -s https://whatsapp-support-automation-production.up.railway.app/api/test-whatsapp
curl -s https://whatsapp-support-automation-production.up.railway.app/api/test-llm
curl -s https://whatsapp-support-automation-production.up.railway.app/api/db-test
```

#### Step 2: Selective Environment Restore
Only restore WhatsApp-related environment variables:
```env
# Keep new variables, restore only problematic ones
WHATSAPP_ACCESS_TOKEN=placeholder-access-token
WHATSAPP_PHONE_NUMBER_ID=placeholder-phone-number-id
```

#### Step 3: Code Selective Revert
```bash
# Revert only specific files if identified
git checkout HEAD~1 -- src/modules/whatsapp/whatsapp.service.ts
git checkout HEAD~1 -- src/config/whatsapp.config.ts
git commit -m "selective rollback of WhatsApp service changes"
git push origin main
```

## Gradual Rollback (20-30 minutes)

### Scenario: Systematic Issues Need Investigation

#### Step 1: Create Rollback Branch
```bash
git checkout -b rollback-whatsapp-fix-26062025
git reset --hard c02ce6f  # Reset to last known working commit (June 25)
git push origin rollback-whatsapp-fix-26062025
```

#### Step 2: Test Rollback Branch
```bash
# Deploy rollback branch to staging/test
# Verify all functionality works as expected
# Document what was lost in rollback
```

#### Step 3: Environment Analysis
```bash
# Compare current vs working environment
# Document differences
# Plan incremental restoration
```

## Data Recovery Procedures

### If Database Issues Occur

#### Step 1: Check Database Integrity
```bash
curl -s https://whatsapp-support-automation-production.up.railway.app/api/db-test
curl -s https://whatsapp-support-automation-production.up.railway.app/api/db-schema
```

#### Step 2: Database Rollback (if needed)
```bash
# Railway manages database backups automatically
# Contact Railway support if database restoration needed
# Last backup: Check Railway dashboard
```

### If User Sessions Lost

#### Step 1: Clear Existing Sessions
```bash
# Sessions are stored in database
# Check session validity with debug endpoint
curl -s https://whatsapp-support-automation-production.up.railway.app/api/debug-jwt
```

#### Step 2: Force Session Refresh
```bash
# Users may need to log in again
# This is acceptable for rollback scenario
```

## Communication Plan

### Internal Notifications
1. **Rollback Initiated**: Document start time and reason
2. **Rollback Progress**: Update every 5 minutes
3. **Rollback Complete**: Confirm all systems operational
4. **Post-Mortem**: Schedule review within 24 hours

### User Impact Assessment
- **WhatsApp Users**: May experience temporary response delays
- **Web Users**: Should experience no impact
- **Admin Users**: May need to re-login after session reset

## Post-Rollback Actions

### Step 1: System Verification (30 minutes)
```bash
# Comprehensive system test
curl -s https://whatsapp-support-automation-production.up.railway.app/health
curl -s https://whatsapp-support-automation-production.up.railway.app/api/health
curl -s https://whatsapp-support-automation-production.up.railway.app/api/test-llm
curl -s https://whatsapp-support-automation-production.up.railway.app/api/db-test

# Test all major user flows
# - Frontend loading
# - User authentication  
# - Basic API functionality
# - Database operations
```

### Step 2: Issue Analysis (1 hour)
- [ ] Document what changes caused the issue
- [ ] Identify root cause of failure
- [ ] Review testing procedures that missed the issue
- [ ] Plan improved implementation strategy

### Step 3: Stakeholder Communication
- [ ] Update project documentation with rollback details
- [ ] Notify relevant parties of system status
- [ ] Plan timeline for re-implementation
- [ ] Document lessons learned

## Prevention for Next Attempt

### Enhanced Testing Strategy
1. **Staging Environment**: Test all changes in staging first
2. **Gradual Deployment**: Deploy changes incrementally
3. **Monitoring**: Enhanced monitoring during deployment
4. **Feature Flags**: Use feature flags for risky changes

### Backup Strategies
1. **Environment Backup**: Export all env vars before changes
2. **Database Backup**: Ensure recent backup before deployment
3. **Code Backup**: Tag stable release before major changes
4. **Configuration Backup**: Document all working configurations

## Rollback Success Criteria

### System Health Restored:
- [ ] All health endpoints return 200 OK
- [ ] Frontend loads without errors
- [ ] User authentication works
- [ ] Database connectivity confirmed
- [ ] No 500 errors in Railway logs

### Functionality Verified:
- [ ] Users can access the system
- [ ] Basic AI functionality works (even if WhatsApp doesn't)
- [ ] No data loss occurred
- [ ] All existing features preserved

### Stakeholder Satisfaction:
- [ ] System availability restored to pre-change levels
- [ ] No additional functionality broken
- [ ] Clear timeline for fix re-implementation
- [ ] Confidence in rollback procedures validated

## Emergency Contacts

### Technical Support
- **Railway Support**: Available via Railway dashboard
- **Domain/DNS**: CloudFlare support if domain issues
- **Monitoring**: Railway logs and metrics dashboard

### Decision Authority
- **Rollback Decision**: Project lead or on-call engineer
- **Communication**: Update stakeholders within 15 minutes of rollback
- **Post-Mortem**: Schedule within 24 hours of incident