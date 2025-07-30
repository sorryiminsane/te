const fs = require('fs').promises;
const path = require('path');

async function testTemplate() {
  try {
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
    
    console.log('SUCCESS: Template file loaded');
    console.log('Template size:', template.length, 'characters');
    
    // Check for some expected content
    if (template.includes('param(')) {
      console.log('SUCCESS: Template contains param section');
    } else {
      console.log('WARNING: Template might be missing param section');
    }
    
    if (template.includes('$xzvcv') && template.includes('$cxzvz')) {
      console.log('SUCCESS: Template contains expected parameters');
    } else {
      console.log('WARNING: Template might be missing expected parameters');
    }
    
    // Show first 500 characters
    console.log('\nFirst 500 characters of template:');
    console.log(template.substring(0, 500));
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testTemplate();
