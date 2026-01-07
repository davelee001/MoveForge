# 🔥 MoveForge

### A Next-Generation Developer Framework for the Movement Network

**Where you can Build • Test • Simulate • Deploy Move smart contracts — all from one CLI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

MoveForge is an open-source developer framework designed to dramatically improve developer experience (DevEx) on the Movement Network. Inspired by Hardhat, Foundry, Tenderly, and Create-Next-App, MoveForge provides a unified, beginner-friendly, and powerful workflow for Move smart contract development.

---

## 🎯 Why MoveForge?

Movement currently provides:
- MoveVM + Move compiler
- Testnet & Devnet environments
- RPC endpoints
- Python SDK
- Builder kits and sample contracts

However, the ecosystem **lacks a unified toolchain** that developers can use to:
- ✅ Scaffold projects
- ✅ Compile Move modules
- ✅ Simulate transactions
- ✅ Run tests
- ✅ Deploy to testnet
- ✅ Automate workflows

**MoveForge fills this gap.**

---

## 🚀 Features

### ✅ **1. Create Move project scaffolding**
A single command generates a fully-structured Move dApp project:

```bash
moveforge init myapp
```

Creates:
```
myapp/
 ├── move/
 │    ├── sources/
 │    │    └── HelloMove.move
 │    ├── tests/
 │    └── Move.toml
 ├── scripts/
 ├── build/
 ├── moveforge.config.json
 └── README.md
```

### ✅ **2. Build & compile Move smart contracts**
Wraps the official Move compiler with improved output formatting:

```bash
moveforge build
```

### ✅ **3. Local transaction simulation (Tenderly-style)**
Simulate a contract function call BEFORE sending it to the blockchain:

```bash
moveforge simulate --function initialize --args u64:100
```

Outputs:
- ⛽ Gas estimate
- 💾 Storage changes
- 📊 Pre-state / post-state
- ❌ Error logs (if any)

### ✅ **4. Deploy Move packages (Aptos CLI)**
Publish your Move package using the Aptos CLI under the hood:

```bash
moveforge deploy --network testnet --module ./move
```

Outputs:
- 🔗 Transaction hash (with explorer link)
- 📍 Package address (from CLI output)
- ⛽ Gas used (if provided by CLI)

---

## 📦 Installation

### Prerequisites

1. **Node.js (16+)**
   - Download: https://nodejs.org/

2. **Aptos CLI** (includes Move compiler)
   ```bash
   # macOS/Linux
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   
   # Or using Homebrew
   brew install aptos
   
   # Verify installation
   aptos --version
   ```

3. **Git**
   - Download: https://git-scm.com/

### Install MoveForge

```bash
# Clone the repository
git clone https://github.com/movement/moveforge.git
cd moveforge

# Install dependencies
npm install

# Link globally (optional)
npm link

# Verify installation
moveforge --version
```

---

## 🌐 Web UI

Use a lightweight web interface to run CLI commands from your browser.

Start the server:

```bash
npm run web
# Optional: choose a port
PORT=3001 npm run web
```

Health check endpoint:

```bash
curl http://localhost:3000/health
```

Notes:
- Serves static UI from `public/` and exposes `/api/command` for CLI calls.
- The UI includes a theme toggle and a Networks panel (list/current/add/switch).
- If the port is in use, the server prints a helpful error; try a different `PORT`.

---

## 🧪 Quick Start

### 1. Create a new project

```bash
moveforge init hello-move
cd hello-move
```

### 2. Build the project

```bash
moveforge build
```

### 3. Simulate a function

```bash
moveforge simulate --function initialize
```

### 4. Deploy to testnet

First, set up your account:

```bash
# Initialize Aptos account
aptos init --network testnet

# Fund your account from faucet
# Visit: https://faucet.testnet.porto.movementlabs.xyz
```

Then deploy:

```bash
moveforge deploy --network testnet --key ~/.aptos/config.yaml
```

### 5. View on Explorer

Your deployment will provide a link to view your contract on the Movement Explorer!

---

## 📚 Commands Reference

| Command | Description | Options |
|---------|-------------|---------|
| `moveforge init <name>` | Create project scaffolding | `-t, --template` |
| `moveforge build` | Compile Move modules | `-p, --path`, `-v, --verbose` |
| `moveforge simulate` | Run local execution simulation | `-f, --function`, `-a, --args`, `-s, --sender` |
| `moveforge deploy` | Deploy contract to Movement | `-n, --network`, `-k, --key`, `-m, --module` |
| `moveforge test` | Run Move unit tests | `-p, --path`, `-v, --verbose` |
| `moveforge format` | Format `.move` files | `-p, --path`, `-c, --check` |
| `moveforge lint` | Lint Move code | `-p, --path`, `-f, --fix` |
| `moveforge network <action>` | Manage networks | `--url`, `--chain-id`, `--faucet` |
| `moveforge track` | Monitor oil supply chain events | `-a, --address`, `-m, --module`, `-b, --batch`, `-n, --network`, `-i, --interval` |

### Examples

