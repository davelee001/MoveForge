/**
 * Lint Command - Static analysis and best practices for Move code
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function lintCommand(options = {}) {
  const projectPath = options.path || './move';
  const fix = options.fix || false;
  
  console.log(chalk.cyan('🔍 Linting Move code...\n'));

  // Check if Move project exists
  const moveTomlPath = path.join(projectPath, 'Move.toml');
  if (!fs.existsSync(moveTomlPath)) {
    console.error(chalk.red('❌ Error: Move.toml not found in'), chalk.yellow(projectPath));
    console.error(chalk.gray('   Make sure you are in a Move project directory or use --path option'));
    process.exit(1);
  }

  const sourcesPath = path.join(projectPath, 'sources');
  if (!fs.existsSync(sourcesPath)) {
    console.error(chalk.red('❌ Error: sources directory not found'));
    process.exit(1);
  }

  const spinner = ora('Analyzing Move files...').start();

  try {
    // Find all .move files
    const moveFiles = findMoveFiles(sourcesPath);
    
    if (moveFiles.length === 0) {
      spinner.stop();
      console.log(chalk.yellow('⚠️  No .move files found'));
      return;
    }

    spinner.text = `Linting ${moveFiles.length} Move files...`;

    let issues = [];

    for (const file of moveFiles) {
      const fileIssues = lintMoveFile(file);
      issues.push(...fileIssues);
    }

    spinner.stop();

    if (issues.length === 0) {
      console.log(chalk.green('✅ No lint issues found!'));
      return;
    }

    // Group issues by file
    const issuesByFile = {};
    issues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });

    console.log(chalk.yellow(`\n🔍 Found ${issues.length} lint issues:\n`));

    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
      console.log(chalk.blue(`📁 ${path.relative(process.cwd(), file)}`));
      
      fileIssues.forEach(issue => {
        const severity = issue.severity === 'error' ? chalk.red('ERROR') : 
                        issue.severity === 'warning' ? chalk.yellow('WARN') : 
                        chalk.gray('INFO');
        
        console.log(`  ${severity} Line ${issue.line}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(chalk.gray(`       💡 ${issue.suggestion}`));
        }
      });
      console.log();
    });

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    console.log(chalk.gray(`Summary: ${errorCount} errors, ${warningCount} warnings, ${infoCount} info`));

    if (errorCount > 0) {
      process.exit(1);
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ Error linting files:'), error.message);
    process.exit(1);
  }
}

function findMoveFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMoveFiles(fullPath));
    } else if (item.endsWith('.move')) {
      files.push(fullPath);
    }
  }

  return files;
}

function lintMoveFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for common issues
    
    // 1. Trailing whitespace
    if (line.match(/\s+$/)) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'info',
        message: 'Trailing whitespace',
        suggestion: 'Remove trailing spaces'
      });
    }

    // 2. Mixed tabs and spaces
    if (line.includes('\t') && line.includes('    ')) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'warning',
        message: 'Mixed tabs and spaces',
        suggestion: 'Use consistent indentation (4 spaces recommended)'
      });
    }

    // 3. Long lines (over 100 characters)
    if (line.length > 100) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'info',
        message: `Line too long (${line.length} > 100 characters)`,
        suggestion: 'Consider breaking into multiple lines'
      });
    }

    // 4. Missing space after keywords
    if (line.match(/\b(if|while|for)\(/)) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'info',
        message: 'Missing space after keyword',
        suggestion: 'Add space after control flow keywords'
      });
    }

    // 5. Unsafe borrowing patterns
    if (line.includes('borrow_global_mut') && !line.includes('exists')) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'warning',
        message: 'Unsafe borrowing without existence check',
        suggestion: 'Use exists<T>() before borrow_global_mut<T>()'
      });
    }

    // 6. Unhandled abort codes
    if (line.includes('abort ') && line.match(/abort \d+/)) {
      issues.push({
        file: filepath,
        line: lineNumber,
        severity: 'info',
        message: 'Magic number abort code',
        suggestion: 'Consider defining error constants'
      });
    }

    // 7. Missing documentation for public functions
    if (line.includes('public fun ') || line.includes('public entry fun ')) {
      const prevLine = index > 0 ? lines[index - 1] : '';
      if (!prevLine.includes('///') && !prevLine.includes('/**')) {
        issues.push({
          file: filepath,
          line: lineNumber,
          severity: 'info',
          message: 'Public function missing documentation',
          suggestion: 'Add /// documentation comment'
        });
      }
    }

    // 8. Unused function parameters
    if (line.includes('fun ') && line.includes('_')) {
      const match = line.match(/fun\s+\w+\s*\([^)]*\b_\w*\b[^)]*/);
      if (match) {
        issues.push({
          file: filepath,
          line: lineNumber,
          severity: 'info',
          message: 'Unused function parameter',
          suggestion: 'Remove unused parameter or use #[allow(unused_variable)]'
        });
      }
    }
  });

  return issues;
}

module.exports = lintCommand;