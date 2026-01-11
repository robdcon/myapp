import 'dotenv/config';

/**
 * Test script for Auth0 webhook endpoint
 * Tests the /api/auth/register-user endpoint locally
 */

async function testWebhook() {
  const webhookUrl = 'http://localhost:3000/api/auth/register-user';
  const webhookSecret = process.env.AUTH0_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ AUTH0_WEBHOOK_SECRET not found in .env');
    console.log('Add this to your .env file:');
    console.log('AUTH0_WEBHOOK_SECRET=your-random-secret-here');
    process.exit(1);
  }

  console.log('🧪 Testing Auth0 webhook endpoint...\n');

  // Test user data (simulating Auth0 payload)
  const testUser = {
    user: {
      user_id: 'google-oauth2|test-user-12345',
      email: 'test-webhook@example.com',
      name: 'Test Webhook User',
      picture: 'https://example.com/avatar.jpg',
    },
  };

  console.log('📤 Sending request to:', webhookUrl);
  console.log('👤 Test user:', testUser.user);
  console.log('');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success! Status:', response.status);
      console.log('📦 Response:', data);
      console.log('\n✅ Webhook endpoint is working correctly!');
      console.log('\n🔍 Check your database:');
      console.log(`   SELECT * FROM users WHERE auth0_id = '${testUser.user.user_id}';`);
    } else {
      console.error('❌ Error! Status:', response.status);
      console.error('📦 Response:', data);

      if (response.status === 401) {
        console.log('\n💡 Tip: Check that AUTH0_WEBHOOK_SECRET matches in:');
        console.log('   1. Your .env file');
        console.log('   2. Auth0 Action secrets');
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to call webhook:', error.message);
    console.log('\n💡 Make sure your Next.js dev server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
console.log('==================================================');
console.log('       Auth0 Webhook Endpoint Test');
console.log('==================================================\n');

testWebhook().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
