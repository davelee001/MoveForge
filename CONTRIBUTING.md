# Contributing to MoveForge

Thank you for your interest in contributing to MoveForge! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Git
- Aptos CLI (for testing Move compilation)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/moveforge.git
cd moveforge

# Install dependencies
npm install

# Link for local testing
npm link

# Test the CLI
moveforge --version
```

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Test init command
node bin/moveforge.js init test-project

# Test build command
cd test-project
node ../bin/moveforge.js build

# Test other commands
node ../bin/moveforge.js simulate --function initialize
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Code Style Guidelines

### JavaScript Style

- Use `const` and `let`, avoid `var`
- Use async/await instead of callbacks
- Use template literals for string interpolation
- Add JSDoc comments for functions
- Keep functions small and focused

Example:

```javascript
/**
 * Parse command-line arguments
 * @param {string[]} args - Array of arguments
 * @returns {Object} Parsed arguments object
 */
function parseArguments(args) {
  // Implementation
}
```

### File Organization

```
src/
├── commands/       # CLI command implementations
├── utils/          # Utility functions
└── templates/      # Project templates
```

### Error Handling

Always provide helpful error messages:

```javascript
if (!fileExists) {
  logger.error('File not found: ' + filePath);
  logger.info('Please check the file path and try again.');
  process.exit(1);
}
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] `moveforge init <project>` - Creates project structure
- [ ] `moveforge build` - Compiles Move code
- [ ] `moveforge simulate` - Simulates transactions
- [ ] `moveforge deploy` - Shows deployment workflow
- [ ] `moveforge --help` - Displays help
- [ ] `moveforge --version` - Shows version

### Test on Multiple Platforms

If possible, test on:
- Windows
- macOS
- Linux

## 📝 Documentation

### Update Documentation

When adding features:

1. Update `README.md` with new commands/options
2. Add JSDoc comments to functions
3. Update `CONTRIBUTING.md` if workflow changes
4. Add examples in command help text

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include expected output
- Add troubleshooting tips

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug is already reported
2. Test with the latest version
3. Gather reproduction steps

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g., Windows 11]
- Node.js version: [e.g., 18.0.0]
- MoveForge version: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature is already requested
2. Describe the use case
3. Explain why it would be valuable
4. Provide examples if possible

## 🔌 Plugin Development

### Plugin API (Coming in v0.2)

MoveForge will support plugins for extending functionality:

```javascript
// Example plugin structure
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  commands: {
    'my-command': async (options) => {
      // Plugin implementation
    }
  }
};
```

### Plugin Ideas

- Gas optimization analyzer
- Security vulnerability scanner
- Code coverage reporter
- Contract documentation generator
- Multi-signature wallet integration

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Discord**: Join our community server
- **GitHub Issues**: Ask questions or report bugs
- **Documentation**: Check the docs first

## 🎯 Priority Areas

We're especially looking for contributions in:

1. **Testing**: Add automated tests
2. **Documentation**: Improve guides and examples
3. **Templates**: Create project templates (NFT, DeFi, etc.)
4. **Error Messages**: Make errors more helpful
5. **Performance**: Optimize compilation and deployment

## 📅 Release Process

1. Version bump in `package.json`
2. Update CHANGELOG.md
3. Create GitHub release
4. Publish to npm (maintainers only)

## ❓ Questions?

Feel free to:
- Open a GitHub Discussion
- Ask in Discord
- Email: contribute@moveforge.dev

---

Thank you for contributing to MoveForge! 🔥

Together, we're building the best developer experience for the Movement Network.
