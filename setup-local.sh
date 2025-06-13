#!/bin/bash

echo "🚀 WhatsApp Support Automation - Local Setup (No Docker)"
echo "========================================================"

echo "1️⃣ Installing dependencies..."
npm install

echo "2️⃣ Adding missing dependencies..."
npm install @nestjs/swagger @nestjs/axios swagger-ui-express

echo "3️⃣ Generating Prisma client..."
npx prisma generate

echo "4️⃣ Setting up SQLite database (for testing)..."
# Update .env to use SQLite instead of PostgreSQL
sed -i 's|postgresql://.*|file:./dev.db|' .env

echo "5️⃣ Running database migrations..."
npx prisma migrate dev --name init

echo "6️⃣ Creating initial data..."
npx prisma db push

echo "✅ Local setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get your OpenRouter API key from https://openrouter.ai/"
echo "2. Edit .env file and update: OPENROUTER_API_KEY=your-key-here"
echo "3. Start the app: npm run start:dev"
echo "4. Test it: ./test-api.sh"
echo ""
echo "📊 Your database file: ./prisma/dev.db"
echo "🔗 App will run at: http://localhost:3000"