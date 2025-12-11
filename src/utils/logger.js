/**
 * Logger Utility
 * Provides colored console output with spinners and formatted messages
 */

const chalk = require('chalk');
const ora = require('ora');

class Logger {
    constructor() {
        this.spinner = null;
    }

    /**
     * Success message with checkmark
     */
    success(message) {
        console.log(chalk.green('✅ ' + message));
    }

    /**
     * Error message with X mark
     */
    error(message) {
        console.error(chalk.red('❌ ' + message));
    }

    /**
     * Warning message with warning symbol
     */
    warning(message) {
        console.warn(chalk.yellow('⚠️  ' + message));
    }

    /**
     * Info message with info symbol
     */
    info(message) {
        console.log(chalk.cyan('ℹ️  ' + message));
    }

    /**
     * Debug message (gray)
     */
    debug(message) {
        console.log(chalk.gray('🔍 ' + message));
    }

    /**
     * Start a spinner with a message
     */
    startSpinner(message) {
        this.spinner = ora({
            text: message,
            color: 'cyan',
            spinner: 'dots'
        }).start();
        return this.spinner;
    }

    /**
     * Update spinner text
     */
    updateSpinner(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }

    /**
     * Stop spinner with success
     */
    succeedSpinner(message) {
        if (this.spinner) {
            this.spinner.succeed(chalk.green(message));
            this.spinner = null;
        }
    }

    /**
     * Stop spinner with failure
     */
    failSpinner(message) {
        if (this.spinner) {
            this.spinner.fail(chalk.red(message));
            this.spinner = null;
        }
    }

    /**
     * Stop spinner with warning
     */
    warnSpinner(message) {
        if (this.spinner) {
            this.spinner.warn(chalk.yellow(message));
            this.spinner = null;
        }
    }

    /**
     * Stop spinner with info
     */
    infoSpinner(message) {
        if (this.spinner) {
            this.spinner.info(chalk.cyan(message));
            this.spinner = null;
        }
    }

    /**
     * Print a section header
     */
    header(message) {
        console.log('\n' + chalk.bold.cyan('═'.repeat(60)));
        console.log(chalk.bold.cyan('  ' + message));
        console.log(chalk.bold.cyan('═'.repeat(60)) + '\n');
    }

    /**
     * Print a subsection
     */
    section(message) {
        console.log('\n' + chalk.bold.white(message));
        console.log(chalk.gray('─'.repeat(40)));
    }

    /**
     * Print formatted error with details
     */
    errorDetail(title, details) {
        console.error(chalk.red.bold('\n❌ ' + title));
        console.error(chalk.red('─'.repeat(60)));
        if (typeof details === 'string') {
            console.error(chalk.red(details));
        } else if (Array.isArray(details)) {
            details.forEach(line => console.error(chalk.red('  ' + line)));
        } else if (typeof details === 'object') {
            console.error(chalk.red(JSON.stringify(details, null, 2)));
        }
        console.error(chalk.red('─'.repeat(60)));
    }

    /**
     * Print key-value pairs
     */
    keyValue(key, value, color = 'white') {
        const colorFn = chalk[color] || chalk.white;
        console.log(chalk.gray('  ' + key + ': ') + colorFn(value));
    }

    /**
     * Print a list
     */
    list(items, symbol = '•') {
        items.forEach(item => {
            console.log(chalk.cyan('  ' + symbol + ' ') + chalk.white(item));
        });
    }

    /**
     * Print a blank line
     */
    newLine() {
        console.log('');
    }

    /**
     * Print Move compiler error with syntax highlighting
     */
    compilerError(error) {
        this.errorDetail('Compilation Error', error);
    }
}

// Export singleton instance
module.exports = new Logger();
