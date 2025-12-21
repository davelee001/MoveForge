/**
 * MoveForge Web Server
 * Simple Express server to run MoveForge commands via browser
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

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
app.listen(PORT, () => {
    console.log(`🔥 MoveForge Web Interface running at http://localhost:${PORT}`);
    console.log(`Open your browser to get started!`);
});
