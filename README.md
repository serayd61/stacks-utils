# @serayd61/stacks-utils 🛠️

A comprehensive utility library for Stacks blockchain development. Built with TypeScript for type-safety and developer experience.

[![npm version](https://badge.fury.io/js/@serayd61%2Fstacks-utils.svg)](https://www.npmjs.com/package/@serayd61/stacks-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🏠 **Address Utilities** - Validate, parse, and convert Stacks addresses
- 💰 **Token Formatting** - Format and parse STX, sBTC, and SIP-010 tokens
- 🌐 **API Helpers** - Build URLs and interact with Stacks APIs
- 📊 **Formatting** - Human-readable formatting for blockchain data
- 📜 **Contract Utilities** - Work with Clarity smart contracts
- 📦 **Constants** - Common Stacks blockchain constants

## Installation

```bash
npm install @serayd61/stacks-utils
# or
yarn add @serayd61/stacks-utils
# or
pnpm add @serayd61/stacks-utils
```

## Usage

### Address Utilities

```typescript
import { 
  isValidStacksAddress, 
  parseStacksAddress, 
  shortenAddress,
  getNetworkFromAddress 
} from '@serayd61/stacks-utils';

// Validate an address
isValidStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'); // true
isValidStacksAddress('invalid'); // false

// Parse address details
const info = parseStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
// { address: '...', network: 'mainnet', type: 'single-sig', ... }

// Shorten for display
shortenAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'); 
// 'SP2J6...9EJ7'

// Get network type
getNetworkFromAddress('SP2J6ZY...'); // 'mainnet'
getNetworkFromAddress('ST2J6ZY...'); // 'testnet'
```

### Token Formatting

```typescript
import { 
  microStxToStx, 
  stxToMicroStx, 
  formatStx,
  formatTokenAmount,
  formatSbtc 
} from '@serayd61/stacks-utils';

// Convert between STX and micro-STX
microStxToStx(1000000n); // 1.0
stxToMicroStx(1.5); // 1500000n

// Format with symbol
formatStx(1000000n); // '1 STX'
formatStx(1234567890n); // '1,234.56789 STX'

// Format sBTC
formatSbtc(100000000n); // '1 sBTC'

// Format any SIP-010 token
formatTokenAmount(1000000n, 6, { maxDecimals: 2 }); // '1.00'
```

### API Helpers

```typescript
import { 
  createApiConfig, 
  getAccountInfoUrl, 
  getExplorerTxUrl,
  parseContractId,
  buildContractId 
} from '@serayd61/stacks-utils';

// Create API config
const config = createApiConfig('mainnet');
// { baseUrl: 'https://api.hiro.so', ... }

// Build API URLs
getAccountInfoUrl('SP2J6ZY...', 'mainnet');
// 'https://api.hiro.so/extended/v1/address/SP2J6ZY.../balances'

// Explorer URLs
getExplorerTxUrl('0x123...', 'mainnet');
// 'https://explorer.hiro.so/txid/0x123...'

// Contract ID utilities
parseContractId('SP2J6ZY...PYKKNRV9EJ7.my-contract');
// { address: 'SP2J6ZY...', contractName: 'my-contract' }

buildContractId('SP2J6ZY...', 'my-contract');
// 'SP2J6ZY....my-contract'
```

### Formatting Utilities

```typescript
import { 
  formatBlockHeight,
  formatTxId,
  formatTimestamp,
  formatRelativeTime,
  formatLargeNumber,
  formatUsd 
} from '@serayd61/stacks-utils';

// Block height with thousands separator
formatBlockHeight(150000); // '150,000'

// Shorten transaction ID
formatTxId('0x1234567890abcdef...'); // '0x12345678...abcdef12'

// Format timestamps
formatTimestamp(1703721600); // 'Dec 28, 2024, 12:00 AM'
formatRelativeTime(Date.now() / 1000 - 3600); // '1 hour ago'

// Large numbers
formatLargeNumber(1500000); // '1.50M'
formatLargeNumber(2500000000); // '2.50B'

// USD formatting
formatUsd(1234.56); // '$1,234.56'
```

### Contract Utilities

```typescript
import { 
  isValidContractName,
  toClarityUint,
  toClarityPrincipal,
  toClaritySome,
  implementsSIP010,
  SIP010_FUNCTIONS 
} from '@serayd61/stacks-utils';

// Validate contract name
isValidContractName('my-token'); // true
isValidContractName('123invalid'); // false

// Generate Clarity literals
toClarityUint(1000); // 'u1000'
toClarityPrincipal('SP2J6ZY...'); // "'SP2J6ZY..."
toClaritySome('u100'); // '(some u100)'

// Check SIP implementations
implementsSIP010(contractFunctions); // true/false
```

### Constants

```typescript
import { 
  STX, 
  SBTC, 
  CHAIN_ID, 
  TX_STATUS,
  KNOWN_PROTOCOLS 
} from '@serayd61/stacks-utils';

STX.DECIMALS; // 6
STX.MAX_SUPPLY; // 1818000000000000n
SBTC.SYMBOL; // 'sBTC'
CHAIN_ID.MAINNET; // 1
```

## API Reference

### Address Module

| Function | Description |
|----------|-------------|
| `isValidStacksAddress(address)` | Validates a Stacks address |
| `parseStacksAddress(address)` | Parses address and returns detailed info |
| `shortenAddress(address, start, end)` | Shortens address for display |
| `isMainnetAddress(address)` | Checks if mainnet address |
| `isTestnetAddress(address)` | Checks if testnet address |
| `getNetworkFromAddress(address)` | Gets network type from address |
| `hash160ToAddress(hash, network, type)` | Converts hash160 to address |
| `addressesEqual(a, b)` | Compares two addresses |

### Token Module

| Function | Description |
|----------|-------------|
| `microStxToStx(microStx)` | Converts micro-STX to STX |
| `stxToMicroStx(stx)` | Converts STX to micro-STX |
| `formatTokenAmount(amount, decimals, options)` | Formats token amount |
| `parseTokenAmount(formatted, decimals)` | Parses formatted amount |
| `formatStx(microStx, showSymbol)` | Formats STX with symbol |
| `formatSbtc(sats, showSymbol)` | Formats sBTC with symbol |

### API Module

| Function | Description |
|----------|-------------|
| `createApiConfig(network, customUrl)` | Creates API configuration |
| `buildApiUrl(config, path, params)` | Builds API URL |
| `getAccountInfoUrl(address, network)` | Account info endpoint URL |
| `getTransactionUrl(txId, network)` | Transaction endpoint URL |
| `getExplorerTxUrl(txId, network)` | Explorer transaction URL |
| `getExplorerAddressUrl(address, network)` | Explorer address URL |
| `parseContractId(contractId)` | Parses contract identifier |
| `buildContractId(address, name)` | Builds contract identifier |

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

## License

MIT © [serayd61](https://github.com/serayd61)

## Related Projects

- [Stacks.js](https://github.com/hirosystems/stacks.js) - Official Stacks JavaScript library
- [Stacks Blockchain API](https://github.com/hirosystems/stacks-blockchain-api) - RESTful API for Stacks
- [Clarity Lang](https://clarity-lang.org) - Smart contract language for Stacks

