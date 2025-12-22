/**
 * Test Command - Run Move unit tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');

async function testCommand(options = {}) {
  const projectPath = options.path || './move';
  const verbose = options.verbose || false;

  console.log(chalk.cyan('🧪 Running Move unit tests...\n'));

  // Check if Move.toml exists
  const moveTomlPath = path.join(projectPath, 'Move.toml');
  if (!fs.existsSync(moveTomlPath)) {
    console.error(chalk.red('❌ Error: Move.toml not found in'), chalk.yellow(projectPath));
    console.error(chalk.gray('   Make sure you are in a Move project directory or use --path option'));
    process.exit(1);
  }

  const spinner = ora('Running tests...').start();

  try {
    // Run Move test command
    const testProcess = spawn('aptos', ['move', 'test', '--package-dir', projectPath], {
      stdio: verbose ? 'inherit' : 'pipe'
    });

    let stdout = '';
    let stderr = '';

    if (!verbose) {
      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    testProcess.on('close', (code) => {
      spinner.stop();

      if (code === 0) {
        console.log(chalk.green('✅ All tests passed!'));
        
        if (!verbose && stdout) {
          // Parse and display test results nicely
          const lines = stdout.split('\n');
          let testResults = [];
          let currentModule = '';
          
          lines.forEach(line => {
            if (line.includes('Running Move unit tests')) {
              return;
            }
            if (line.includes('[ PASS    ]') || line.includes('[ FAIL    ]')) {
              testResults.push(line);
            }
            if (line.includes('Test result:')) {
              testResults.push(line);
            }
          });

          if (testResults.length > 0) {
            console.log('\n' + chalk.cyan('📊 Test Results:'));
            testResults.forEach(result => {
              if (result.includes('[ PASS    ]')) {
                console.log(chalk.green('  ✓ ' + result.replace('[ PASS    ]', '').trim()));
              } else if (result.includes('[ FAIL    ]')) {
                console.log(chalk.red('  ✗ ' + result.replace('[ FAIL    ]', '').trim()));
              } else if (result.includes('Test result:')) {
                console.log(chalk.blue('  ' + result.trim()));
              }
            });
          }
        }
      } else {
        console.log(chalk.red('❌ Tests failed!'));
        
        if (!verbose && stderr) {
          console.log('\n' + chalk.yellow('Error details:'));
          console.log(chalk.gray(stderr));
        }
        
        process.exit(code);
      }
    });

    testProcess.on('error', (error) => {
      spinner.stop();
      
      if (error.code === 'ENOENT') {
        console.error(chalk.red('❌ Error: Aptos CLI not found'));
        console.error(chalk.gray('   Please install the Aptos CLI first:'));
        console.error(chalk.blue('   https://aptos.dev/tools/aptos-cli/install-cli/'));
      } else {
        console.error(chalk.red('❌ Error running tests:'), error.message);
      }
      
      process.exit(1);
    });

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ Unexpected error:'), error.message);
    process.exit(1);
  }
}

module.exports = testCommand;