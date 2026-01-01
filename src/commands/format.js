/**
 * Format Command - Format Move code files
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

async function formatCommand(options = {}) {
  const projectPath = options.path || './move';
  const check = options.check || false;
  
  console.log(chalk.cyan('🎨 Formatting Move code files...\n'));

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

  const spinner = ora('Scanning Move files...').start();

  try {
    // Find all .move files
    const moveFiles = findMoveFiles(sourcesPath);
    
    if (moveFiles.length === 0) {
      spinner.stop();
      console.log(chalk.yellow('⚠️  No .move files found'));
      return;
    }

    spinner.text = `Formatting ${moveFiles.length} Move files...`;

    let formattedCount = 0;
    let errors = [];

    for (const file of moveFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const formatted = formatMoveCode(content);
        
        if (content !== formatted) {
          if (check) {
            console.log(chalk.yellow(`  📝 ${path.relative(process.cwd(), file)} needs formatting`));
          } else {
            fs.writeFileSync(file, formatted);
            formattedCount++;
          }
        }
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }

    spinner.stop();

    if (check) {
      if (formattedCount === 0 && errors.length === 0) {
        console.log(chalk.green('✅ All files are properly formatted!'));
      } else {
        console.log(chalk.yellow(`📝 ${formattedCount} files need formatting`));
        process.exit(1);
      }
    } else {
      if (formattedCount > 0) {
        console.log(chalk.green(`✅ Formatted ${formattedCount} files!`));
      } else {
        console.log(chalk.green('✅ All files were already formatted!'));
      }
    }

    if (errors.length > 0) {
      console.log(chalk.red(`\n❌ ${errors.length} files had errors:`));
      errors.forEach(({ file, error }) => {
        console.log(chalk.red(`  ${path.relative(process.cwd(), file)}: ${error}`));
      });
    }

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ Error formatting files:'), error.message);
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

function formatMoveCode(content) {
  // Basic Move code formatting rules
  let formatted = content;

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Remove trailing whitespace
  formatted = formatted.replace(/[ \t]+$/gm, '');

  // Ensure single blank line at end of file
  formatted = formatted.replace(/\n*$/, '\n');

  // Fix spacing around operators
  formatted = formatted.replace(/([a-zA-Z0-9_)]) *([+\-*/%=<>!&|]) *([a-zA-Z0-9_(])/g, '$1 $2 $3');

  // Fix spacing around commas
  formatted = formatted.replace(/,([^ \n])/g, ', $1');

  // Fix spacing around semicolons
  formatted = formatted.replace(/;([^ \n}])/g, '; $1');

  // Fix spacing in function parameters
  formatted = formatted.replace(/\( */g, '(');
  formatted = formatted.replace(/ *\)/g, ')');

  // Fix brace formatting
  formatted = formatted.replace(/\{\s*\n\s*\n/g, '{\n');
  formatted = formatted.replace(/\n\s*\n\s*\}/g, '\n}');

  // Fix indentation (convert tabs to 4 spaces)
  formatted = formatted.replace(/\t/g, '    ');

  // Normalize multiple blank lines to single
  formatted = formatted.replace(/\n\n\n+/g, '\n\n');

  return formatted;
}

module.exports = formatCommand;