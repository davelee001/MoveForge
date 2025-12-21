/**
 * Deploy Command
 * Deploys Move modules to Movement Network
 */

const logger = require('../utils/logger');
const rpcClient = require('../utils/rpcClient');
const fs = require('../utils/fileSystem');
const path = require('path');
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

        // Check if build exists
        const buildPath = fs.getAbsolutePath('build');
        const buildExists = await fs.exists(buildPath);

        if (!buildExists) {
            logger.error('Build directory not found. Please run "moveforge build" first.');
            process.exit(1);
        }

        // At this stage, deploy is a guided demo only
        logger.warning('Real on-chain deployment is not yet implemented in this version of MoveForge.');
        logger.info('The steps below show how to deploy using the Aptos CLI today.');
        logger.newLine();

        showMockDeployment(network);

        logger.newLine();
        logger.info('💡 Use the Aptos CLI commands above to publish your Move package.');
        logger.newLine();

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
function showMockDeployment(network) {
    logger.section('📋 Deployment Process');

    logger.info('Step 1: Account Setup');
    logger.list([
        'Create account: aptos init --network testnet',
        'Fund account: Visit https://faucet.testnet.porto.movementlabs.xyz',
        'Verify balance: aptos account list'
    ], '  ');

    logger.newLine();
    logger.info('Step 2: Deploy Module');
    logger.list([
        'Compile: moveforge build',
        'Deploy: aptos move publish --package-dir ./move'
    ], '  ');

    logger.newLine();
    logger.section('📊 Example Deployment Output');

    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    logger.keyValue('Status', '✅ Success', 'green');
    logger.keyValue('Transaction Hash', mockTxHash, 'cyan');
    logger.keyValue('Module Address', mockAddress, 'cyan');
    logger.keyValue('Gas Used', '1,247', 'yellow');
    logger.keyValue('Network', network, 'yellow');

    logger.newLine();
    logger.keyValue('Explorer', rpcClient.getExplorerUrl(mockTxHash), 'cyan');
}

module.exports = deployCommand;
