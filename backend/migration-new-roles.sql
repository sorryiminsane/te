-- Migration to new role structure: SA, A, aC with service tags
-- This will replace the old role system

BEGIN;

-- First, backup existing user data before any drops
CREATE TEMP TABLE user_backup AS 
SELECT id, username, role::text as old_role FROM users;

-- Drop existing role-related constraints and functions
DROP VIEW IF EXISTS active_users CASCADE;
DROP VIEW IF EXISTS user_access_summary CASCADE;
DROP FUNCTION IF EXISTS has_permission(user_role, text) CASCADE;
DROP FUNCTION IF EXISTS check_user_access(integer) CASCADE;

-- Create new role enum
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('SA', 'A', 'ifUser', 'ROP', 'RUser', 'LO');

-- Re-add role column to users table
ALTER TABLE users ADD COLUMN role user_role DEFAULT 'ifUser';
ALTER TABLE registration_codes ADD COLUMN role user_role DEFAULT 'ifUser';
ALTER TABLE pending_registrations ADD COLUMN role user_role DEFAULT 'ifUser';

-- Create service types table
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user services junction table
CREATE TABLE IF NOT EXISTS user_services (
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by INTEGER REFERENCES users(id),
    PRIMARY KEY (user_id, service_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_types(id) ON DELETE CASCADE
);

-- Insert service types
INSERT INTO service_types (name, display_name, description) VALUES
    ('infostealer', 'InfoStealer', 'Access to InfoStealer data collection and dashboard'),
    ('rat', 'RAT', 'Remote Access Tool control and management'),
    ('ransomware', 'Ransomware', 'Ransomware deployment and monitoring'),
    ('loader', 'Loader', 'Payload loader service access')
ON CONFLICT (name) DO NOTHING;

-- Update existing users based on their old roles
UPDATE users SET role = 'SA'::user_role WHERE EXISTS (
    SELECT 1 FROM user_backup ub WHERE ub.id = users.id AND ub.old_role = 'SA'
);
UPDATE users SET role = 'A'::user_role WHERE EXISTS (
    SELECT 1 FROM user_backup ub WHERE ub.id = users.id AND ub.old_role = 'A'
);
UPDATE users SET role = 'aC'::user_role WHERE EXISTS (
    SELECT 1 FROM user_backup ub WHERE ub.id = users.id AND ub.old_role IN ('ifUser', 'ROP', 'RUser', 'LO')
);

-- Assign service access based on old roles
INSERT INTO user_services (user_id, service_id, granted_by)
SELECT 
    ub.id,
    st.id,
    1 -- Granted by system admin during migration
FROM user_backup ub
JOIN service_types st ON (
    (ub.old_role = 'ifUser' AND st.name = 'infostealer') OR
    (ub.old_role = 'ROP' AND st.name = 'rat') OR
    (ub.old_role = 'RUser' AND st.name = 'ransomware') OR
    (ub.old_role = 'LO' AND st.name = 'loader')
)
WHERE ub.old_role IN ('ifUser', 'ROP', 'RUser', 'LO')
ON CONFLICT DO NOTHING;

-- Create new permission checking function
CREATE OR REPLACE FUNCTION has_service_access(user_id INTEGER, service_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    -- Get user role
    SELECT role INTO user_role_val FROM users WHERE id = user_id;
    
    -- SA and A have access to everything
    IF user_role_val IN ('SA', 'A') THEN
        RETURN TRUE;
    END IF;
    
    -- Role-based users need explicit service access
    IF user_role_val IN ('ifUser', 'ROP', 'RUser', 'LO') THEN
        RETURN EXISTS (
            SELECT 1 FROM user_services us
            JOIN service_types st ON us.service_id = st.id
            WHERE us.user_id = has_service_access.user_id 
            AND st.name = service_name
        );
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user services
CREATE OR REPLACE FUNCTION get_user_services(user_id INTEGER)
RETURNS TABLE(service_name TEXT, display_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT st.name, st.display_name
    FROM user_services us
    JOIN service_types st ON us.service_id = st.id
    WHERE us.user_id = get_user_services.user_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate active users view with new structure
CREATE VIEW active_users AS
SELECT 
    u.id,
    u.username,
    u.role,
    u.access_start,
    u.access_end,
    u.is_active,
    CASE 
        WHEN u.role IN ('SA', 'A') THEN true
        WHEN u.access_end IS NULL OR u.access_end > NOW() THEN true
        ELSE false
    END as has_active_subscription
FROM users u
WHERE u.is_active = true;

-- Create user access summary view
CREATE VIEW user_access_summary AS
SELECT 
    u.id,
    u.username,
    u.role,
    u.is_active,
    u.access_start,
    u.access_end,
    COALESCE(
        array_agg(st.name ORDER BY st.name) FILTER (WHERE st.name IS NOT NULL),
        ARRAY[]::text[]
    ) as services
FROM users u
LEFT JOIN user_services us ON u.id = us.user_id
LEFT JOIN service_types st ON us.service_id = st.id
GROUP BY u.id, u.username, u.role, u.is_active, u.access_start, u.access_end;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_id ON user_services(service_id);
CREATE INDEX IF NOT EXISTS idx_service_types_name ON service_types(name);

-- Update registration_codes table to use new role enum
ALTER TABLE registration_codes DROP CONSTRAINT IF EXISTS registration_codes_role_check;
UPDATE registration_codes SET role = 'aC' WHERE role NOT IN ('SA', 'A');

COMMIT;
