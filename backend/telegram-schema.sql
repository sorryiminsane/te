-- Telegram Bot Database Schema
-- Tables for access code management and user registration

-- Registration codes table (admin-generated access codes)
CREATE TABLE IF NOT EXISTS registration_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(19) UNIQUE NOT NULL,              -- Format: ARC-XXXX-XXXX-XXXX
    created_by INTEGER,                            -- Admin user ID (will reference users table later)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    used_at TIMESTAMPTZ,
    used_by INTEGER,                               -- User ID who used the code
    is_revoked BOOLEAN DEFAULT FALSE,
    service_type VARCHAR(20) NOT NULL DEFAULT 'infostealer', -- infostealer, rat, ransomware, loader
    notes TEXT                                     -- Optional admin notes
);

-- Pending registrations table (temporary storage during registration process)
CREATE TABLE IF NOT EXISTS pending_registrations (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,                   -- Telegram user ID
    telegram_username VARCHAR(255),               -- Telegram username (optional)
    username VARCHAR(32) NOT NULL,                -- Generated ARC username
    temp_token VARCHAR(512) UNIQUE NOT NULL,      -- JWT registration token
    temp_token_expires TIMESTAMPTZ NOT NULL,      -- Token expiration
    code_used VARCHAR(19) NOT NULL,               -- Access code that was redeemed
    service_type VARCHAR(20) NOT NULL,            -- Service type from the code
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_code_used FOREIGN KEY (code_used) REFERENCES registration_codes(code)
);

-- Users table (main user accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,         -- ARC username
    password_hash VARCHAR(255) NOT NULL,          -- Argon2 hashed password
    email VARCHAR(255),                           -- Optional email
    telegram_id BIGINT,                           -- Telegram ID for linking
    telegram_username VARCHAR(255),              -- Telegram username
    service_type VARCHAR(20) NOT NULL,           -- Service type
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    registration_completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registration_codes_code ON registration_codes (code);
CREATE INDEX IF NOT EXISTS idx_registration_codes_service_type ON registration_codes (service_type);
CREATE INDEX IF NOT EXISTS idx_registration_codes_expires_at ON registration_codes (expires_at);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_telegram_id ON pending_registrations (telegram_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_temp_token ON pending_registrations (temp_token);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires ON pending_registrations (temp_token_expires);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_service_type ON users (service_type);

-- Cleanup function for expired pending registrations
CREATE OR REPLACE FUNCTION cleanup_expired_registrations()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_registrations 
    WHERE temp_token_expires < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled cleanup (requires pg_cron extension or external scheduler)
-- This is commented out as it requires additional setup
-- SELECT cron.schedule('cleanup-expired-registrations', '0 * * * *', 'SELECT cleanup_expired_registrations();');

-- Grant permissions to arc_user
GRANT ALL PRIVILEGES ON registration_codes TO arc_user;
GRANT ALL PRIVILEGES ON pending_registrations TO arc_user;
GRANT ALL PRIVILEGES ON users TO arc_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO arc_user;
