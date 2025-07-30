const argon2 = require('argon2');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'arc_infostealer',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function resetAdminPassword() {
  const newPassword = 'admin123'; // Default new password - CHANGE THIS AFTER FIRST LOGIN
  
  try {
    // Generate hash for the new password
    const passwordHash = await argon2.hash(newPassword);
    
    // Update the admin user's password
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE username = 'admin' 
       RETURNING id, username, role`,
      [passwordHash]
    );
    
    if (result.rowCount === 0) {
      // If admin user doesn't exist, create one
      await pool.query(
        `INSERT INTO users (username, password_hash, role, is_active)
         VALUES ('admin', $1, 'SA', true)
         RETURNING id, username, role`,
        [passwordHash]
      );
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin password reset successfully!');
    }
    
    console.log('Username: admin');
    console.log(`Password: ${newPassword}`);
    console.log('\n⚠️  IMPORTANT: Change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