```bash
# Initialize with template
moveforge init my-nft --template nft

# Build with verbose output
moveforge build --verbose

# Simulate with arguments
moveforge simulate --function mint --args address:0x1 u64:100

# Deploy to devnet
moveforge deploy --network devnet --key ./private-key.yaml
 
# Run tests for a project
moveforge test -p ./move --verbose

# Format Move files (check-only)
moveforge format -p ./move --check

# Lint Move source code
moveforge lint -p ./move

# Manage networks
moveforge network list
moveforge network add movement --url https://aptos.testnet.porto.movementlabs.xyz/v1 --chain-id 43
moveforge network switch movement

# Track oil movement (supply chain)
# Assumes you deployed the test module `oil_supply_chain` from the test-dapp
moveforge track --address 0x<publisher_address> --module oil_supply_chain --batch BATCH-123 --network testnet --interval 3000

# Show all batches for the module
moveforge track --address 0x<publisher_address> --module oil_supply_chain
```

---

## 🏗️ Project Structure

```
your-project/
├── move/
│   ├── sources/          # Move smart contract source files
│   │   └── HelloMove.move
│   ├── tests/            # Move unit tests
│   └── Move.toml         # Move package configuration
├── scripts/              # Deployment and utility scripts
├── build/                # Compiled bytecode (auto-generated)
├── moveforge.config.json # MoveForge configuration
├── .gitignore
└── README.md
```

---

## 🪟 Windows Setup Notes

MoveForge works great on Windows. A few tips:

- Install Node.js 16+ and ensure `node` and `npm` are on PATH.
- Install the Aptos CLI (needed for `build` and `test`):

```powershell
# PowerShell
python --version  # Ensure Python is available
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python
aptos --version   # Verify
```

- If `aptos` is not recognized, add its install directory to PATH or re-open your terminal.
- Commands that do NOT require Aptos CLI: `format`, `lint`, `network`.
- Use PowerShell without piping when testing commands (e.g., `node bin/moveforge.js --help`).

---

## ⚙️ Configuration

The `moveforge.config.json` file contains project settings:

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "networks": {
    "testnet": {
      "rpc": "https://aptos.testnet.porto.movementlabs.xyz/v1",
      "faucet": "https://faucet.testnet.porto.movementlabs.xyz",
      "explorer": "https://explorer.movementnetwork.xyz"
    }
  },
  "compiler": {
    "version": "latest",
    "optimize": true
  },
  "deployment": {
    "defaultNetwork": "testnet",
    "gasLimit": 100000
  }
}
```

---

## 🧠 Design Philosophy

### ⭐ Build Fast
MoveForge is optimized for hackathons, startups, and new Move developers.

### ⭐ Friendly Errors
Move compiler errors are formatted cleanly for humans.

### ⭐ One Ecosystem
MoveForge connects:
- Move compiler
- Movement RPC
- Python SDK
- CLI tools

### ⭐ Extensible
Plugin support planned for v0.2:
- Gas analytics
- Static analysis
- Fuzz testing
- Coverage tools

---

## 🗺️ Roadmap

### v0.1 (Hackathon) ✅
- [x] `init`, `build`, `simulate`, `deploy` commands
- [x] Movement testnet support
- [x] Template system
- [x] Beautiful CLI output

### v0.2 (Coming Soon)
- [ ] Plugin API
- [ ] Test runner integration
- [ ] Automatic contract verification
- [ ] Multi-network support

### v0.3 (Future)
- [ ] Code coverage reports
- [ ] Move linter
- [ ] Debugging UI
- [ ] CI/CD integration

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/movement/moveforge.git
cd moveforge

# Install dependencies
npm install

# Run in development mode
npm start

# Test the CLI
node bin/moveforge.js init test-project
```

---

## 📖 Resources

- **Movement Developer Portal**: https://developer.movementnetwork.xyz/
- **Movement Docs**: https://docs.movementnetwork.xyz/
- **Move Language Book**: https://move-language.github.io/move/
- **Aptos CLI Docs**: https://aptos.dev/tools/aptos-cli/

---

## 💰 Monetization (Freemium Model)

### Free Tier
- CLI is completely free and open-source
- All core features available

### Premium Plugins (Future)
- Contract verifier
- Gas profiler
- Static analyzer
- Multi-sig dev tools

### Enterprise Tier (Future)
- CI/CD integration
- Hosted simulators
- Team dashboards
- Priority support

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for the Movement Network community.

Inspired by:
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Foundry](https://getfoundry.sh/) - Blazing fast Ethereum toolkit
- [Tenderly](https://tenderly.co/) - Smart contract monitoring
- [Create Next App](https://nextjs.org/) - React framework CLI

---

## 🔥 Built with MoveForge

Share your projects built with MoveForge! Open a PR to add your project to this list.

---

<div align="center">

**[Website](https://moveforge.dev)** • **[Documentation](https://docs.moveforge.dev)** • **[Twitter](https://twitter.com/moveforge)** • **[Discord](https://discord.gg/moveforge)**

Made with 🔥 by the Movement community

</div>

