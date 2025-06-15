#!/bin/bash

# Test sending WhatsApp message directly via Graph API
# This will help us verify if the API credentials are working

PHONE_NUMBER_ID="665397593326012"
ACCESS_TOKEN="${WHATSAPP_ACCESS_TOKEN:-EAANULRpPnZC8BO7k9MYjn5b2feMuDbIj3S4VXXbIyfBM1k4Pxiilqnc21I4ONzwlBqiIJ5WNpxLPZCSv4QJBpo5GZC1ly12snJVcNuEru83MYczTHD8dN2e79u4zgsdtcll1AwZAW9qGCPQXanbCGPt8d04s4ru3wdFUR93OZAudc2ofbwKzMXkcfqWatZALlPJZBA1TGjyrvEt0OTtMMLggbbkr05QxxzZA2szp9vJHkstDMPzDGFUZD}"
TO_NUMBER="919664304532"

echo "🧪 Testing WhatsApp API direct message sending..."
echo "📱 To: $TO_NUMBER"
echo "🔑 Using Phone Number ID: $PHONE_NUMBER_ID"

curl -i -X POST \
  "https://graph.facebook.com/v22.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "'$TO_NUMBER'",
    "type": "text",
    "text": {
      "body": "🤖 Direct API test from webhook server! If you receive this, the WhatsApp API is working correctly. Time: '$(date)'"
    }
  }'

echo ""
echo "✅ Test completed. Check your WhatsApp for the message!"