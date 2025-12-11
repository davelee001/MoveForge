#!/usr/bin/env node

/**
 * MoveForge CLI - Main Entry Point
 * A Next-Generation Developer Framework for the Movement Network
 */

const { Command } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Import commands
const initCommand = require('../src/commands/init');
const buildCommand = require('../src/commands/build');
const simulateCommand = require('../src/commands/simulate');
const deployCommand = require('../src/commands/deploy');

const program = new Command();

// Configure CLI
program
  .name('moveforge')
  .description('🔥 MoveForge - A Next-Generation Developer Framework for the Movement Network')
  .version(packageJson.version, '-v, --version', 'Output the current version');

// ASCII Art Banner
const banner = `
${chalk.red('███╗   ███╗ ██████╗ ██╗   ██╗███████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗')}
${chalk.red('████╗ ████║██╔═══██╗██║   ██║██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝')}
${chalk.yellow('██╔████╔██║██║   ██║██║   ██║█████╗  █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ')}
${chalk.yellow('██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ')}
${chalk.red('██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗')}
${chalk.red('╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝')}
${chalk.cyan('                                                                                ')}
${chalk.cyan('         Build • Test • Simulate • Deploy Move Smart Contracts                 ')}
${chalk.gray('                        Version ' + packageJson.version + '                                        ')}
`;

// Show banner on help
program.on('--help', () => {
  console.log(banner);
});

// Register commands
program
  .command('init <project-name>')
  .description('Create a new Move project with scaffolding')
  .option('-t, --template <type>', 'Project template (default, nft, defi)', 'default')
  .action(initCommand);

program
  .command('build')
  .description('Compile Move smart contracts')
  .option('-p, --path <path>', 'Path to Move project', './move')
  .option('-v, --verbose', 'Verbose output')
  .action(buildCommand);

program
  .command('simulate')
  .description('Simulate a transaction locally (Tenderly-style)')
  .option('-f, --function <name>', 'Function to simulate')
  .option('-a, --args <args...>', 'Function arguments (e.g., u64:100)')
  .option('-s, --sender <address>', 'Sender address')
  .action(simulateCommand);

program
  .command('deploy')
  .description('Deploy Move modules to Movement Network')
  .option('-n, --network <network>', 'Network to deploy to (testnet, devnet, mainnet)', 'testnet')
  .option('-k, --key <path>', 'Path to private key file')
  .option('-m, --module <path>', 'Path to compiled module')
  .action(deployCommand);

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n❌ Unhandled error:'));
  console.error(chalk.red(error.message));
  if (error.stack) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Uncaught exception:'));
  console.error(chalk.red(error.message));
  if (error.stack) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(banner);
  program.outputHelp();
}
