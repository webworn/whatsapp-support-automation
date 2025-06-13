# WhatsApp Support Automation - Claude Context

## Project Overview

**Enterprise-grade WhatsApp customer support automation system** built with Node.js/TypeScript, designed to handle 1,000+ concurrent users with real-time AI-powered conversations.

### Technology Stack
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL (conversations) + Redis (sessions/cache)
- **Queue**: Bull Queue (webhook processing)
- **AI/LLM**: OpenRouter API (with fallback models)
- **WhatsApp**: MSG91 Business API
- **Monitoring**: Winston logging + Prometheus metrics

### Architecture Pattern
- **Event-driven microservices** with dependency injection
- **Multi-tier caching** (Redis + in-memory)
- **Circuit breaker pattern** for external API resilience
- **Async webhook processing** with retry mechanisms

---

## Common Bash Commands

### Development Commands
```bash
# Start development server
npm run start:dev

# Run tests
npm run test        # Unit tests
npm run test:e2e    # Integration tests
npm run test:cov    # Coverage report

# Database operations
npm run db:migrate  # Run migrations
npm run db:seed     # Seed test data
npm run db:reset    # Reset database

# Code quality
npm run lint        # ESLint
npm run format      # Prettier
npm run type-check  # TypeScript check

# Production build
npm run build
npm run start:prod
```

### Database Commands
```bash
# PostgreSQL
psql -U postgres -d whatsapp_support
\dt                 # List tables
\d+ conversations   # Describe table

# Redis
redis-cli
KEYS session:*      # List sessions
FLUSHALL           # Clear all keys (dev only)
```

### Docker Commands
```bash
# Development environment
docker-compose up -d postgres redis
docker-compose logs -f

# Production build
docker build -t whatsapp-support .
docker run -p 3000:3000 whatsapp-support
```

---

## Core Files and Utility Functions

### Project Structure
```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/
│   ├── database.config.ts  # DB configuration
│   ├── redis.config.ts     # Redis configuration
│   └── environment.ts      # Environment variables
├── modules/
│   ├── webhook/            # WhatsApp webhook handling
│   ├── conversation/       # Conversation management
│   ├── llm/               # LLM integration
│   ├── delivery/          # Message delivery
│   └── flow/              # Conversation flows
├── shared/
│   ├── database/          # Database entities & repositories
│   ├── redis/             # Redis services
│   ├── queue/             # Bull queue configuration
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Request/response interceptors
│   └── utils/             # Utility functions
└── tests/
    ├── unit/              # Unit tests
    ├── integration/       # Integration tests
    └── e2e/               # End-to-end tests
```

### Key Utility Functions
```typescript
// src/shared/utils/phone.util.ts
export const normalizePhoneNumber = (phone: string): string

// src/shared/utils/validation.util.ts
export const validateWebhookSignature = (payload: string, signature: string): boolean

// src/shared/utils/retry.util.ts
export const retryWithBackoff = <T>(fn: () => Promise<T>, attempts: number): Promise<T>

// src/shared/utils/logger.util.ts
export const createLogger = (context: string): Logger
```

### Core Services
- **SessionService**: Redis-backed session management
- **LLMService**: OpenRouter integration with fallbacks
- **DeliveryService**: MSG91 WhatsApp API wrapper
- **FlowService**: YAML-based conversation flows
- **MetricsService**: Prometheus metrics collection

---

## Code Style Guidelines

### TypeScript Standards
```typescript
// Use strict typing
interface ConversationRequest {
  phoneNumber: string;
  message: string;
  timestamp: Date;
}

// Prefer async/await over promises
async function processMessage(request: ConversationRequest): Promise<void> {
  try {
    const session = await sessionService.getSession(request.phoneNumber);
    // ... implementation
  } catch (error) {
    logger.error('Failed to process message', { error, phoneNumber: request.phoneNumber });
    throw error;
  }
}

// Use descriptive error classes
class LLMServiceError extends Error {
  constructor(
    message: string,
    public readonly model: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'LLMServiceError';
  }
}
```

### NestJS Patterns
```typescript
// Controllers: Handle HTTP requests only
@Controller('webhook')
export class WebhookController {
  @Post('whatsapp')
  async handleWhatsAppWebhook(@Body() payload: WebhookPayload): Promise<void> {
    await this.webhookService.processWebhook(payload);
  }
}

// Services: Business logic
@Injectable()
export class ConversationService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly llmService: LLMService,
  ) {}
}

// Use dependency injection
@Injectable()
export class LLMService {
  constructor(
    @Inject(OPENROUTER_CONFIG) private readonly config: OpenRouterConfig,
  ) {}
}
```

