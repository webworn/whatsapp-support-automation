#!/bin/bash

# WhatsApp Business Webhook API Testing Script

echo "🧪 Testing WhatsApp Business Webhook API Endpoints"
echo "=================================================="

BASE_URL="http://localhost:3000"

# Test 1: Webhook verification (GET)
echo ""
echo "✅ Test 1: Webhook verification"
echo "curl \"$BASE_URL/webhooks/whatsapp-business?hub.mode=subscribe&hub.verify_token=test_token&hub.challenge=test_challenge\""

# Test 2: Simple webhook test
echo ""
echo "✅ Test 2: Simple webhook test"
echo "curl -X POST $BASE_URL/webhooks/test-whatsapp-business \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"phoneNumber\": \"1234567890\", \"message\": \"Hello from test!\", \"messageType\": \"text\"}'"

# Test 3: Text message simulation
echo ""
echo "✅ Test 3: Text message simulation"
echo "curl -X POST $BASE_URL/webhooks/simulate-whatsapp-business \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"scenario\": \"text_message\", \"phoneNumber\": \"1234567890\", \"message\": \"I need help with my order\"}'"

# Test 4: Button reply simulation
echo ""
echo "✅ Test 4: Button reply simulation"
echo "curl -X POST $BASE_URL/webhooks/simulate-whatsapp-business \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"scenario\": \"button_reply\", \"phoneNumber\": \"1234567890\"}'"

# Test 5: Image message simulation
echo ""
echo "✅ Test 5: Image message simulation"
echo "curl -X POST $BASE_URL/webhooks/simulate-whatsapp-business \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"scenario\": \"image_message\", \"phoneNumber\": \"1234567890\"}'"

# Test 6: Status update simulation
echo ""
echo "✅ Test 6: Status update simulation"
echo "curl -X POST $BASE_URL/webhooks/simulate-whatsapp-business \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"scenario\": \"status_update\"}'"

# Test 7: Webhook statistics
echo ""
echo "✅ Test 7: Webhook statistics"
echo "curl $BASE_URL/webhooks/stats"

# Test 8: Webhook health check
echo ""
echo "✅ Test 8: Webhook health check"
echo "curl $BASE_URL/webhooks/health"

echo ""
echo ""
echo "📋 To run these tests:"
echo "1. Start the server: npm run start:dev"
echo "2. Run individual tests by copying the curl commands above"
echo "3. Or make this script executable and run it: chmod +x test-webhook-api.sh && ./test-webhook-api.sh"

echo ""
echo "🔧 For real WhatsApp Business API testing:"
echo "1. Set environment variables in Railway:"
echo "   WHATSAPP_VERIFY_TOKEN=your_verify_token"
echo "   WHATSAPP_APP_SECRET=your_app_secret"
echo "   WHATSAPP_ACCESS_TOKEN=your_access_token"
echo "   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id"
echo ""
echo "2. Configure webhook URL in Meta Developer Console:"
echo "   https://your-app.railway.app/webhooks/whatsapp-business"
echo ""
echo "3. Subscribe to 'messages' and 'message_deliveries' events"

echo ""
echo "🎉 WhatsApp Business webhook implementation is complete!"