#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "🧪 WhatsApp Support API - Core Testing"
echo "======================================"

echo ""
echo "1️⃣ Health Check..."
curl -s "$BASE_URL/health" | jq . || echo "❌ Health check failed"

echo ""
echo "2️⃣ App Info..."
curl -s "$BASE_URL/" | jq . || echo "❌ App info failed"

echo ""
echo "3️⃣ Testing Session Creation..."
curl -s -X POST "$BASE_URL/sessions" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "context": {"name": "Test User"}}' | jq . || echo "❌ Session creation failed"

echo ""
echo "4️⃣ Testing LLM Response..."
curl -s -X POST "$BASE_URL/llm/generate" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can you help me?", "phoneNumber": "+1234567890"}' | jq . || echo "❌ LLM test failed"

echo ""
echo "5️⃣ Testing Conversation Processing..."
curl -s -X POST "$BASE_URL/conversations/process" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "message": "I need help with my order", "messageType": "text"}' | jq . || echo "❌ Conversation test failed"

echo ""
echo "6️⃣ Testing Webhook (Test Mode)..."
curl -s -X POST "$BASE_URL/webhooks/test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "data": {
      "from": "+1234567890",
      "to": "+1987654321",
      "text": "Test webhook message",
      "messageId": "test_msg_123",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
    }
  }' | jq . || echo "❌ Webhook test failed"

echo ""
echo "7️⃣ Queue Status..."
curl -s "$BASE_URL/queue/status" | jq . || echo "❌ Queue status failed"

echo ""
echo "✅ Core API testing complete!"
echo "📊 Check results above for any failures"