### Error Handling
```typescript
// Use custom exception filters
@Catch(LLMServiceError)
export class LLMExceptionFilter implements ExceptionFilter {
  catch(exception: LLMServiceError, host: ArgumentsHost) {
    // Handle LLM-specific errors
  }
}

// Structured logging
logger.error('LLM request failed', {
  phoneNumber: session.phoneNumber,
  model: 'gpt-4',
  error: error.message,
  requestId: context.requestId,
});
```

---

## Testing Instructions

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test -- conversation.service.spec.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

### Integration Tests
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:e2e

# Test specific module
npm run test:e2e -- --testNamePattern="ConversationModule"
```

### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run tests/load/webhook-load-test.js

# Test 1000 concurrent users
k6 run --vus 1000 --duration 30s tests/load/conversation-load-test.js
```

### Test Data
```typescript
// Use factories for test data
const mockConversation = ConversationFactory.build({
  phoneNumber: '+1234567890',
  status: ConversationStatus.ACTIVE,
});

// Clean up after tests
afterEach(async () => {
  await testingModule.get(DatabaseService).clearTestData();
  await testingModule.get(RedisService).flushAll();
});
```

---

## Repository Etiquette

### Branch Naming
```bash
# Feature branches
feature/conversation-flow-engine
feature/llm-fallback-mechanism

# Bug fixes
fix/webhook-signature-validation
fix/redis-connection-timeout

# Hotfixes
hotfix/message-delivery-failure
hotfix/security-vulnerability

# Releases
release/v1.2.0
```

### Commit Messages
```bash
# Format: <type>(<scope>): <description>
feat(llm): add OpenRouter integration with fallback models
fix(webhook): validate MSG91 signature correctly
docs(api): update webhook endpoint documentation
test(conversation): add unit tests for flow engine
refactor(database): optimize conversation queries
perf(redis): implement connection pooling
```

### Pull Request Process
1. **Create feature branch** from `develop`
2. **Run full test suite** (`npm run test:all`)
3. **Update documentation** if needed
4. **Create PR** with detailed description
5. **Require 2 approvals** for main branch
6. **Squash merge** to keep history clean

### Code Review Checklist
- [ ] All tests passing
- [ ] Code coverage > 90%
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Logging added for debugging

---

## Developer Environment Setup

### Prerequisites
```bash
# Node.js version management
nvm install 18.17.0
nvm use 18.17.0

# Package manager
npm install -g pnpm@8.6.12

# Global tools
npm install -g @nestjs/cli@10.1.0
npm install -g prisma@5.1.0
```

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd whatsapp-development

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Start dependencies
docker-compose up -d postgres redis

# Run database migrations
pnpm run db:migrate

# Start development server
pnpm run start:dev
```

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whatsapp_support
REDIS_URL=redis://localhost:6379

# WhatsApp (MSG91)
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_WEBHOOK_SECRET=your-webhook-secret
MSG91_SENDER_ID=your-sender-id

# LLM (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_PRIMARY_MODEL=anthropic/claude-3-sonnet
OPENROUTER_FALLBACK_MODEL=openai/gpt-3.5-turbo

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
```

### IDE Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

---

## Unexpected Behaviors and Warnings

### MSG91 API Limitations
```typescript
// MSG91 rate limits: 100 requests/minute
// Implement exponential backoff
const delay = Math.pow(2, attempt) * 1000;
await new Promise(resolve => setTimeout(resolve, delay));

// WhatsApp template messages required for first contact
// Plain text only allowed after user initiates conversation
```

### Redis Session Management
```typescript
// Redis keys expire after 1 hour of inactivity
// Always check if session exists before accessing
const session = await redis.get(`session:${phoneNumber}`);
if (!session) {
  // Create new session
  await this.createNewSession(phoneNumber);
}
```

### OpenRouter API Quirks
```typescript
// Different models have different response formats
// Always validate response structure
const response = await openrouter.chat.completions.create(payload);
if (!response.choices?.[0]?.message?.content) {
  throw new LLMServiceError('Invalid response format');
}

// Some models don't support system messages
// Fallback to user message with context
```

