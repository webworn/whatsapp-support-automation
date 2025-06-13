#!/bin/bash

echo "🚀 WhatsApp Support Automation - Minimal Setup"
echo "=============================================="

echo "1️⃣ Installing all dependencies..."
npm install
npm install @nestjs/swagger @nestjs/axios swagger-ui-express

echo "2️⃣ Generating Prisma client..."
npx prisma generate

echo "3️⃣ Setting up in-memory database..."
# Update .env for minimal setup
cat > .env << 'EOF'
# Minimal Configuration - In-Memory Setup
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=3000
JWT_SECRET=whatsapp-dev-secret-key-2024
API_VERSION=v1

# OpenRouter LLM Configuration (ADD YOUR KEY HERE)
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_PRIMARY_MODEL=anthropic/claude-3-haiku
OPENROUTER_FALLBACK_MODEL=openai/gpt-3.5-turbo
OPENROUTER_MAX_TOKENS=500
OPENROUTER_TIMEOUT=30000

# Placeholder values (not needed for core testing)
MSG91_AUTH_KEY=placeholder
MSG91_WEBHOOK_SECRET=placeholder
MSG91_SENDER_ID=placeholder

# Development settings
DEBUG=true
ENABLE_SWAGGER=true
LOG_LEVEL=debug
DEFAULT_COUNTRY_CODE=1
CORS_ORIGINS=*
EOF

echo "4️⃣ Initializing database..."
npx prisma migrate dev --name init

echo "✅ Minimal setup complete!"
echo ""
echo "🔑 REQUIRED: Get your OpenRouter API key"
echo "   1. Go to: https://openrouter.ai/"
echo "   2. Sign up (free tier available)"
echo "   3. Get your API key (starts with sk-or-v1-)"
echo "   4. Edit .env and replace: OPENROUTER_API_KEY=your-actual-key"
echo ""
echo "🚀 Then start the app:"
echo "   npm run start:dev"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:3000/api/v1/health"