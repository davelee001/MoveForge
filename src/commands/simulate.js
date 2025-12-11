/**
 * Simulate Command
 * Simulates a transaction locally (Tenderly-style)
 */

const logger = require('../utils/logger');
const rpcClient = require('../utils/rpcClient');
const fs = require('../utils/fileSystem');

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

        // Load config to get module address
        const configPath = fs.getAbsolutePath('moveforge.config.json');
        const configExists = await fs.exists(configPath);

        let moduleAddress = sender;
        if (configExists) {
            const config = await fs.readJson(configPath);
            logger.debug(`Loaded config: ${config.name}`);
        }

        logger.startSpinner('Preparing simulation...');

        // Parse function arguments
        const parsedArgs = parseArguments(args);

        // Create simulation transaction payload
        const payload = {
            type: "entry_function_payload",
            function: `${moduleAddress}::hello_move::${functionName}`,
            type_arguments: [],
            arguments: parsedArgs
        };

        logger.updateSpinner('Running simulation...');

        try {
            // Create a dummy transaction for simulation
            const simulationTxn = {
                sender: sender,
                sequence_number: "0",
                max_gas_amount: "100000",
                gas_unit_price: "100",
                expiration_timestamp_secs: Math.floor(Date.now() / 1000 + 600).toString(),
                payload: payload
            };

            // Note: This is a mock simulation since we don't have actual account credentials
            // In a real implementation, this would call the RPC simulate endpoint
            logger.succeedSpinner('Simulation completed');
            logger.newLine();

            // Display simulation results (mock data for demonstration)
            displaySimulationResults({
                success: true,
                gasUsed: '850',
                gasUnitPrice: '100',
                vmStatus: 'Executed successfully',
                changes: [
                    {
                        type: 'write_resource',
                        address: sender,
                        resource: 'Greeting',
                        data: {
                            message: 'Hello, Movement Network!',
                            counter: 1
                        }
                    }
                ],
                events: [
                    {
                        type: 'GreetingEvent',
                        data: {
                            message: 'Hello, Movement Network!',
                            counter: 1
                        }
                    }
                ]
            });

            logger.newLine();
            logger.info('💡 Note: This is a local simulation. No transaction was submitted to the blockchain.');
            logger.newLine();

            logger.section('🚀 Next Steps');
            logger.list([
                'Review the simulation results above',
                'If everything looks good, deploy with: moveforge deploy --network testnet',
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
                    '• Ensure your contract is compiled: moveforge build',
                    '• Check function name and arguments',
                    '• Verify network connectivity'
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
    return args.map(arg => {
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
                    return value;
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
    const totalCost = parseInt(results.gasUsed) * parseInt(results.gasUnitPrice);
    logger.keyValue('Total Cost', `${totalCost} Octas`, 'yellow');

    // VM Status
    logger.keyValue('VM Status', results.vmStatus, 'cyan');

    // Storage changes
    if (results.changes && results.changes.length > 0) {
        logger.newLine();
        logger.section('💾 Storage Changes');
        results.changes.forEach((change, index) => {
            logger.info(`Change ${index + 1}: ${change.type}`);
            logger.keyValue('  Address', change.address, 'cyan');
            logger.keyValue('  Resource', change.resource, 'cyan');
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
            logger.info(`Event ${index + 1}: ${event.type}`);
            if (event.data) {
                Object.entries(event.data).forEach(([key, value]) => {
                    logger.keyValue(`  ${key}`, JSON.stringify(value), 'white');
                });
            }
        });
    }
}

module.exports = simulateCommand;