### Database Connection Pooling
```typescript
// PostgreSQL connection limit: 100 concurrent connections
// Configure connection pool appropriately
const config = {
  max: 20,        // Maximum connections
  min: 5,         // Minimum connections
  idle: 10000,    // Close connections after 10s idle
  acquire: 60000, // Maximum time to acquire connection
};
```

### Performance Considerations
```typescript
// Webhook processing must complete within 5 seconds
// Use Bull Queue for async processing
@Process('webhook')
async processWebhook(job: Job<WebhookPayload>) {
  // Process webhook asynchronously
  // MSG91 will retry if no 200 response within 5s
}

// LLM responses can take 2-10 seconds
// Always set appropriate timeouts
const timeout = 30000; // 30 seconds
```

### Security Warnings
```typescript
// Always validate webhook signatures
const isValid = validateSignature(payload, signature);
if (!isValid) {
  throw new UnauthorizedException('Invalid webhook signature');
}

// Sanitize phone numbers to prevent injection
const phoneNumber = payload.from.replace(/[^\d+]/g, '');

// Rate limit by phone number to prevent abuse
@Throttle(10, 60) // 10 requests per minute per phone number
```

---

## Deployment Notes

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cluster configured
- [ ] SSL certificates installed
- [ ] Health checks configured
- [ ] Monitoring dashboards created
- [ ] Backup strategy implemented
- [ ] Scaling policies defined

### Docker Production Build
```dockerfile
# Multi-stage build for smaller image
FROM node:18-alpine AS builder
# ... build stage

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs
```

### Health Check Endpoints
```typescript
// Health check should verify all dependencies
@Get('health')
async healthCheck(): Promise<HealthCheckResult> {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.pingCheck('redis'),
    () => this.msg91.pingCheck('msg91'),
  ]);
}
```

---

## Rate Limit Recovery & Progress Tracking

### 🚨 **Token Limit Handling**
If an agent hits token limits during development, follow these steps:

1. **Read Progress Log**: Check `PROGRESS_LOG.md` for current status
2. **Read Resume Guide**: Follow `RESUME_GUIDE.md` for continuation instructions
3. **Validate Environment**: Ensure all services are running
4. **Check Git Status**: Review committed work and current state
5. **Continue Implementation**: Pick up from the documented next phase

### 📊 **Progress Tracking Files**
- **`PROGRESS_LOG.md`**: Detailed progress with phase completion status
- **`RESUME_GUIDE.md`**: Quick-start instructions for new agents
- **`CLAUDE.md`**: This file - comprehensive project context
- **Git History**: All work is committed with descriptive messages

### 🔄 **Agent Handoff Protocol**
When an agent change occurs:

```bash
# New agent startup sequence
git log --oneline -5          # Review recent commits
cat PROGRESS_LOG.md           # Check current phase
cat RESUME_GUIDE.md           # Get immediate next steps
npm run start:dev             # Validate current setup
curl http://localhost:3000/api/v1/health  # Test services
```

### 📋 **Phase Tracking**
Each implementation phase is:
- ✅ **Documented** in PROGRESS_LOG.md
- 🎯 **Committed** to git with descriptive messages
- 📝 **Tested** with validation steps
- 🔄 **Resumable** from any point

---

## Support and Troubleshooting

### Common Issues
1. **Database connection timeout** → Check connection pool settings
2. **Redis connection refused** → Verify Redis server is running
3. **MSG91 webhook verification failed** → Check webhook secret
4. **LLM timeout errors** → Increase timeout or implement fallback
5. **High memory usage** → Review session cleanup logic
6. **Agent continuation** → Check PROGRESS_LOG.md and RESUME_GUIDE.md

### Debugging Commands
```bash
# Check application logs
docker-compose logs -f app

# Monitor Redis
redis-cli monitor

# Database queries
npx prisma studio

# Performance profiling
npm run start:dev -- --inspect

# Progress tracking
cat PROGRESS_LOG.md | head -20
git log --oneline -10
```

### Recovery Commands
```bash
# If agent hits token limits
cat RESUME_GUIDE.md           # Quick start instructions
cat PROGRESS_LOG.md           # Detailed progress status
git status                    # Check current state
npm run start:dev             # Validate setup
```

### Contact Information
- **Project Lead**: [Your Name]
- **DevOps**: [DevOps Team]
- **On-call**: [On-call Rotation]
- **Documentation**: [Wiki/Confluence Link]
- **Progress Tracking**: PROGRESS_LOG.md + RESUME_GUIDE.md