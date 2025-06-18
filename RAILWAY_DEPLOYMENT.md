# Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### 1. Environment Variables Required

Set these environment variables in your Railway project:

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Application
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# WhatsApp Business API (Meta)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret

# Optional
CORS_ORIGINS=https://your-frontend-domain.com
```

### 2. Railway Project Setup

1. **Create new Railway project**:
   ```bash
   railway login
   railway init
   railway add postgresql
   ```

2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Railway will auto-detect the Dockerfile
   - Environment variables will be automatically set

3. **Manual deployment**:
   ```bash
   railway up
   ```

### 3. Database Migration

Railway will automatically run migrations on deployment via the `postinstall` script:

```bash
npm run postinstall  # Generates Prisma client
npm run db:migrate   # Runs database migrations
```

### 4. Health Check

Railway will monitor your app via the `/health` endpoint:

```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "WhatsApp AI Railway Template",
  "version": "3.0.0"
}
```

## 🔧 Railway-Specific Configurations

### Dockerfile Optimizations

- **Multi-stage build** for smaller image size
- **OpenSSL libraries** included for Prisma compatibility
- **Non-root user** for security
- **Health check** built-in

### Environment Detection

The app automatically detects Railway environment:
- Binds to `0.0.0.0` in production
- Uses Railway's `PORT` environment variable
- Optimized logging for Railway

### Database Configuration

- **PostgreSQL** provider for production
- **Connection pooling** optimized for Railway
- **Automatic migrations** on deployment

## 🔐 WhatsApp Business API Setup

### 1. Meta Developer Console

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Business → WhatsApp Business
3. Get your access token and phone number ID

### 2. Webhook Configuration

Set your Railway webhook URL in Meta console:
```
https://your-app.railway.app/api/webhook/whatsapp
```

### 3. Webhook Verification

Meta will send a verification request to:
```
GET https://your-app.railway.app/api/webhook/whatsapp?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=YOUR_VERIFY_TOKEN
```

## 📊 Monitoring & Logs

### Railway Logs

View logs in Railway dashboard or CLI:
```bash
railway logs
```

### Health Monitoring

Railway automatically monitors:
- Health check endpoint: `/health`
- Response time and uptime
- Automatic restarts on failure

### Performance Metrics

Monitor in Railway dashboard:
- CPU usage
- Memory consumption
- Request rate
- Error rate

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check `DATABASE_URL` environment variable
   - Ensure PostgreSQL service is running

2. **Port binding issues**:
   - Railway sets `PORT` environment variable
   - App binds to `0.0.0.0` in production

3. **Prisma client errors**:
   - Ensure `postinstall` script runs
   - Check OpenSSL libraries in Dockerfile

4. **Webhook verification failures**:
   - Verify `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
   - Check webhook URL in Meta console

### Debug Commands

```bash
# Railway CLI
railway logs --tail
railway shell
railway status

# Inside Railway shell
npm run db:migrate
npx prisma db push
curl localhost:$PORT/health
```

## 🚀 Production Checklist

- [ ] Environment variables set
- [ ] PostgreSQL database connected
- [ ] Dockerfile optimized
- [ ] Health check responding
- [ ] WhatsApp webhook verified
- [ ] OpenRouter API key valid
- [ ] Domain configured (optional)
- [ ] SSL certificate (automatic)
- [ ] Monitoring enabled
- [ ] Logs accessible

## 🔄 Continuous Deployment

Railway automatically deploys on:
- GitHub pushes to main branch
- Environment variable changes
- Manual deployments

Build process:
1. `npm install` (installs dependencies)
2. `npm run postinstall` (generates Prisma client)
3. `npm run build` (builds TypeScript)
4. `npm run start:prod` (starts production server)

## 📝 Environment Variables Template

Copy this to your Railway environment variables:

```bash
# Required
DATABASE_URL=postgresql://
NODE_ENV=production
JWT_SECRET=
OPENROUTER_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_WEBHOOK_SECRET=

# Optional
PORT=3000
CORS_ORIGINS=*
JWT_EXPIRES_IN=7d
OPENROUTER_PRIMARY_MODEL=anthropic/claude-3-haiku
OPENROUTER_FALLBACK_MODEL=openai/gpt-3.5-turbo
OPENROUTER_MAX_TOKENS=500
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```