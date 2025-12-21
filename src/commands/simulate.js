/**
 * Simulate Command
 * Simulates a transaction via Movement Network RPC (Tenderly-style)
 */

const logger = require('../utils/logger');
const rpcClient = require('../utils/rpcClient');
const configUtil = require('../utils/config');

async function simulateCommand(options) {
    try {
        logger.header('🧪 Transaction Simulation');

        // Validate required options
        if (!options.function) {
            logger.error('Function name is required. Use --function <name>');
            logger.info('Example: moveforge simulate --function initialize --args u64:100');
            process.exit(1);
        }

        // Parse arguments
        const functionName = options.function;
        const args = options.args || [];
        const sender = options.sender || '0x1'; // Default sender

        logger.info(`Function: ${functionName}`);
        logger.info(`Sender: ${sender}`);
        if (args.length > 0) {
            logger.info(`Arguments: ${args.join(', ')}`);
        }
        logger.newLine();

        // Load config to determine network and (optionally) module address
        let moduleAddress = sender;
        let network = 'testnet';
        try {
            const loadedConfig = await configUtil.loadConfig();
            if (loadedConfig && loadedConfig.data) {
                const data = loadedConfig.data;
                logger.debug(`Loaded config: ${data.name}`);

                const defaultNetwork = configUtil.getDefaultNetwork(data);
                if (defaultNetwork) {
                    network = defaultNetwork;
                }

                const networkConfig = configUtil.getNetworkConfig(data, network);
                if (networkConfig) {
                    if (networkConfig.rpc) {
                        rpcClient.setCustomEndpoint(network, networkConfig.rpc);
                    }
                    if (networkConfig.moduleAddress) {
                        moduleAddress = networkConfig.moduleAddress;
                    }
                }
            }
        } catch (_) {
            // Errors already logged by config util; fall back to defaults
        }

        // Apply network selection
        try {
            rpcClient.setNetwork(network);
        } catch (error) {
            logger.warning(`Failed to apply network from config: ${error.message}`);
        }

        logger.info(`Network: ${network}`);
        logger.newLine();

        logger.startSpinner('Preparing simulation...');

        // Parse function arguments
        const parsedArgs = parseArguments(args);

        // Create simulation transaction payload
        const payload = {
            type: 'entry_function_payload',
            function: `${moduleAddress}::hello_move::${functionName}`,
            type_arguments: [],
            arguments: parsedArgs
        };

        const simulationTxn = {
            sender: sender,
            sequence_number: '0',
            max_gas_amount: '100000',
            gas_unit_price: '100',
            expiration_timestamp_secs: Math.floor(Date.now() / 1000 + 600).toString(),
            payload: payload
        };

        logger.updateSpinner('Running simulation via RPC...');

        try {
            const simulation = await rpcClient.simulateTransaction(simulationTxn);

            logger.succeedSpinner('Simulation completed');
            logger.newLine();

            if (!simulation || (Array.isArray(simulation) && simulation.length === 0)) {
                throw new Error('Empty simulation response from RPC');
            }

            const sim = Array.isArray(simulation) ? simulation[0] : simulation;

            displaySimulationResults({
                success: sim.success,
                gasUsed: sim.gas_used || '0',
                gasUnitPrice: sim.gas_unit_price || '0',
                vmStatus: sim.vm_status || 'Unknown',
                changes: sim.changes || [],
                events: sim.events || []
            });

            logger.newLine();
            logger.info('💡 Note: This was a simulation call. No transaction was submitted to the blockchain.');
            logger.newLine();

            logger.section('🚀 Next Steps');
            logger.list([
                'Review the simulation results above',
                'If everything looks good, deploy with the Aptos CLI (see deploy command output)',
                'Or modify your contract and rebuild: moveforge build'
            ], '→');

            logger.newLine();
        } catch (error) {
            logger.failSpinner('Simulation failed');
            logger.newLine();

            if (error.response) {
                logger.errorDetail('Simulation Error', [
                    `Status: ${error.response.status}`,
                    `Message: ${error.response.data?.message || 'Unknown error'}`,
                    '',
                    'Common issues:',
                    '• Function does not exist in the module',
                    '• Incorrect argument types or count',
                    '• Module not deployed to the network',
                    '• Invalid sender address'
                ]);
            } else {
                logger.errorDetail('Simulation Error', [
                    error.message,
                    '',
                    '💡 Tips:',
                    '• Ensure your contract is compiled and deployed',
                    '• Check function name and arguments',
                    '• Verify network connectivity and RPC endpoint'
                ]);
            }

            logger.newLine();
            process.exit(1);
        }
    } catch (error) {
        logger.error('Simulation command failed');
        logger.error(error.message);
        process.exit(1);
    }
}

/**
 * Parse command-line arguments into proper types
 */
function parseArguments(args) {
    return args.map((arg) => {
        // Format: type:value (e.g., u64:100, address:0x1, bool:true)
        if (arg.includes(':')) {
            const [type, value] = arg.split(':');

            switch (type.toLowerCase()) {
                case 'u8':
                case 'u64':
                case 'u128':
                    return value;
                case 'bool':
                    return value.toLowerCase() === 'true';
                case 'address':
                case 'string':
                    return value;
                default:
                    return value;
            }
        }

        // If no type specified, return as-is
        return arg;
    });
}

/**
 * Display simulation results in a formatted way
 */
function displaySimulationResults(results) {
    logger.section('📊 Simulation Results');

    // Status
    if (results.success) {
        logger.keyValue('Status', '✅ Success', 'green');
    } else {
        logger.keyValue('Status', '❌ Failed', 'red');
    }

    // Gas information
    logger.keyValue('Gas Used', results.gasUsed, 'yellow');
    logger.keyValue('Gas Price', results.gasUnitPrice, 'yellow');
    const totalCost = parseInt(results.gasUsed || '0', 10) * parseInt(results.gasUnitPrice || '0', 10);
    logger.keyValue('Total Cost', `${totalCost} Octas`, 'yellow');

    // VM Status
    logger.keyValue('VM Status', results.vmStatus, 'cyan');

    // Storage changes
    if (results.changes && results.changes.length > 0) {
        logger.newLine();
        logger.section('💾 Storage Changes');
        results.changes.forEach((change, index) => {
            logger.info(`Change ${index + 1}: ${change.type}`);
            if (change.address) {
                logger.keyValue('  Address', change.address, 'cyan');
            }
            if (change.resource || (change.data && change.data.type)) {
                logger.keyValue('  Resource', change.resource || change.data.type, 'cyan');
            }
            if (change.data) {
                logger.info('  Data:');
                Object.entries(change.data).forEach(([key, value]) => {
                    logger.keyValue(`    ${key}`, JSON.stringify(value), 'white');
                });
            }
        });
    }

    // Events
    if (results.events && results.events.length > 0) {
        logger.newLine();
        logger.section('📢 Events Emitted');
        results.events.forEach((event, index) => {
            logger.info(`Event ${index + 1}: ${event.type || 'event'}`);
            if (event.data) {
                Object.entries(event.data).forEach(([key, value]) => {
                    logger.keyValue(`  ${key}`, JSON.stringify(value), 'white');
                });
            }
        });
    }
}

module.exports = simulateCommand;
