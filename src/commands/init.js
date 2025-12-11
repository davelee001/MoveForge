/**
 * Init Command
 * Creates a new Move project with scaffolding
 */

const path = require('path');
const inquirer = require('inquirer');
const logger = require('../utils/logger');
const fs = require('../utils/fileSystem');

async function initCommand(projectName, options) {
    try {
        logger.header('🔥 MoveForge Project Initialization');

        const projectPath = fs.getAbsolutePath(projectName);

        // Check if directory already exists
        const exists = await fs.exists(projectPath);
        if (exists) {
            logger.error(`Directory "${projectName}" already exists!`);
            process.exit(1);
        }

        // Start spinner
        logger.startSpinner('Creating project structure...');

        // Create project directories
        await fs.ensureDir(projectPath);
        await fs.ensureDir(path.join(projectPath, 'move'));
        await fs.ensureDir(path.join(projectPath, 'move', 'sources'));
        await fs.ensureDir(path.join(projectPath, 'move', 'tests'));
        await fs.ensureDir(path.join(projectPath, 'scripts'));
        await fs.ensureDir(path.join(projectPath, 'build'));

        logger.updateSpinner('Creating configuration files...');

        // Create Move.toml
        const moveToml = generateMoveToml(projectName);
        await fs.writeFile(path.join(projectPath, 'move', 'Move.toml'), moveToml);

        // Create sample Move contract
        const sampleContract = generateSampleContract(projectName);
        await fs.writeFile(
            path.join(projectPath, 'move', 'sources', 'HelloMove.move'),
            sampleContract
        );

        // Create moveforge.config.json
        const config = generateConfig(projectName);
        await fs.writeJson(path.join(projectPath, 'moveforge.config.json'), config);

        // Create README.md
        const readme = generateReadme(projectName);
        await fs.writeFile(path.join(projectPath, 'README.md'), readme);

        // Create .gitignore
        const gitignore = generateGitignore();
        await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

        logger.succeedSpinner('Project created successfully!');

        // Display success message
        logger.newLine();
        logger.success(`Project "${projectName}" has been created!`);
        logger.newLine();

        logger.section('📁 Project Structure');
        logger.list([
            `${projectName}/`,
            `  ├── move/`,
            `  │   ├── sources/`,
            `  │   │   └── HelloMove.move`,
            `  │   ├── tests/`,
            `  │   └── Move.toml`,
            `  ├── scripts/`,
            `  ├── build/`,
            `  ├── moveforge.config.json`,
            `  └── README.md`
        ], '');

        logger.newLine();
        logger.section('🚀 Next Steps');
        logger.list([
            `cd ${projectName}`,
            `moveforge build`,
            `moveforge simulate --function hello`,
            `moveforge deploy --network testnet`
        ], '→');

        logger.newLine();
        logger.info('Happy building! 🔥');
        logger.newLine();

    } catch (error) {
        logger.failSpinner('Failed to create project');
        logger.error(error.message);
        process.exit(1);
    }
}

/**
 * Generate Move.toml content
 */
function generateMoveToml(projectName) {
    return `[package]
name = "${projectName}"
version = "0.1.0"
authors = ["Your Name <your.email@example.com>"]

[addresses]
${projectName} = "_"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "main" }
AptosStdlib = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-stdlib", rev = "main" }
MoveStdlib = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/move-stdlib", rev = "main" }

[dev-dependencies]
`;
}

/**
 * Generate sample Move contract
 */
function generateSampleContract(projectName) {
    const moduleName = projectName.replace(/-/g, '_');
    return `module ${projectName}::hello_move {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;

    /// Resource that stores a greeting message
    struct Greeting has key {
        message: String,
        counter: u64,
    }

    /// Event emitted when greeting is updated
    struct GreetingEvent has drop, store {
        message: String,
        counter: u64,
    }

    /// Initialize the module with a default greeting
    public entry fun initialize(account: &signer) {
        let greeting = Greeting {
            message: string::utf8(b"Hello, Movement Network!"),
            counter: 0,
        };
        move_to(account, greeting);
    }

    /// Update the greeting message
    public entry fun set_greeting(account: &signer, new_message: String) acquires Greeting {
        let account_addr = signer::address_of(account);
        let greeting = borrow_global_mut<Greeting>(account_addr);
        greeting.message = new_message;
        greeting.counter = greeting.counter + 1;

        // Emit event
        event::emit(GreetingEvent {
            message: new_message,
            counter: greeting.counter,
        });
    }

    /// Get the current greeting message
    #[view]
    public fun get_greeting(account_addr: address): (String, u64) acquires Greeting {
        let greeting = borrow_global<Greeting>(account_addr);
        (greeting.message, greeting.counter)
    }

    #[test(account = @${projectName})]
    public fun test_greeting(account: &signer) acquires Greeting {
        initialize(account);
        let addr = signer::address_of(account);
        let (message, counter) = get_greeting(addr);
        assert!(counter == 0, 0);
        
        set_greeting(account, string::utf8(b"Hello, MoveForge!"));
        let (new_message, new_counter) = get_greeting(addr);
        assert!(new_counter == 1, 1);
    }
}
`;
}

/**
 * Generate moveforge.config.json
 */
function generateConfig(projectName) {
    return {
        name: projectName,
        version: "0.1.0",
        networks: {
            testnet: {
                rpc: "https://aptos.testnet.porto.movementlabs.xyz/v1",
                faucet: "https://faucet.testnet.porto.movementlabs.xyz",
                explorer: "https://explorer.movementnetwork.xyz"
            },
            devnet: {
                rpc: "https://aptos.devnet.porto.movementlabs.xyz/v1",
                faucet: "https://faucet.devnet.porto.movementlabs.xyz",
                explorer: "https://explorer.movementnetwork.xyz"
            }
        },
        compiler: {
            version: "latest",
            optimize: true
        },
        deployment: {
            defaultNetwork: "testnet",
            gasLimit: 100000
        }
    };
}

/**
 * Generate README.md
 */
function generateReadme(projectName) {
    return `# ${projectName}

A Move smart contract project built with MoveForge.

## 🚀 Quick Start

### Build the project
\`\`\`bash
moveforge build
\`\`\`

### Simulate a transaction
\`\`\`bash
moveforge simulate --function initialize
\`\`\`

### Deploy to testnet
\`\`\`bash
moveforge deploy --network testnet
\`\`\`

## 📁 Project Structure

- \`move/sources/\` - Move smart contract source files
- \`move/tests/\` - Move unit tests
- \`scripts/\` - Deployment and utility scripts
- \`build/\` - Compiled bytecode (generated)

## 📚 Resources

- [Movement Network Docs](https://docs.movementnetwork.xyz/)
- [Move Language Book](https://move-language.github.io/move/)
- [MoveForge Documentation](https://github.com/movement/moveforge)

## 🔥 Built with MoveForge

MoveForge is a Next-Generation Developer Framework for the Movement Network.
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore() {
    return `# Build outputs
build/
*.mv
*.mvt

# Node modules
node_modules/

# Environment files
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;
}

module.exports = initCommand;
