
#!/bin/bash

echo "🔑 OpenRouter API Key Setup"
echo "=========================="

# Check if API key is provided as argument
if [ -z "$1" ]; then
    echo "❌ Please provide your OpenRouter API key as an argument"
    echo ""
    echo "Usage: ./update-api-key.sh sk-or-v1-your-api-key-here"
    echo ""
    echo "📝 Steps to get your API key:"
    echo "1. Visit: https://openrouter.ai/"
    echo "2. Sign up/login"
    echo "3. Go to: https://openrouter.ai/keys"
    echo "4. Create a new key"
    echo "5. Copy the key and run: ./update-api-key.sh YOUR_KEY"
    exit 1
fi

API_KEY="$1"

# Validate API key format
if [[ ! "$API_KEY" =~ ^sk-or-v1- ]]; then
    echo "❌ Invalid API key format. OpenRouter keys start with 'sk-or-v1-'"
    exit 1
fi

echo "✅ Valid API key format detected"

# Update .env file
echo "📝 Updating .env file..."
sed -i "s/OPENROUTER_API_KEY=.*/OPENROUTER_API_KEY=$API_KEY/" .env

echo "✅ API key updated in .env file"

# Restart the test server
echo "🔄 Restarting test server..."
pkill -f "node test-simple.js" 2>/dev/null
sleep 1
nohup node test-simple.js > server.log 2>&1 &
SERVER_PID=$!

echo "✅ Server restarted (PID: $SERVER_PID)"
echo "⏳ Waiting for server to start..."
sleep 3

# Test the API
echo "🧪 Testing OpenRouter integration..."
RESPONSE=$(curl -s -X POST http://localhost:3000/test-llm \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! Can you help me test this integration?"}')

echo "📋 API Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo "🎉 SUCCESS! OpenRouter integration is working!"
    echo ""
    echo "📊 Your AI system is now ready:"
    echo "   ✅ Health Check: http://localhost:3000/health"
    echo "   ✅ LLM Test: http://localhost:3000/test-llm"
    echo ""
    echo "🚀 Next steps:"
    echo "   - Test more AI conversations"
    echo "   - Add WhatsApp integration (MSG91)"
    echo "   - Deploy to production"
else
    echo ""
    echo "❌ Something went wrong. Check the response above."
    echo "📋 Common issues:"
    echo "   - Invalid API key"
    echo "   - Network connectivity"
    echo "   - OpenRouter service issues"
    echo ""
    echo "🔍 Debug info:"
    echo "   Server log: tail server.log"
    echo "   Test manually: curl -X POST http://localhost:3000/test-llm -H 'Content-Type: application/json' -d '{\"message\":\"test\"}'"
fi