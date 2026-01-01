/**
 * MoveForge Web Server
 * Simple Express server to run MoveForge commands via browser
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Execute CLI command
app.post('/api/command', async (req, res) => {
    const { command, args } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    const cliPath = path.join(__dirname, 'bin', 'moveforge.js');
    const cmdArgs = [cliPath, command, ...(args || [])];

    const process = spawn('node', cmdArgs);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    process.on('close', (code) => {
        res.json({
            success: code === 0,
            exitCode: code,
            output: stdout,
            error: stderr
        });
    });
});

// Get CLI version
app.get('/api/version', (req, res) => {
    const packageJson = require('./package.json');
    res.json({ version: packageJson.version });
});

// Start server
// Health check
app.get('/health', (_req, res) => {
    res.json({ ok: true, port: PORT });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 MoveForge Web Interface running at http://localhost:${PORT}`);
    console.log(`Open your browser to get started!`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try setting PORT to a different value.`);
        console.error(`   Example: set PORT=3001 && npm run web`);
    } else {
        console.error('❌ Server failed to start:', err.message);
    }
    process.exit(1);
});
