# Railway Private Networking Configuration

## 🔒 Private Networking Setup

This configuration eliminates Railway egress fees by using private endpoints for database connections.

## ✅ Changes Made

### 1. **Railway Configuration Files**

Updated `railway.toml` and `railway.json` to:
- Enable `privateNetworking: true`
- Use `DATABASE_PRIVATE_URL` instead of `DATABASE_URL`
- Remove Redis service (not used in application)

### 2. **Database Configuration**

**File: `src/config/database.config.ts`**
```typescript
// Use private database URL if available to avoid egress fees
const databaseUrl = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;
```

**File: `src/shared/database/prisma.service.ts`**
```typescript
// Use private database URL if available to avoid egress fees
const databaseUrl = configService.get<string>('DATABASE_PRIVATE_URL') || 
                   configService.get<string>('DATABASE_URL');
```

### 3. **Service Architecture**

**PostgreSQL Only**: Application uses PostgreSQL for all data storage (conversations, users, documents, sessions). Redis was removed as it was not being used in the codebase.

## 🚀 Railway Environment Variables

Railway will automatically provide these private URLs:

```env
# Automatically provided by Railway
DATABASE_PRIVATE_URL=${{Postgres.DATABASE_PRIVATE_URL}}

# Fallback to public URL if private not available
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## 💰 Cost Savings

**Before**: Public endpoint connections + unused Redis service incur costs
**After**: Private networking + PostgreSQL-only eliminates egress fees and Redis costs

## 🔧 Deployment Notes

1. **Automatic Configuration**: Railway will automatically configure private URLs
2. **Fallback Support**: Code falls back to public URLs if private URLs unavailable
3. **Zero Downtime**: Changes are backward compatible
4. **Production Ready**: Configuration optimized for cost and performance

## 🛠️ Testing

```bash
# Check which database URL is being used (credentials masked)
curl https://your-app.railway.app/health
# Look for log: "Using database URL: postgresql://***:***@..."
```

## 📋 Benefits

- ✅ **Cost Reduction**: No egress fees for database connections + Redis service removed
- ✅ **Better Performance**: Private network is faster than public routing  
- ✅ **Enhanced Security**: Internal traffic stays within Railway's private network
- ✅ **Simplified Architecture**: PostgreSQL-only design reduces complexity
- ✅ **Automatic Failover**: Falls back to public URLs if needed

## 🔍 Verification

After deployment, check application logs for:
```
[PrismaService] Using database URL: postgresql://***:***@private-host:5432/...
[Bootstrap] 🔒 Private URL: https://your-private-domain (internal services)
```

This confirms private networking is active, egress fees are eliminated, and Redis costs are removed.