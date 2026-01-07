/**
 * RPC Client Utility
 * Wrapper for Movement Network RPC calls
 */

const axios = require('axios');
const logger = require('./logger');

class RPCClient {
    constructor() {
        this.networks = {
            testnet: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
            devnet: 'https://aptos.devnet.porto.movementlabs.xyz/v1',
            mainnet: 'https://mainnet.movementnetwork.xyz/v1' // Placeholder
        };
        this.currentNetwork = 'testnet';
    }

    /**
     * Set the current network
     */
    setNetwork(network) {
        if (!this.networks[network]) {
            throw new Error(`Unknown network: ${network}. Available: ${Object.keys(this.networks).join(', ')}`);
        }
        this.currentNetwork = network;
        logger.info(`Network set to: ${network}`);
    }

    /**
     * Override or add a custom RPC endpoint for a network
     */
    setCustomEndpoint(network, rpcUrl) {
        this.networks[network] = rpcUrl;
        logger.debug(`Configured custom RPC endpoint for ${network}: ${rpcUrl}`);
    }

    /**
     * Get the current RPC endpoint
     */
    getEndpoint() {
        return this.networks[this.currentNetwork];
    }

    /**
     * Make a GET request to the RPC endpoint
     */
    async get(path, params = {}) {
        try {
            const url = `${this.getEndpoint()}${path}`;
            logger.debug(`GET ${url}`);

            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Make a POST request to the RPC endpoint
     */
    async post(path, data = {}) {
        try {
            const url = `${this.getEndpoint()}${path}`;
            logger.debug(`POST ${url}`);

            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get account information
     */
    async getAccount(address) {
        return await this.get(`/accounts/${address}`);
    }

    /**
     * Get account resources
     */
    async getAccountResources(address) {
        return await this.get(`/accounts/${address}/resources`);
    }

    /**
     * Get account modules
     */
    async getAccountModules(address) {
        return await this.get(`/accounts/${address}/modules`);
    }

    /**
     * Submit a transaction
     */
    async submitTransaction(signedTxn) {
        return await this.post('/transactions', signedTxn);
    }

    /**
     * Simulate a transaction
     */
    async simulateTransaction(txn) {
        return await this.post('/transactions/simulate', txn);
    }

    /**
     * Get transaction by hash
     */
    async getTransaction(txnHash) {
        return await this.get(`/transactions/by_hash/${txnHash}`);
    }

    /**
     * Get transactions for an account
     */
    async getAccountTransactions(address, params = {}) {
        // Params can include { limit, start, with_events }
        return await this.get(`/accounts/${address}/transactions`, params);
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txnHash, timeoutMs = 30000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                const txn = await this.getTransaction(txnHash);
                if (txn.success !== undefined) {
                    return txn;
                }
            } catch (error) {
                // Transaction not found yet, continue waiting
            }

            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        throw new Error('Transaction confirmation timeout');
    }

    /**
     * Estimate gas for a transaction
     */
    async estimateGas(txn) {
        try {
            const simulation = await this.simulateTransaction(txn);
            if (simulation && simulation.length > 0) {
                return {
                    gasUsed: simulation[0].gas_used,
                    success: simulation[0].success,
                    vmStatus: simulation[0].vm_status
                };
            }
            throw new Error('Invalid simulation response');
        } catch (error) {
            logger.error('Failed to estimate gas');
            throw error;
        }
    }

    /**
     * Get block explorer URL for transaction
     */
    getExplorerUrl(txnHash) {
        const explorers = {
            testnet: `https://explorer.movementnetwork.xyz/txn/${txnHash}?network=testnet`,
            devnet: `https://explorer.movementnetwork.xyz/txn/${txnHash}?network=devnet`,
            mainnet: `https://explorer.movementnetwork.xyz/txn/${txnHash}`
        };
        return explorers[this.currentNetwork];
    }

    /**
     * Get block explorer URL for account
     */
    getAccountExplorerUrl(address) {
        const explorers = {
            testnet: `https://explorer.movementnetwork.xyz/account/${address}?network=testnet`,
            devnet: `https://explorer.movementnetwork.xyz/account/${address}?network=devnet`,
            mainnet: `https://explorer.movementnetwork.xyz/account/${address}`
        };
        return explorers[this.currentNetwork];
    }

    /**
     * Handle RPC errors
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error
            const status = error.response.status;
            const message = error.response.data?.message || error.response.statusText;

            logger.errorDetail('RPC Error', [
                `Status: ${status}`,
                `Message: ${message}`,
                `Endpoint: ${this.getEndpoint()}`
            ]);

            throw new Error(`RPC Error (${status}): ${message}`);
        } else if (error.request) {
            // Request made but no response
            logger.errorDetail('Network Error', [
                'No response from RPC endpoint',
                `Endpoint: ${this.getEndpoint()}`,
                'Please check your internet connection and network status'
            ]);

            throw new Error('Network error: No response from RPC endpoint');
        } else {
            // Something else happened
            logger.error(`Request error: ${error.message}`);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new RPCClient();
