/**
 * File System Utility
 * Helpers for directory creation, file copying, and path operations
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

class FileSystem {
    /**
     * Create a directory if it doesn't exist
     */
    async ensureDir(dirPath) {
        try {
            await fs.ensureDir(dirPath);
            return true;
        } catch (error) {
            logger.error(`Failed to create directory: ${dirPath}`);
            throw error;
        }
    }

    /**
     * Copy a file from source to destination
     */
    async copyFile(src, dest) {
        try {
            await fs.copy(src, dest);
            return true;
        } catch (error) {
            logger.error(`Failed to copy file from ${src} to ${dest}`);
            throw error;
        }
    }

    /**
     * Copy entire directory
     */
    async copyDir(src, dest) {
        try {
            await fs.copy(src, dest);
            return true;
        } catch (error) {
            logger.error(`Failed to copy directory from ${src} to ${dest}`);
            throw error;
        }
    }

    /**
     * Write JSON file
     */
    async writeJson(filePath, data, options = { spaces: 2 }) {
        try {
            await fs.writeJson(filePath, data, options);
            return true;
        } catch (error) {
            logger.error(`Failed to write JSON file: ${filePath}`);
            throw error;
        }
    }

    /**
     * Read JSON file
     */
    async readJson(filePath) {
        try {
            return await fs.readJson(filePath);
        } catch (error) {
            logger.error(`Failed to read JSON file: ${filePath}`);
            throw error;
        }
    }

    /**
     * Write text file
     */
    async writeFile(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf8');
            return true;
        } catch (error) {
            logger.error(`Failed to write file: ${filePath}`);
            throw error;
        }
    }

    /**
     * Read text file
     */
    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            logger.error(`Failed to read file: ${filePath}`);
            throw error;
        }
    }

    /**
     * Check if file or directory exists
     */
    async exists(filePath) {
        try {
            return await fs.pathExists(filePath);
        } catch (error) {
            return false;
        }
    }

    /**
     * Remove file or directory
     */
    async remove(filePath) {
        try {
            await fs.remove(filePath);
            return true;
        } catch (error) {
            logger.error(`Failed to remove: ${filePath}`);
            throw error;
        }
    }

    /**
     * Get absolute path
     */
    getAbsolutePath(relativePath) {
        return path.resolve(process.cwd(), relativePath);
    }

    /**
     * Get template directory path
     */
    getTemplatePath(templateName = '') {
        return path.join(__dirname, '../../templates', templateName);
    }

    /**
     * List files in directory
     */
    async listFiles(dirPath) {
        try {
            return await fs.readdir(dirPath);
        } catch (error) {
            logger.error(`Failed to list files in: ${dirPath}`);
            throw error;
        }
    }

    /**
     * Check if path is a directory
     */
    async isDirectory(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.isDirectory();
        } catch (error) {
            return false;
        }
    }

    /**
     * Get file stats
     */
    async getStats(filePath) {
        try {
            return await fs.stat(filePath);
        } catch (error) {
            logger.error(`Failed to get stats for: ${filePath}`);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new FileSystem();
