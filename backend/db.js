require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'arc_infostealer',
    user: process.env.DB_USER || 'arc_user',
    password: process.env.DB_PASSWORD || 'arc_password'
});

module.exports = pool; 