# ARC InfoStealer Data Server

## Overview
The ARC InfoStealer Data Server is a specialized backend component designed to receive stolen data from infostealer agents in a one-way communication model. This server implements the specifications outlined in ARCHITECTURE.md.

## Architecture
- **One-way Communication**: Server only receives data, never responds with commands
- **ZIP-based Payload**: All stolen data is compressed and transmitted as ZIP files
- **Multipart Form Data**: Uses standard HTTP POST with multipart/form-data encoding
- **PostgreSQL Storage**: All data is stored in a PostgreSQL database with JSONB support

## API Endpoints

### POST /c2sock
Primary endpoint for receiving stolen data from InfoStealer agents.

**Request Format:**
- Method: HTTP POST
- Content-Type: multipart/form-data
- Fields:
  - `file`: ZIP-compressed stolen data
  - `hwid`: Hardware ID (collected via GetCurrentHwProfileA)
  - `pid`: Petition ID (exfiltration phase: 1, 2, 3, etc.)
  - `aid`: ARC ID (campaign/build identifier)

**Response:**
```json
{
  "success": true
}
```

### GET /health
Health check endpoint for monitoring server status.

## Database Schema
- `infostealer_data`: Main table storing all exfiltration data
- `campaign_stats`: Aggregated statistics per campaign (AID)
- Automatic triggers update campaign statistics on new data

## Configuration
Environment variables (see .env file):
- `PORT`: Server port (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection
- `MAX_FILE_SIZE`: Maximum ZIP file size (default: 50MB)
- `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX`: Rate limiting configuration

## Security Features
- Rate limiting per IP address
- File type validation (ZIP files only)
- File size limits
- Helmet.js security headers
- Input validation and sanitization
- Comprehensive logging

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
psql -U postgres -f schema.sql
```

3. Configure environment variables in .env file

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Logging
- Winston-based logging system
- Configurable log levels
- File and console output
- Structured JSON logging for production

## Monitoring
- Health check endpoint at `/health`
- Comprehensive request logging
- Performance metrics tracking
- Error tracking and reporting
