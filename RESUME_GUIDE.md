# Agent Resume Guide - WhatsApp AI Customer Support

## Quick Start Instructions for New Agents

> **Project Status**: ✅ PRODUCTION READY - ALL SYSTEMS OPERATIONAL  
> **System URL**: https://whatsapp-support-automation-production.up.railway.app/  
> **Login**: test@example.com / testpass123  
> **Last Update**: 2025-06-22

---

## 🚀 Immediate Status Check

### 1. Validate Current State (30 seconds)
```bash
# Check git status for any pending changes
git status

# Review recent commits to understand latest work
git log --oneline -5

# Check if system is running locally
curl http://localhost:3000/health
```

### 2. Review Documentation (2 minutes)
```bash
# Read current progress - CRITICAL for context
head -50 PROGRESS_LOG.md

# Check project instructions
head -20 CLAUDE.md

# Review user flow architecture if needed
head -30 strategic-planning/USER-FLOW-ARCHITECTURE.md
```

---

## 🎯 Current Phase: PRODUCTION MAINTENANCE

### System is 100% Operational
- ✅ **Backend**: NestJS + TypeScript fully deployed
- ✅ **Database**: PostgreSQL with all migrations
- ✅ **AI Integration**: OpenRouter + Claude Haiku active
- ✅ **WhatsApp API**: Business API webhooks operational
- ✅ **Frontend**: Landing page deployed and serving
- ✅ **Authentication**: JWT system with session management

