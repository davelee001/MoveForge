/**
 * Config Utility
 * Loads and provides helpers for moveforge.config.json
 */

const path = require('path');
const fs = require('./fileSystem');
const logger = require('./logger');

class Config {
    /**
     * Load MoveForge config from a given path or from project root.
     * @param {string} [configPath] Optional custom config path
     * @returns {Promise<{ path: string, data: any } | null>}
     */
    async loadConfig(configPath) {
        const resolvedPath = configPath
            ? fs.getAbsolutePath(configPath)
            : fs.getAbsolutePath('moveforge.config.json');

        const exists = await fs.exists(resolvedPath);
        if (!exists) {
            logger.debug(`Config file not found at ${resolvedPath}`);
            return null;
        }

        try {
            const data = await fs.readJson(resolvedPath);
            return { path: resolvedPath, data };
        } catch (error) {
            logger.errorDetail('Invalid configuration file', [
                `Path: ${resolvedPath}`,
                error.message || String(error)
            ]);
            throw error;
        }
    }

    /**
     * Get default network from configuration, if present.
     * @param {any} configData Parsed config JSON
     * @returns {string | null}
     */
    getDefaultNetwork(configData) {
        if (!configData || !configData.deployment) return null;
        return configData.deployment.defaultNetwork || null;
    }

    /**
     * Get network configuration block for a given network name.
     * @param {any} configData Parsed config JSON
     * @param {string} network Network name
     * @returns {any | null}
     */
    getNetworkConfig(configData, network) {
        if (!configData || !configData.networks) return null;
        return configData.networks[network] || null;
    }
}

module.exports = new Config();
