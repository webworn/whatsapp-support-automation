# Rollback Plan - WhatsApp Testing System

## Plan ID: todo25062025
## Created: June 25, 2025

## Overview
This document outlines the complete rollback strategy for the WhatsApp testing implementation. All changes are designed to be non-breaking and easily reversible.

## Risk Assessment

### Low Risk Changes ✅
- Adding new files (no existing code modified)
- Adding new API endpoints (no existing endpoints changed)
- Adding new frontend pages (no existing pages modified)
- Adding environment variables (existing variables unchanged)

### Medium Risk Changes ⚠️
- Modifying configuration files (with backward compatibility)
- Adding new modules to app.module.ts (non-breaking addition)

### High Risk Changes ❌
- None planned (all changes designed to be additive only)

## Rollback Triggers

### Immediate Rollback Required
- Any existing functionality breaks
- Production webhook stops working
- AI responses fail for existing conversations
- Authentication system fails
- Database errors occur

### Performance Rollback
- Response times increase > 20%
- Memory usage increases > 30%
- CPU usage increases > 25%
- Error rates increase > 5%

### User Experience Rollback
- Dashboard becomes inaccessible
- Login/logout fails
- Conversation management breaks
- Knowledge base system fails

## Rollback Procedures

### Quick Rollback (5 minutes)

#### Step 1: Disable Test Mode
```bash
# In Railway dashboard, set:
WHATSAPP_TEST_MODE=false
# Or remove the variable entirely
```

#### Step 2: Remove Test Environment Variables
```bash
# Remove from Railway:
WHATSAPP_TEST_NUMBER (remove)
```

#### Step 3: Verify System Health
```bash
# Check all endpoints:
curl https://whatsapp-support-automation-production.up.railway.app/health
curl https://whatsapp-support-automation-production.up.railway.app/api/test-whatsapp
```

### Full Rollback (15 minutes)

#### Step 1: Revert Code Changes
```bash
# If any files were modified, revert them:
git checkout HEAD~1 -- src/config/whatsapp.config.ts
git checkout HEAD~1 -- src/app.module.ts
git checkout HEAD~1 -- frontend/src/app/dashboard/layout.tsx
```

#### Step 2: Remove New Files
```bash
# Remove all new files if necessary:
rm -rf src/modules/test/
rm -rf frontend/src/app/dashboard/testing/
rm -rf frontend/src/components/testing/
rm -rf frontend/src/hooks/useWhatsAppTesting.ts
```

#### Step 3: Rebuild and Deploy
```bash
# If using local development:
npm run build
npm run start:prod

# Railway will auto-deploy on git push
```

### Emergency Rollback (2 minutes)

#### Step 1: Git Revert
```bash
# Identify the commit hash before changes
git log --oneline -5

# Revert to previous working state
git revert <commit-hash> --no-edit
git push origin main
```

#### Step 2: Environment Variables
```bash
# Remove all test-related variables in Railway dashboard
# Railway will redeploy automatically
```

## Verification Steps

### Post-Rollback Checklist

#### System Health
- [ ] `/api/health` returns 200 OK
- [ ] `/api/test-whatsapp` returns connection status
- [ ] `/api/test-llm` returns AI status
- [ ] Dashboard loads without errors

#### Core Functionality
- [ ] User login/logout works
- [ ] Conversation list loads
- [ ] Message history displays correctly
- [ ] AI responses generate normally
- [ ] Webhook processing continues working

#### Performance Metrics
- [ ] Response times back to baseline
- [ ] Memory usage normal
- [ ] CPU usage normal
- [ ] Error rates back to baseline

## File-by-File Rollback

### Configuration Files
```bash
# src/config/whatsapp.config.ts
git checkout HEAD~1 -- src/config/whatsapp.config.ts
```

### Backend Files
```bash
# Remove test module entirely
rm -rf src/modules/test/

# Revert app module if modified
git checkout HEAD~1 -- src/app.module.ts
```

### Frontend Files
```bash
# Remove test pages
rm -rf frontend/src/app/dashboard/testing/

# Remove test components
rm -rf frontend/src/components/testing/

# Remove test hooks
rm frontend/src/hooks/useWhatsAppTesting.ts

# Revert layout if modified
git checkout HEAD~1 -- frontend/src/app/dashboard/layout.tsx

# Revert API client if modified
git checkout HEAD~1 -- frontend/src/lib/api.ts
```

## Database Safety

### No Database Changes
- ✅ No schema modifications planned
- ✅ All test data uses existing tables
- ✅ No data migration required
- ✅ No risk of data loss

### Test Data Cleanup
```sql
-- If test conversations need cleanup:
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE customer_phone = '+15556485637'
);

DELETE FROM conversations WHERE customer_phone = '+15556485637';
```

## Communication Plan

### Internal Team
1. Immediate notification of rollback decision
2. Clear explanation of issue causing rollback
3. ETA for issue resolution
4. Status updates every 30 minutes during rollback

### Users (if necessary)
1. Brief maintenance notification
2. Clear timeline for service restoration
3. Apology for any inconvenience
4. Confirmation when service fully restored

## Prevention Measures

### Pre-Implementation
- [ ] Comprehensive testing in development
- [ ] Code review by senior developer
- [ ] Security review completed
- [ ] Performance impact assessment

### During Implementation
- [ ] Deploy during low-traffic hours
- [ ] Monitor key metrics continuously
- [ ] Have rollback team on standby
- [ ] Test each phase before proceeding

### Post-Implementation
- [ ] 24-hour monitoring period
- [ ] Performance metrics tracking
- [ ] User feedback collection
- [ ] Documentation updates

## Success Metrics

### Rollback Success Indicators
- All existing functionality restored ✅
- Performance metrics back to baseline ✅
- No error rates increase ✅
- User experience unaffected ✅
- Zero data loss ✅

### Time Targets
- Quick rollback: < 5 minutes
- Full rollback: < 15 minutes  
- Emergency rollback: < 2 minutes
- Complete verification: < 30 minutes

## Contact Information

### Primary Contacts
- Technical Lead: Immediate notification required
- DevOps Team: For Railway/infrastructure issues
- Product Owner: For user communication decisions

### Escalation Path
1. Development Team (0-15 minutes)
2. Technical Lead (15-30 minutes)
3. Engineering Manager (30+ minutes)

## Lessons Learned Template

### Post-Rollback Analysis
- Root cause of issue requiring rollback
- Warning signs that were missed
- Effectiveness of rollback procedures
- Areas for improvement
- Process updates needed

### Documentation Updates
- Update rollback procedures based on experience
- Improve monitoring and alerting
- Enhance testing procedures
- Update communication templates