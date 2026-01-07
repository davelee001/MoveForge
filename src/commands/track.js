/**
 * Track oil supply chain events emitted by a Move module
 */

const logger = require('../utils/logger');
const rpc = require('../utils/rpcClient');
const chalk = require('chalk');

/**
 * Normalize Aptos event type to parts
 * Example: 0xabc::oil_supply_chain::DrillingStartedEvent
 */
function parseEventType(typeStr) {
  const parts = typeStr.split('::');
  if (parts.length < 3) return null;
  return {
    address: parts[0],
    module: parts[1],
    name: parts[2]
  };
}

function formatEvent(evt) {
  const parsed = parseEventType(evt.type || '');
  if (!parsed) return `Unknown event: ${JSON.stringify(evt)}`;

  const data = evt.data || {};
  const prefix = `${chalk.gray('[')}${chalk.white(parsed.name)}${chalk.gray(']')}`;

  switch (parsed.name) {
    case 'DrillingStartedEvent':
      return `${prefix} batch ${chalk.cyan(data.batch_id)} — ${chalk.green('drilling started')} at ${chalk.white(data.location)} • qty ${chalk.white(data.quantity)} ${chalk.white(data.unit)}`;
    case 'DrillingCompletedEvent':
      return `${prefix} batch ${chalk.cyan(data.batch_id)} — ${chalk.green('drilling completed')} at ${chalk.white(data.location)}`;
    case 'TransportationEvent':
      return `${prefix} batch ${chalk.cyan(data.batch_id)} — moved ${chalk.white(data.method)} from ${chalk.white(data.from)} → ${chalk.white(data.to)}`;
    case 'RefiningEvent':
      return `${prefix} batch ${chalk.cyan(data.batch_id)} — ${chalk.magenta('refined')} at ${chalk.white(data.refinery)} • output ${chalk.white(data.output_quantity)} ${chalk.white(data.unit)}`;
    case 'DeliveryEvent':
      return `${prefix} batch ${chalk.cyan(data.batch_id)} — ${chalk.blue('delivered')} to ${chalk.white(data.destination)}`;
    default:
      return `${prefix} ${JSON.stringify(data)}`;
  }
}

async function pollEvents(address, { moduleFilter, batchId, intervalMs }) {
  let lastSeenVersion = null;

  logger.info(`Tracking events for account: ${address}`);
  if (moduleFilter) logger.info(`Module filter: ${moduleFilter}`);
  if (batchId) logger.info(`Batch filter: ${batchId}`);

  while (true) {
    try {
      const params = { limit: 50 };
      const txns = await rpc.getAccountTransactions(address, params);

      // Process from oldest to newest
      const ordered = Array.isArray(txns) ? txns.slice().reverse() : [];

      for (const txn of ordered) {
        const version = txn.version;
        if (lastSeenVersion !== null && Number(version) <= Number(lastSeenVersion)) continue;
        const events = txn.events || [];
        for (const evt of events) {
          const parsed = parseEventType(evt.type || '');
          if (!parsed) continue;
          if (moduleFilter && parsed.module !== moduleFilter) continue;
          if (batchId && evt.data?.batch_id !== batchId) continue;
          logger.newLine();
          logger.success(formatEvent(evt));
        }
        lastSeenVersion = version;
      }
    } catch (err) {
      logger.warning(`Polling error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }
}

module.exports = async function trackCommand(opts) {
  const address = opts.address;
  const moduleFilter = opts.module || 'oil_supply_chain';
  const batchId = opts.batch || null;
  const network = opts.network || 'testnet';
  const intervalMs = (opts.interval ? Number(opts.interval) : 5000);

  if (!address) {
    logger.error('Address is required. Use --address <accountAddress>');
    process.exit(1);
  }

  try {
    rpc.setNetwork(network);
  } catch (e) {
    logger.warning(`Unknown network '${network}', defaulting to testnet.`);
  }

  logger.startSpinner('Connecting to RPC and starting tracker...');
  logger.succeedSpinner('Tracker running. Listening for events.');

  await pollEvents(address, { moduleFilter, batchId, intervalMs });
};
