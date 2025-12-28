/**
 * Stacks Blockchain Constants
 */

// Network chain IDs
export const CHAIN_ID = {
  MAINNET: 1,
  TESTNET: 2147483648,
} as const;

// Block times (in seconds)
export const BLOCK_TIME = {
  TARGET: 600, // 10 minutes target
  MIN: 60,
  MAX: 7200,
} as const;

// STX token constants
export const STX = {
  DECIMALS: 6,
  MICRO_MULTIPLIER: 1_000_000,
  MAX_SUPPLY: 1_818_000_000n * 1_000_000n, // in micro-STX
  SYMBOL: 'STX',
  NAME: 'Stacks',
} as const;

// sBTC constants
export const SBTC = {
  DECIMALS: 8,
  SATS_MULTIPLIER: 100_000_000,
  SYMBOL: 'sBTC',
  NAME: 'Stacks Bitcoin',
  CONTRACT_MAINNET: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
} as const;

// Transaction types
export const TX_TYPES = {
  TOKEN_TRANSFER: 'token_transfer',
  CONTRACT_CALL: 'contract_call',
  SMART_CONTRACT: 'smart_contract',
  COINBASE: 'coinbase',
  POISON_MICROBLOCK: 'poison_microblock',
  TENURE_CHANGE: 'tenure_change',
} as const;

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'abort_by_response',
  DROPPED: 'dropped_replace_by_fee',
} as const;

// Post conditions
export const POST_CONDITION_MODE = {
  ALLOW: 0x01,
  DENY: 0x02,
} as const;

export const POST_CONDITION_TYPE = {
  STX: 0x00,
  FUNGIBLE: 0x01,
  NON_FUNGIBLE: 0x02,
} as const;

// Clarity value types
export const CLARITY_TYPES = {
  INT: 0x00,
  UINT: 0x01,
  BUFFER: 0x02,
  BOOL_TRUE: 0x03,
  BOOL_FALSE: 0x04,
  PRINCIPAL_STANDARD: 0x05,
  PRINCIPAL_CONTRACT: 0x06,
  RESPONSE_OK: 0x07,
  RESPONSE_ERR: 0x08,
  OPTIONAL_NONE: 0x09,
  OPTIONAL_SOME: 0x0a,
  LIST: 0x0b,
  TUPLE: 0x0c,
  STRING_ASCII: 0x0d,
  STRING_UTF8: 0x0e,
} as const;

// Common error codes
export const COMMON_ERRORS = {
  ERR_NOT_AUTHORIZED: 'u1',
  ERR_NOT_FOUND: 'u2',
  ERR_ALREADY_EXISTS: 'u3',
  ERR_INVALID_AMOUNT: 'u4',
  ERR_INSUFFICIENT_BALANCE: 'u5',
  ERR_TRANSFER_FAILED: 'u6',
  ERR_INVALID_PRINCIPAL: 'u7',
  ERR_CONTRACT_PAUSED: 'u8',
} as const;

// Known protocols
export const KNOWN_PROTOCOLS = {
  ALEX: {
    name: 'ALEX Lab',
    website: 'https://alexlab.co',
  },
  VELAR: {
    name: 'Velar',
    website: 'https://velar.co',
  },
  STACKSWAP: {
    name: 'StackSwap',
    website: 'https://stackswap.org',
  },
  ARKADIKO: {
    name: 'Arkadiko',
    website: 'https://arkadiko.finance',
  },
  ZEST: {
    name: 'Zest Protocol',
    website: 'https://zestprotocol.com',
  },
  STXCITY: {
    name: 'STX.city',
    website: 'https://stx.city',
  },
} as const;

// Bitcoin halving schedule (affects STX emissions)
export const HALVING_SCHEDULE = {
  BLOCKS_PER_HALVING: 210_000,
  INITIAL_BLOCK_REWARD: 1000, // STX
} as const;

