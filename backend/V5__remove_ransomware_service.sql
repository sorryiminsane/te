-- Remove ransomware service type and related permissions
BEGIN;

-- Remove ransomware service from user_services
DELETE FROM user_services 
WHERE service_id IN (SELECT id FROM service_types WHERE name = 'ransomware');

-- Remove ransomware service type
DELETE FROM service_types WHERE name = 'ransomware';

-- Drop the has_service_access function to recreate it without ransomware reference
DROP FUNCTION IF EXISTS has_service_access(INTEGER, TEXT);

-- Recreate has_service_access without ransomware reference
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

COMMIT;
