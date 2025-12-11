/**
 * Build Command
 * Compiles Move smart contracts
 */

const logger = require('../utils/logger');
const compiler = require('../utils/compiler');
const fs = require('../utils/fileSystem');

async function buildCommand(options) {
    try {
        logger.header('🔨 Building Move Project');

        const projectPath = options.path || './move';

        // Check if compiler is installed
        logger.startSpinner('Checking Move compiler...');
        const compilerInstalled = await compiler.checkCompilerInstalled();

        if (!compilerInstalled) {
            logger.failSpinner('Move compiler not found');
            logger.newLine();
            logger.errorDetail('Aptos CLI Not Installed', [
                'The Aptos CLI (which includes the Move compiler) is not installed or not in PATH.',
                '',
                'Please install it using one of these methods:',
                '',
                '1. Using installation script:',
                '   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3',
                '',
                '2. Using Homebrew (macOS/Linux):',
                '   brew install aptos',
                '',
                '3. Download from GitHub:',
                '   https://github.com/aptos-labs/aptos-core/releases',
                '',
                'After installation, verify with: aptos --version'
            ]);
            process.exit(1);
        }

        // Get compiler version
        try {
            const version = await compiler.getCompilerVersion();
            logger.succeedSpinner(`Move compiler found: ${version}`);
        } catch (error) {
            logger.succeedSpinner('Move compiler found');
        }

        // Compile the project
        logger.newLine();
        logger.startSpinner('Compiling Move modules...');

        try {
            const result = await compiler.compile(projectPath, {
                verbose: options.verbose
            });

            logger.succeedSpinner('Compilation successful!');
            logger.newLine();

            logger.section('✅ Build Results');
            logger.keyValue('Status', 'Success', 'green');
            logger.keyValue('Build Path', result.buildPath, 'cyan');

            // List compiled modules
            const buildExists = await fs.exists(result.buildPath);
            if (buildExists) {
                const buildContents = await fs.listFiles(result.buildPath);
                if (buildContents.length > 0) {
                    logger.newLine();
                    logger.info('Compiled modules:');
                    buildContents.forEach(item => {
                        logger.list([item], '📦');
                    });
                }
            }

            logger.newLine();
            logger.success('Build completed successfully! 🎉');
            logger.newLine();

            logger.section('🚀 Next Steps');
            logger.list([
                'Test your contract: moveforge simulate --function <function_name>',
                'Deploy to testnet: moveforge deploy --network testnet',
                'Run Move tests: aptos move test'
            ], '→');

            logger.newLine();

        } catch (error) {
            logger.failSpinner('Compilation failed');
            logger.newLine();

            // Parse and display errors
            if (error.stderr) {
                const parsed = compiler.parseCompilerOutput(error.stderr);

                if (parsed.errors.length > 0) {
                    logger.errorDetail('Compilation Errors', compiler.formatErrors(parsed.errors));
                } else {
                    logger.errorDetail('Compilation Error', error.stderr);
                }

                if (parsed.warnings.length > 0) {
                    logger.newLine();
                    logger.warning('Warnings:');
                    parsed.warnings.forEach(warning => {
                        logger.warning(warning.message);
                    });
                }
            } else if (error.error) {
                logger.errorDetail('Build Error', error.error);
            } else {
                logger.errorDetail('Build Error', error.message || 'Unknown error occurred');
            }

            logger.newLine();
            logger.info('💡 Tips:');
            logger.list([
                'Check your Move.toml configuration',
                'Verify all dependencies are correctly specified',
                'Ensure Move syntax is correct',
                'Run with --verbose flag for detailed output'
            ], '•');

            logger.newLine();
            process.exit(1);
        }

    } catch (error) {
        logger.error('Build command failed');
        logger.error(error.message);
        process.exit(1);
    }
}

module.exports = buildCommand;
