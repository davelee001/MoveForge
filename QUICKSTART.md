# MoveForge Quick Reference

## 🚀 Installation

```bash
# Clone and setup
git clone https://github.com/movement/moveforge.git
cd moveforge
npm install
npm link  # Optional: for global access
```

## 📋 Commands

### Create New Project
```bash
moveforge init <project-name>
```

### Build Project
```bash
moveforge build [options]

Options:
  -p, --path <path>    Path to Move project (default: "./move")
  -v, --verbose        Verbose output
```

### Simulate Transaction
```bash
moveforge simulate [options]

Options:
  -f, --function <name>    Function to simulate
  -a, --args <args...>     Function arguments (e.g., u64:100)
  -s, --sender <address>   Sender address

Example:
  moveforge simulate --function initialize
  moveforge simulate --function mint --args u64:100 address:0x1
```

### Deploy to Network
```bash
moveforge deploy [options]

Options:
  -n, --network <network>  Network (testnet, devnet, mainnet)
  -k, --key <path>         Path to private key file
  -m, --module <path>      Path to compiled module

Example:
  moveforge deploy --network testnet --key ~/.aptos/config.yaml
```

## 🎯 Quick Start Workflow

```bash
# 1. Create project
moveforge init my-dapp

# 2. Navigate to project
cd my-dapp

# 3. Build
moveforge build

# 4. Simulate
moveforge simulate --function initialize

# 5. Deploy
moveforge deploy --network testnet --key ~/.aptos/config.yaml
```

## 📁 Project Structure

```
your-project/
├── move/
│   ├── sources/          # Move smart contracts
│   ├── tests/            # Move unit tests
│   └── Move.toml         # Package config
├── scripts/              # Utility scripts
├── build/                # Compiled bytecode
├── moveforge.config.json # MoveForge config
└── README.md
```

## ⚙️ Configuration (moveforge.config.json)

```json
{
  "name": "project-name",
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

## 🔧 Prerequisites

### Required
- **Node.js 16+**: https://nodejs.org/
- **Aptos CLI**: 
  ```bash
  curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
  # or
  brew install aptos
  ```

### For Deployment
1. Create account:
   ```bash
   aptos init --network testnet
   ```

2. Fund account:
   Visit: https://faucet.testnet.porto.movementlabs.xyz

3. Verify:
   ```bash
   aptos account list
   ```

## 🎨 Argument Types

When using `--args` flag:

| Type | Format | Example |
|------|--------|---------|
| u8/u64/u128 | `type:value` | `u64:100` |
| bool | `bool:value` | `bool:true` |
| address | `address:value` | `address:0x1` |
| string | `string:value` | `string:hello` |

## 🌐 Networks

| Network | RPC Endpoint |
|---------|--------------|
| Testnet | https://aptos.testnet.porto.movementlabs.xyz/v1 |
| Devnet | https://aptos.devnet.porto.movementlabs.xyz/v1 |

## 📚 Resources

- **Movement Docs**: https://docs.movementnetwork.xyz/
- **Move Book**: https://move-language.github.io/move/
- **Aptos CLI**: https://aptos.dev/tools/aptos-cli/
- **Explorer**: https://explorer.movementnetwork.xyz

## 💡 Tips

- Use `--verbose` flag for detailed output
- Check `moveforge --help` for all options
- Sample contracts are in `move/sources/`
- Build before deploying
- Simulate before deploying to save gas

## 🐛 Troubleshooting

### "Move compiler not found"
Install Aptos CLI:
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### "Directory already exists"
Choose a different project name or remove existing directory

### "Build directory not found"
Run `moveforge build` before deploying

### "No private key provided"
Use `--key` flag with path to your Aptos config:
```bash
moveforge deploy --network testnet --key ~/.aptos/config.yaml
```

## 🔥 Built with MoveForge

Share your projects! Open a PR to add your dApp to the showcase.

---

**Version**: 0.1.0  
**License**: MIT  
**Website**: https://moveforge.dev
