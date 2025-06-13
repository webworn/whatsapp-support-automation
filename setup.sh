#!/bin/bash

echo "🚀 WhatsApp Support Automation - Quick Setup"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "1️⃣ Starting database services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for databases to be ready..."
sleep 10

echo "2️⃣ Installing dependencies..."
npm install

echo "3️⃣ Generating Prisma client..."
npx prisma generate

echo "4️⃣ Running database migrations..."
npx prisma migrate dev --name init

echo "5️⃣ Testing database connection..."
npx prisma db push

echo "✅ Setup complete! Next steps:"
echo ""
echo "📝 Edit your .env file:"
echo "   - Add your OpenRouter API key: OPENROUTER_API_KEY=sk-or-v1-xxxxx"
echo ""
echo "🚀 Start the application:"
echo "   npm run start:dev"
echo ""
echo "🔗 Test endpoints:"
echo "   http://localhost:3000/api/v1/health"
echo "   http://localhost:3000/docs (Swagger UI)"
echo ""
echo "🎯 Optional database GUIs:"
echo "   docker-compose --profile tools up -d  # Start PgAdmin + Redis Commander"
echo "   PgAdmin: http://localhost:8080 (admin@whatsapp.local / admin123)"
echo "   Redis GUI: http://localhost:8081"