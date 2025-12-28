/**
 * Contract Utilities
 * Functions for working with Clarity smart contracts
 */

export interface ClarityFunctionArg {
  name: string;
  type: string;
}

export interface ClarityFunction {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: ClarityFunctionArg[];
  outputs: { type: string };
}

/**
 * Common SIP-010 function signatures
 */
export const SIP010_FUNCTIONS = {
  TRANSFER: 'transfer',
  GET_NAME: 'get-name',
  GET_SYMBOL: 'get-symbol',
  GET_DECIMALS: 'get-decimals',
  GET_BALANCE: 'get-balance',
  GET_TOTAL_SUPPLY: 'get-total-supply',
  GET_TOKEN_URI: 'get-token-uri',
} as const;

/**
 * Common SIP-009 (NFT) function signatures
 */
export const SIP009_FUNCTIONS = {
  TRANSFER: 'transfer',
  GET_OWNER: 'get-owner',
  GET_LAST_TOKEN_ID: 'get-last-token-id',
  GET_TOKEN_URI: 'get-token-uri',
} as const;

/**
 * Validates a contract name
 * @param name - Contract name to validate
 */
export function isValidContractName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  // Contract names can contain letters, numbers, and hyphens
  // Must start with a letter, max 128 chars
  const regex = /^[a-zA-Z][a-zA-Z0-9-]*$/;
  return regex.test(name) && name.length <= 128;
}

/**
 * Validates a Clarity function name
 * @param name - Function name to validate
 */
export function isValidFunctionName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  // Function names follow similar rules to contract names
  const regex = /^[a-zA-Z][a-zA-Z0-9-]*$/;
  return regex.test(name) && name.length <= 128;
}

/**
 * Generates a Clarity principal literal
 * @param address - Stacks address
 * @param contractName - Optional contract name
 */
export function toClarityPrincipal(address: string, contractName?: string): string {
  if (contractName) {
    return `'${address}.${contractName}`;
  }
  return `'${address}`;
}

/**
 * Generates a Clarity uint literal
 * @param value - Numeric value
 */
export function toClarityUint(value: number | bigint | string): string {
  return `u${value}`;
}

/**
 * Generates a Clarity int literal
 * @param value - Numeric value
 */
export function toClarityInt(value: number | bigint | string): string {
  return String(value);
}

/**
 * Generates a Clarity bool literal
 * @param value - Boolean value
 */
export function toClarityBool(value: boolean): string {
  return value ? 'true' : 'false';
}

/**
 * Generates a Clarity buff literal
 * @param hex - Hex string (with or without 0x prefix)
 */
export function toClarityBuff(hex: string): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  return `0x${cleaned}`;
}

/**
 * Generates a Clarity string-ascii literal
 * @param str - String value
 */
export function toClarityStringAscii(str: string): string {
  return `"${str}"`;
}

/**
 * Generates a Clarity string-utf8 literal
 * @param str - String value
 */
export function toClarityStringUtf8(str: string): string {
  return `u"${str}"`;
}

/**
 * Generates a Clarity optional none
 */
export function toClarityNone(): string {
  return 'none';
}

/**
 * Generates a Clarity optional some
 * @param value - The value to wrap
 */
export function toClaritySome(value: string): string {
  return `(some ${value})`;
}

/**
 * Generates a Clarity ok response
 * @param value - The value to wrap
 */
export function toClarityOk(value: string): string {
  return `(ok ${value})`;
}

/**
 * Generates a Clarity err response
 * @param value - The error value
 */
export function toClarityErr(value: string): string {
  return `(err ${value})`;
}

/**
 * Checks if a contract implements SIP-010 (fungible token)
 * @param functions - Array of contract functions
 */
export function implementsSIP010(functions: ClarityFunction[]): boolean {
  const requiredFunctions = Object.values(SIP010_FUNCTIONS);
  const functionNames = functions.map(f => f.name);
  return requiredFunctions.every(fn => functionNames.includes(fn));
}

/**
 * Checks if a contract implements SIP-009 (NFT)
 * @param functions - Array of contract functions
 */
export function implementsSIP009(functions: ClarityFunction[]): boolean {
  const requiredFunctions = Object.values(SIP009_FUNCTIONS);
  const functionNames = functions.map(f => f.name);
  return requiredFunctions.every(fn => functionNames.includes(fn));
}

/**
 * Estimates transaction fee based on function complexity
 * @param contractSize - Contract size in bytes
 * @param baseFeeMicroStx - Base fee in micro-STX
 */
export function estimateTxFee(
  contractSize: number,
  baseFeeMicroStx: number = 1000
): bigint {
  // Rough estimation: base fee + size-based component
  const sizeFee = Math.ceil(contractSize / 100) * 100;
  return BigInt(baseFeeMicroStx + sizeFee);
}

