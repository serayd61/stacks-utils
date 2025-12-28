/**
 * Token Utilities
 * Functions for working with STX and SIP-010 tokens
 */

export interface TokenAmount {
  raw: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
}

// Common token decimals
export const TOKEN_DECIMALS = {
  STX: 6,
  sBTC: 8,
  USDA: 6,
  xUSD: 8,
  ALEX: 8,
  VELAR: 6,
} as const;

/**
 * Converts micro-STX to STX
 * @param microStx - Amount in micro-STX (1 STX = 1,000,000 micro-STX)
 */
export function microStxToStx(microStx: bigint | number | string): number {
  const value = typeof microStx === 'bigint' ? microStx : BigInt(microStx);
  return Number(value) / 1_000_000;
}

/**
 * Converts STX to micro-STX
 * @param stx - Amount in STX
 */
export function stxToMicroStx(stx: number | string): bigint {
  const value = typeof stx === 'string' ? parseFloat(stx) : stx;
  return BigInt(Math.round(value * 1_000_000));
}

/**
 * Formats a token amount with proper decimals
 * @param amount - Raw token amount
 * @param decimals - Number of decimals for the token
 * @param options - Formatting options
 */
export function formatTokenAmount(
  amount: bigint | number | string,
  decimals: number = 6,
  options: {
    maxDecimals?: number;
    minDecimals?: number;
    locale?: string;
  } = {}
): string {
  const { maxDecimals = decimals, minDecimals = 0, locale = 'en-US' } = options;
  
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  
  const fullNumber = Number(integerPart) + Number(fractionalPart) / (10 ** decimals);
  
  return fullNumber.toLocaleString(locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Parses a formatted token amount to raw value
 * @param formattedAmount - Formatted amount string
 * @param decimals - Number of decimals for the token
 */
export function parseTokenAmount(formattedAmount: string, decimals: number = 6): bigint {
  // Remove any thousands separators and convert comma to dot for decimals
  const cleaned = formattedAmount.replace(/,/g, '').replace(' ', '');
  const value = parseFloat(cleaned);
  
  if (isNaN(value)) {
    throw new Error(`Invalid token amount: ${formattedAmount}`);
  }
  
  return BigInt(Math.round(value * (10 ** decimals)));
}

/**
 * Formats STX amount with symbol
 * @param microStx - Amount in micro-STX
 * @param showSymbol - Whether to show the STX symbol
 */
export function formatStx(
  microStx: bigint | number | string, 
  showSymbol: boolean = true
): string {
  const formatted = formatTokenAmount(microStx, 6, { maxDecimals: 6 });
  return showSymbol ? `${formatted} STX` : formatted;
}

/**
 * Formats sBTC amount with symbol
 * @param sats - Amount in satoshis
 * @param showSymbol - Whether to show the sBTC symbol
 */
export function formatSbtc(
  sats: bigint | number | string,
  showSymbol: boolean = true
): string {
  const formatted = formatTokenAmount(sats, 8, { maxDecimals: 8 });
  return showSymbol ? `${formatted} sBTC` : formatted;
}

/**
 * Calculates percentage of total supply
 * @param amount - Token amount
 * @param totalSupply - Total supply of the token
 */
export function calculatePercentOfSupply(amount: bigint, totalSupply: bigint): number {
  if (totalSupply === 0n) return 0;
  return Number((amount * 10000n) / totalSupply) / 100;
}

/**
 * Compares two token amounts
 * @param a - First amount
 * @param b - Second amount
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareTokenAmounts(
  a: bigint | number | string,
  b: bigint | number | string
): -1 | 0 | 1 {
  const valueA = typeof a === 'bigint' ? a : BigInt(a);
  const valueB = typeof b === 'bigint' ? b : BigInt(b);
  
  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
}

