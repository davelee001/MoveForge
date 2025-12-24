/**
 * Network Command - Manage blockchain networks
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const configUtil = require('../utils/config');

async function networkCommand(action, name, options = {}) {
  switch (action) {
    case 'list':
      return await listNetworks();
    case 'add':
      return await addNetwork(name, options);
    case 'remove':
      return await removeNetwork(name);
    case 'switch':
      return await switchNetwork(name);
    case 'current':
      return await showCurrentNetwork();
    default:
      console.log(chalk.red('❌ Unknown network action:'), action);
      console.log(chalk.gray('   Available actions: list, add, remove, switch, current'));
      process.exit(1);
  }
}

async function listNetworks() {
  console.log(chalk.cyan('🌐 Available Networks:\n'));

  const loaded = await configUtil.loadConfig();
  const config = loaded?.data || {};
  const currentDefault = configUtil.getDefaultNetwork(config) || 'testnet';

  if (!config.networks || Object.keys(config.networks).length === 0) {
    console.log(chalk.yellow('⚠️  No networks configured'));
    console.log(chalk.gray('   Add a network with: moveforge network add <name> --url <rpc-url>'));
    return;
  }

  Object.entries(config.networks).forEach(([name, network]) => {
    const isCurrent = name === currentDefault;
    const marker = isCurrent ? chalk.green('●') : chalk.gray('○');
    const nameDisplay = isCurrent ? chalk.green.bold(name) : chalk.white(name);
    
    console.log(`${marker} ${nameDisplay}`);
    console.log(`  ${chalk.gray('RPC:')} ${network.rpc || network.rpcUrl}`);
    console.log(`  ${chalk.gray('Chain ID:')} ${network.chain_id || network.chainId || 'auto'}`);
    if (network.faucet || network.faucetUrl) {
      console.log(`  ${chalk.gray('Faucet:')} ${network.faucet || network.faucetUrl}`);
    }
    console.log();
  });
}

async function addNetwork(name, options) {
  if (!name) {
    console.error(chalk.red('❌ Error: Network name is required'));
    console.error(chalk.gray('   Usage: moveforge network add <name> --url <rpc-url>'));
    process.exit(1);
  }

  let rpcUrl = options.url;
  let chainId = options.chainId;
  let faucetUrl = options.faucet;

  // Interactive mode if URL not provided
  if (!rpcUrl) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'rpcUrl',
        message: 'RPC URL:',
        validate: (input) => {
          if (!input.startsWith('http://') && !input.startsWith('https://')) {
            return 'Please enter a valid HTTP/HTTPS URL';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'chainId',
        message: 'Chain ID (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'faucetUrl',
        message: 'Faucet URL (optional):',
        default: ''
      }
    ]);

    rpcUrl = answers.rpcUrl;
    chainId = answers.chainId;
    faucetUrl = answers.faucetUrl;
  }

  const loaded = await configUtil.loadConfig();
  const configPath = loaded?.path || path.join(process.cwd(), 'moveforge.config.json');
  const config = loaded?.data || {};
  
  if (!config.networks) {
    config.networks = {};
  }

  config.networks[name] = {
    rpc: rpcUrl,
    ...(chainId && { chain_id: parseInt(chainId) || chainId }),
    ...(faucetUrl && { faucet: faucetUrl })
  };

  // Preserve default network if not set
  if (!config.deployment) config.deployment = {};
  if (!config.deployment.defaultNetwork) config.deployment.defaultNetwork = 'testnet';

  // Save config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`✅ Network '${name}' added successfully!`));
  console.log(chalk.gray(`   RPC URL: ${rpcUrl}`));
  if (chainId) console.log(chalk.gray(`   Chain ID: ${chainId}`));
  if (faucetUrl) console.log(chalk.gray(`   Faucet: ${faucetUrl}`));
}

async function removeNetwork(name) {
  if (!name) {
    console.error(chalk.red('❌ Error: Network name is required'));
    console.error(chalk.gray('   Usage: moveforge network remove <name>'));
    process.exit(1);
  }

  const config = configUtil.loadConfig();
  
  if (!config.networks || !config.networks[name]) {
    console.error(chalk.red(`❌ Error: Network '${name}' not found`));
    process.exit(1);
  }

  // Confirm deletion
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove network '${name}'?`,
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.gray('Cancelled.'));
    return;
  }

  delete config.networks[name];

  // If this was the default network, reset to first available
  if (config.defaultNetwork === name) {
    const remainingNetworks = Object.keys(config.networks);
    config.defaultNetwork = remainingNetworks.length > 0 ? remainingNetworks[0] : 'testnet';
  }

  // Save config
  const configPath = path.join(process.cwd(), 'moveforge.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`✅ Network '${name}' removed successfully!`));
}

async function switchNetwork(name) {
  if (!name) {
    console.error(chalk.red('❌ Error: Network name is required'));
    console.error(chalk.gray('   Usage: moveforge network switch <name>'));
    process.exit(1);
  }

  const config = configUtil.loadConfig();
  
  if (!config.networks || !config.networks[name]) {
    console.error(chalk.red(`❌ Error: Network '${name}' not found`));
    console.log(chalk.gray('   Available networks:'));
    if (config.networks) {
      Object.keys(config.networks).forEach(net => {
        console.log(chalk.gray(`     ${net}`));
      });
    }
    process.exit(1);
  }

  config.defaultNetwork = name;

  // Save config
  const configPath = path.join(process.cwd(), 'moveforge.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`✅ Switched to network '${name}'`));
  console.log(chalk.gray(`   RPC URL: ${config.networks[name].rpcUrl}`));
}

async function showCurrentNetwork() {
  console.log(chalk.cyan('🌐 Current Network:\n'));

  const config = configUtil.loadConfig();
  const currentDefault = configUtil.getDefaultNetwork();
  const networkConfig = configUtil.getNetworkConfig(currentDefault);

  console.log(chalk.green.bold(currentDefault));
  console.log(`  ${chalk.gray('RPC:')} ${networkConfig.rpcUrl}`);
  console.log(`  ${chalk.gray('Chain ID:')} ${networkConfig.chainId || 'auto'}`);
  if (networkConfig.faucetUrl) {
    console.log(`  ${chalk.gray('Faucet:')} ${networkConfig.faucetUrl}`);
  }
}

module.exports = networkCommand;