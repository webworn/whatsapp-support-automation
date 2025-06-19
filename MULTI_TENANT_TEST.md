# Multi-Tenant User-Conversation Linking Test

## Test Scenario: WhatsApp Messages Route to Correct Users

This test verifies that WhatsApp webhook processing correctly routes customer conversations to the appropriate business users in our multi-tenant SAAS platform.

### Test Setup Commands

```bash
# 1. Ensure development server is running
npm run start:dev

# 2. Create test users for multi-tenant testing
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business1@example.com",
    "password": "TestPass123!",
    "businessName": "Coffee Shop Downtown",
    "whatsappPhoneNumber": "+1555123456"
  }'

curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business2@example.com", 
    "password": "TestPass123!",
    "businessName": "Tech Support Co",
    "whatsappPhoneNumber": "+1555789012"
  }'

# 3. Test webhook processing with different customer phones
curl -X POST http://localhost:3000/api/webhook/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+1999555001",
    "customerName": "Coffee Customer",
    "message": "Hi, what are your opening hours?"
  }'

curl -X POST http://localhost:3000/api/webhook/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "customerPhone": "+1999555002", 
    "customerName": "Tech Support Client",
    "message": "My laptop is not working properly"
  }'
```

### Expected Behavior

1. **User Routing**: Each incoming WhatsApp message should be assigned to an active business user
2. **Conversation Isolation**: Each user should only see conversations for their customers  
3. **Message Association**: All messages should be properly linked to user-specific conversations
4. **Multi-Tenant Security**: Users cannot access conversations belonging to other users

### Verification Steps

```bash
# Login as first business user
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business1@example.com",
    "password": "TestPass123!"
  }'

# Use the JWT token to get conversations for business1
curl -X GET http://localhost:3000/api/v1/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Login as second business user  
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business2@example.com",
    "password": "TestPass123!"
  }'

# Use the JWT token to get conversations for business2
curl -X GET http://localhost:3000/api/v1/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Expected Results

- Business1 should see conversations from customers assigned to them
- Business2 should see different conversations from their customers
- No cross-tenant data leakage should occur
- Each conversation should have proper userId linkage

### Test Status: Ready to Execute
This test validates the critical multi-tenant functionality that was missing from the webhook processing.