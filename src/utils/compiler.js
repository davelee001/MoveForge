/**
 * Move Compiler Utility
 * Wrapper for Move compiler execution and output parsing
 */

const { spawn } = require('child_process');
const path = require('path');
const logger = require('./logger');
const fs = require('./fileSystem');

class Compiler {
    constructor() {
        this.compilerPath = 'aptos'; // Assumes aptos CLI is in PATH
    }

    /**
     * Compile Move modules
     */
    async compile(projectPath, options = {}) {
        const absolutePath = fs.getAbsolutePath(projectPath);

        // Check if Move.toml exists
        const moveTomlPath = path.join(absolutePath, 'Move.toml');
        const exists = await fs.exists(moveTomlPath);

        if (!exists) {
            throw new Error(`Move.toml not found in ${absolutePath}`);
        }

        logger.info(`Compiling Move project at: ${absolutePath}`);

        return new Promise((resolve, reject) => {
            const args = ['move', 'compile'];

            // Note: Aptos CLI compile does not support a --verbose flag.
            // We still stream stdout/stderr when options.verbose is true.

            args.push('--package-dir', absolutePath);

            logger.debug(`Running: ${this.compilerPath} ${args.join(' ')}`);

            const compiler = spawn(this.compilerPath, args, {
                cwd: absolutePath,
                shell: true
            });

            let stdout = '';
            let stderr = '';

            compiler.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                if (options.verbose) {
                    process.stdout.write(output);
                }
            });

            compiler.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                if (options.verbose) {
                    process.stderr.write(output);
                }
            });

            compiler.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        stdout,
                        stderr,
                        buildPath: path.join(absolutePath, 'build')
                    });
                } else {
                    reject({
                        success: false,
                        stdout,
                        stderr,
                        exitCode: code
                    });
                }
            });

            compiler.on('error', (error) => {
                reject({
                    success: false,
                    error: error.message,
                    stdout,
                    stderr
                });
            });
        });
    }

    /**
     * Parse compiler output and format errors
     */
    parseCompilerOutput(output) {
        const lines = output.split('\n');
        const errors = [];
        const warnings = [];

        let currentError = null;

        for (const line of lines) {
            // Detect error lines
            if (line.includes('error:') || line.includes('Error:')) {
                if (currentError) {
                    errors.push(currentError);
                }
                currentError = {
                    type: 'error',
                    message: line,
                    details: []
                };
            } else if (line.includes('warning:') || line.includes('Warning:')) {
                warnings.push({
                    type: 'warning',
                    message: line
                });
            } else if (currentError && line.trim()) {
                currentError.details.push(line);
            }
        }

        if (currentError) {
            errors.push(currentError);
        }

        return { errors, warnings };
    }

    /**
     * Format compilation errors for display
     */
    formatErrors(errors) {
        if (!errors || errors.length === 0) {
            return 'Unknown compilation error';
        }

        const formatted = [];

        errors.forEach((error, index) => {
            formatted.push(`\nError ${index + 1}:`);
            formatted.push(error.message);
            if (error.details && error.details.length > 0) {
                error.details.forEach(detail => {
                    formatted.push('  ' + detail);
                });
            }
        });

        return formatted.join('\n');
    }

    /**
     * Get compiled module path
     */
    getCompiledModulePath(projectPath, moduleName) {
        const buildPath = path.join(
            fs.getAbsolutePath(projectPath),
            'build',
            moduleName,
            'bytecode_modules'
        );
        return buildPath;
    }

    /**
     * Check if aptos CLI is installed
     */
    async checkCompilerInstalled() {
        return new Promise((resolve) => {
            const check = spawn(this.compilerPath, ['--version'], { shell: true });

            check.on('close', (code) => {
                resolve(code === 0);
            });

            check.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Get compiler version
     */
    async getCompilerVersion() {
        return new Promise((resolve, reject) => {
            const versionCheck = spawn(this.compilerPath, ['--version'], { shell: true });

            let output = '';

            versionCheck.stdout.on('data', (data) => {
                output += data.toString();
            });

            versionCheck.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error('Failed to get compiler version'));
                }
            });

            versionCheck.on('error', (error) => {
                reject(error);
            });
        });
    }
}

// Export singleton instance
module.exports = new Compiler();
