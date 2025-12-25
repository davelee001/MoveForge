/**
 * Deploy Command
 * Deploys Move modules to Movement Network
 */

const logger = require('../utils/logger');
const rpcClient = require('../utils/rpcClient');
const fs = require('../utils/fileSystem');
const path = require('path');
const { spawn } = require('child_process');
const configUtil = require('../utils/config');

async function deployCommand(options) {
    try {
        logger.header('🚀 Deploying to Movement Network');

        // Load configuration and resolve network
        let network = options.network || 'testnet';
        try {
            const loadedConfig = await configUtil.loadConfig();
            if (loadedConfig && loadedConfig.data) {
                const data = loadedConfig.data;
                const defaultNetwork = configUtil.getDefaultNetwork(data);
                if (!options.network && defaultNetwork) {
                    network = defaultNetwork;
                }

                const networkConfig = configUtil.getNetworkConfig(data, network);
                if (networkConfig && networkConfig.rpc) {
                    rpcClient.setCustomEndpoint(network, networkConfig.rpc);
                }
            }
        } catch (_) {
            // Config errors are logged by config util; continue with defaults
        }

        // Set network
        rpcClient.setNetwork(network);

        logger.info(`Network: ${network}`);
        logger.info(`RPC Endpoint: ${rpcClient.getEndpoint()}`);
        logger.newLine();

        // Check if Move package exists
        const packageDir = options.module || './move';
        const moveTomlPath = path.join(packageDir, 'Move.toml');
        const hasMovePackage = await fs.exists(fs.getAbsolutePath(moveTomlPath));
        if (!hasMovePackage) {
            logger.error(`Move package not found at ${packageDir}. Use --module to specify package dir.`);
            process.exit(1);
        }

        // Warn about unused key option
        if (options.key) {
            logger.warning('The --key option is not used directly. Ensure your Aptos CLI profile is configured (aptos init).');
        }

        // Compose Aptos CLI publish command
        const args = ['move', 'publish', '--package-dir', packageDir, '--assume-yes', '--skip-fetch-latest-git-deps'];

        // Prefer using RPC URL from config/network
        const rpc = rpcClient.getEndpoint();
        if (rpc) {
            args.push('--url', rpc);
        }

        // Gas limit from config if available
        try {
            const loaded = await configUtil.loadConfig();
            if (loaded && loaded.data && loaded.data.deployment && loaded.data.deployment.gasLimit) {
                args.push('--max-gas', String(loaded.data.deployment.gasLimit));
            }
        } catch (_) {}

        logger.section('📦 Publishing Move package');
        logger.keyValue('Package dir', packageDir, 'cyan');
        logger.keyValue('Network', network, 'yellow');
        logger.keyValue('RPC', rpc, 'yellow');

        await runAptos(args);

        return;

    } catch (error) {
        logger.error('Deployment command failed');
        logger.error(error.message);
        process.exit(1);
    }
}

/**
 * Show mock deployment for demonstration
 */
async function runAptos(args) {
    return new Promise((resolve) => {
        const spinner = logger.startSpinner('Publishing via Aptos CLI...');
        const child = spawn('aptos', args, { stdio: ['ignore', 'pipe', 'pipe'] });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (d) => { stdout += d.toString(); });
        child.stderr.on('data', (d) => { stderr += d.toString(); });

        child.on('error', (err) => {
            logger.failSpinner('Failed to start Aptos CLI');
            if (err.code === 'ENOENT') {
                logger.error('Aptos CLI not found. Install it and ensure it is on PATH.');
                logger.info('Install guide: https://aptos.dev/tools/aptos-cli/install-cli/');
            } else {
                logger.error(err.message);
            }
            process.exit(1);
        });

        child.on('close', (code) => {
            if (code === 0) {
                logger.succeedSpinner('Publish transaction submitted');

                // Try to extract transaction hash from stdout
                const hashMatch = stdout.match(/Transaction Hash:\s*(0x[0-9a-fA-F]+)/) || stdout.match(/hash:\s*(0x[0-9a-fA-F]+)/i);
                if (hashMatch) {
                    const hash = hashMatch[1];
                    logger.keyValue('Transaction Hash', hash, 'cyan');
                    logger.keyValue('Explorer', rpcClient.getExplorerUrl(hash), 'cyan');
                }

                // Print a summary
                logger.section('📜 CLI Output');
                process.stdout.write(stdout);
                resolve();
            } else {
                logger.failSpinner('Publish failed');
                logger.errorDetail('Aptos CLI error', stderr || stdout || 'Unknown error');
                process.exit(code || 1);
            }
        });
    });
}

module.exports = deployCommand;