### What's Working Right Now ✅
- **Landing page**: https://whatsapp-support-automation-production.up.railway.app/
- **Login/Dashboard**: Fully functional authentication and dashboard
- **Health check**: https://whatsapp-support-automation-production.up.railway.app/health
- **API endpoints**: All /api/* routes operational with security
- **Database**: PostgreSQL with full schema and optimized queries
- **Frontend**: Next.js with Tailwind CSS, responsive design
- **AI responses**: Claude Haiku integration active with fallbacks
- **Security**: JWT authentication, secure cookies, input validation

---

## 🔄 Common Agent Continuation Scenarios

### Scenario A: User Requests New Feature
**Steps to Take**:
1. Read `PROGRESS_LOG.md` to understand current architecture
2. Check existing modules in `src/modules/` for similar patterns
3. Follow NestJS conventions already established
4. Use existing services (PrismaService, LlmService, etc.)
5. Add comprehensive error handling and logging
6. Test locally before suggesting deployment

### Scenario B: Bug Reports or Issues
**Steps to Take**:
1. Check health endpoints: `/health`, `/db-test`, `/test-llm`, `/test-whatsapp`
2. Review Railway logs for production issues
3. Test locally with `npm run start:dev`
4. Check database schema with `/db-schema` endpoint
5. Validate environment variables are set

### Scenario C: Frontend/UI Changes
**Steps to Take**:
1. Understand current routing in `src/frontend.controller.ts`
2. Review Next.js setup in `frontend/` directory
3. Test changes don't break existing landing page
4. Ensure mobile responsiveness maintained
5. Check Docker build process works

### Scenario D: Database/Schema Changes
**Steps to Take**:
1. Review current schema in `prisma/schema.prisma`
2. Use `npx prisma db push` for development
3. Test with `/db-test` and `/db-schema` endpoints
4. Ensure all relationships and indexes maintained
5. Update related service files

---

## 🛠️ Essential Commands

### Development Setup (if needed)
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Database operations
npx prisma db push
npx prisma generate
npx prisma studio  # Database GUI

# Run tests
npm run test
npm run test:e2e
```

### Production Deployment (Railway)
```bash
# Git workflow
git add .
git commit -m "feat: [description]"
git push origin main  # Auto-deploys to Railway

# Check deployment
curl https://whatsapp-support-automation-production.up.railway.app/health
```

### Debug Commands
```bash
# Local health check
curl http://localhost:3000/health

# Database test
curl http://localhost:3000/db-test

# AI integration test
curl http://localhost:3000/test-llm

# WhatsApp API test
curl http://localhost:3000/test-whatsapp
```

---

## 📁 Key File Locations

### Critical Files to Understand
- `PROGRESS_LOG.md` - **READ FIRST** - Complete project history
- `CLAUDE.md` - Project instructions and guidelines
- `src/main.ts` - Application entry point
- `src/app.module.ts` - Main module configuration
- `src/frontend.controller.ts` - Landing page serving
- `prisma/schema.prisma` - Database schema

### Module Structure
```
src/modules/
├── auth/          # JWT authentication + user management
├── conversation/  # WhatsApp conversation handling  
├── webhook/       # WhatsApp webhook processing
├── llm/           # OpenRouter AI integration
├── whatsapp/      # WhatsApp Business API client
└── document/      # Knowledge base management
```

### Frontend Structure
```
frontend/
├── src/app/       # Next.js 15 app directory
├── public/        # Static assets
└── next.config.ts # Build configuration
```

---

## ⚠️ Critical Notes for New Agents

### DO NOT Break These Things
1. **Authentication System** - JWT + session management is complex, test thoroughly
2. **Database Schema** - 5 entities with relationships, changes affect everything
3. **Controller Routing** - FrontendController must be before AppController
4. **Docker Build** - Multi-stage build is finely tuned, test before changes
5. **Environment Variables** - Never commit secrets, use Railway environment

### Production Safety Checklist
- [ ] Test health endpoints locally before deploying
- [ ] Validate Docker build completes successfully  
- [ ] Check all environment variables are set
- [ ] Ensure no secrets in code
- [ ] Test authentication flow works (login/logout/dashboard access)
- [ ] Verify database migrations apply correctly
- [ ] Test frontend styling loads properly in production
- [ ] Validate API response parsing matches frontend expectations

### Common Pitfalls to Avoid
1. **Controller Conflicts** - Don't add routes that conflict with existing ones
2. **Database Changes** - Always test schema changes thoroughly
3. **Environment Variables** - Missing vars cause production failures
4. **Docker Build Context** - Frontend COPY paths are specific
5. **Authentication Loops** - Avoid calling fetchUser() unnecessarily
6. **API Response Parsing** - Backend wraps responses in { success, data } structure

### Recent Fixes Applied (2025-06-22) ✅
- **Login Loop**: Fixed redirect loops between login and dashboard
- **API Parsing**: Corrected response.data.data vs response.data issues  
- **Static Files**: Fixed CSS/JS loading in production
- **Security**: Enhanced JWT management and form validation
- **Auth State**: Improved Zustand store synchronization with cookies

---

## 🔧 Troubleshooting Quick Reference

### Issue: "System not responding"
```bash
# Check Railway deployment status
# Check health endpoint: /health
# Review Railway logs
# Test locally: npm run start:dev
```

### Issue: "Database errors"
```bash
# Test connection: curl /db-test
# Check schema: curl /db-schema  
# Verify DATABASE_URL in Railway
# Run: npx prisma db push
```

### Issue: "AI not working"
```bash
# Test: curl /test-llm
# Check OPENROUTER_API_KEY in Railway
# Verify model configuration
# Check OpenRouter account credits
```

### Issue: "WhatsApp webhook failing"
```bash
# Test: curl /test-whatsapp
# Verify WHATSAPP_* environment variables
# Check webhook URL in Meta developer console
# Validate webhook signature
```

### Issue: "Frontend not loading"
```bash
# Check FrontendController in src/frontend.controller.ts
# Verify Docker build completed
# Test locally: http://localhost:3000
# Check controller order in app.module.ts
```

---

## 📋 Quick Development Patterns

### Adding New API Endpoint
```typescript
// Follow existing pattern in modules/
@Controller('api/feature')
export class FeatureController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeature(@CurrentUser() user: User) {
    // Implementation
  }
}
```

### Database Query Pattern
```typescript
// Use existing PrismaService
constructor(private prisma: PrismaService) {}

async findSomething(id: string) {
  return this.prisma.tableName.findUnique({
    where: { id },
    include: { relationships: true }
  });
}
```

### Error Handling Pattern
```typescript
try {
  const result = await this.service.action();
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'ACTION_FAILED'
    }
  };
}
```

---

## 💡 Success Tips for New Agents

1. **Always Read PROGRESS_LOG.md First** - Contains complete project context
2. **Test Locally Before Deploying** - Use npm run start:dev
3. **Follow Existing Patterns** - Don't reinvent, extend existing code
4. **Use Health Endpoints** - Validate services before making changes
5. **Check Recent Commits** - Understand what previous agents implemented
6. **Validate Environment** - Ensure all required env vars are set
7. **Test End-to-End** - From landing page through AI responses

---

## 🚨 Emergency Recovery

### If System is Down
1. Check Railway deployment status
2. Review recent commits with `git log`
3. Rollback if needed: `git revert HEAD`
4. Check all environment variables in Railway
5. Test health endpoints step by step

### If Database is Corrupted
1. Check `/db-test` endpoint
2. Run `npx prisma db push` to restore schema
3. Validate with `/db-schema` endpoint
4. Test user creation flow

### If AI is Not Working
1. Verify OpenRouter API key and credits
2. Test fallback model configuration
3. Check rate limiting and quotas
4. Review error logs in `/test-llm`

---

## 📞 Support Resources

### 🚀 Production URLs (Railway)
- **Health Check**: https://whatsapp-support-automation-production.up.railway.app/health
- **Landing Page**: https://whatsapp-support-automation-production.up.railway.app/
- **Login**: https://whatsapp-support-automation-production.up.railway.app/login
- **Dashboard**: https://whatsapp-support-automation-production.up.railway.app/dashboard
- **Debug Endpoints**:
  - Database Test: https://whatsapp-support-automation-production.up.railway.app/db-test
  - LLM Test: https://whatsapp-support-automation-production.up.railway.app/test-llm
  - WhatsApp Test: https://whatsapp-support-automation-production.up.railway.app/test-whatsapp

### 💻 Local Development URLs
- **Health Check**: http://localhost:3000/health
- **Landing Page**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Debug Endpoints**:
  - Database Test: http://localhost:3000/db-test
  - LLM Test: http://localhost:3000/test-llm
  - WhatsApp Test: http://localhost:3000/test-whatsapp

### 📚 Documentation
- **Railway Dashboard**: Check deployment logs and environment variables
- **Project Documentation**: PROGRESS_LOG.md (comprehensive), CLAUDE.md (instructions)
- **User Flow**: strategic-planning/USER-FLOW-ARCHITECTURE.md

---

**Remember**: This is a production system serving real users. Always test changes thoroughly and follow the established patterns. The system is robust and well-documented - use the existing architecture as your guide.