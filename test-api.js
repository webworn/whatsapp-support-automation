const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Testing WhatsApp AI System APIs...\n');

  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123456'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.accessToken;
      
      // Set auth header for subsequent requests
      const authHeaders = { Authorization: `Bearer ${token}` };

      // 2. Test WhatsApp credentials status
      console.log('\n2. Testing WhatsApp credentials status...');
      const credentialsResponse = await axios.get(`${BASE_URL}/api/whatsapp/credentials/status`, {
        headers: authHeaders
      });
      console.log('✅ Credentials status:', credentialsResponse.data.success ? 'Success' : 'Failed');

      // 3. Save temporary WhatsApp credentials
      console.log('\n3. Testing saving WhatsApp credentials...');
      const saveCredentialsResponse = await axios.post(`${BASE_URL}/api/whatsapp/credentials/save`, {
        accessToken: 'EAANULRpPnZC8BO4qHDiLEFLsZAHGZAxAvZBFTIJ7LXzTevT8uw7GH5gAOmxgAbbvzfYZBVXdqJLOpU5M0XNLMLBJbgjbmxA2bZCL2F9xVjWyHb7k7jcnedyL8JHP1PYpRctxMSaDlh2gZCixXX7GO7E12SYtA5H4GAxISpRxc2p8o9UWkwBt4J7YvQxWyoaMn0OpnbgrtHUpS4N4xklZCHIZCYCZBPPiIZB1FcD2znbQFhYoAlPOSTdFrfODI9BnJOU5AZDZD',
        phoneNumberId: '665397593326012',
        businessAccountId: '1437200930610622',
        appSecret: '',
        verifyToken: 'whatsapp_test_verify'
      }, {
        headers: authHeaders
      });
      console.log('✅ Save credentials:', saveCredentialsResponse.data.success ? 'Success' : 'Failed');

      // 4. Test mode status
      console.log('\n4. Testing test mode status...');
      const testStatusResponse = await axios.get(`${BASE_URL}/api/webhooks/test/status`, {
        headers: authHeaders
      });
      console.log('✅ Test mode status:', testStatusResponse.data.success ? 'Success' : 'Failed');
      if (testStatusResponse.data.success) {
        console.log('📊 Test mode enabled:', testStatusResponse.data.data.testModeEnabled);
        console.log('📊 Available scenarios:', testStatusResponse.data.data.availableScenarios.length);
      }

      // 5. Test scenarios
      console.log('\n5. Testing available scenarios...');
      const scenariosResponse = await axios.get(`${BASE_URL}/api/webhooks/test/scenarios`, {
        headers: authHeaders
      });
      console.log('✅ Scenarios:', scenariosResponse.data.success ? 'Success' : 'Failed');
      if (scenariosResponse.data.success) {
        console.log('📋 Available scenarios:');
        scenariosResponse.data.data.forEach((scenario, index) => {
          console.log(`   ${index + 1}. ${scenario.name} - ${scenario.description}`);
        });
      }

      // 6. Test webhook simulation
      console.log('\n6. Testing webhook simulation...');
      const webhookTestResponse = await axios.post(`${BASE_URL}/api/webhooks/test/webhook`, {
        scenario: 'customer_service',
        businessName: 'Test Business'
      }, {
        headers: authHeaders
      });
      console.log('✅ Webhook simulation:', webhookTestResponse.data.success ? 'Success' : 'Failed');
      if (webhookTestResponse.data.success) {
        const result = webhookTestResponse.data.data;
        console.log('📱 Customer:', result.customerInfo.name);
        console.log('📞 Phone:', result.customerInfo.phone);
        console.log('🤖 AI Response:', result.aiResponse ? result.aiResponse.substring(0, 100) + '...' : 'None');
        console.log('⏱️  Processing time:', result.processingTimeMs + 'ms');
        console.log('🧪 Test mode:', result.testMode);
      }

      console.log('\n🎉 All API tests completed successfully!');
      console.log('\n🌐 You can now access the dashboard at: http://localhost:3000');
      console.log('📧 Login with: admin@example.com');
      console.log('🔑 Password: admin123456');

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPIs();