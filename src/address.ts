/**
 * Stacks Address Utilities
 * Validation, parsing, and conversion functions for Stacks addresses
 */

import { c32addressDecode, c32address } from 'c32check';

// Address version bytes
export const ADDRESS_VERSION = {
  MAINNET_SINGLE_SIG: 22,
  MAINNET_MULTI_SIG: 20,
  TESTNET_SINGLE_SIG: 26,
  TESTNET_MULTI_SIG: 21,
} as const;

export type NetworkType = 'mainnet' | 'testnet';
export type AddressType = 'single-sig' | 'multi-sig';

export interface AddressInfo {
  address: string;
  network: NetworkType;
  type: AddressType;
  version: number;
  hash160: string;
  isValid: boolean;
}

/**
 * Validates a Stacks address
 * @param address - The address to validate
 * @returns true if the address is valid
 */
export function isValidStacksAddress(address: string): boolean {
  try {
    if (!address || typeof address !== 'string') return false;
    if (!address.startsWith('SP') && !address.startsWith('ST') && 
        !address.startsWith('SM') && !address.startsWith('SN')) {
      return false;
    }
    c32addressDecode(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if an address is a mainnet address
 * @param address - The address to check
 */
export function isMainnetAddress(address: string): boolean {
  return address.startsWith('SP') || address.startsWith('SM');
}

/**
 * Checks if an address is a testnet address
 * @param address - The address to check
 */
export function isTestnetAddress(address: string): boolean {
  return address.startsWith('ST') || address.startsWith('SN');
}

/**
 * Gets the network type from an address
 * @param address - The address to analyze
 */
export function getNetworkFromAddress(address: string): NetworkType | null {
  if (isMainnetAddress(address)) return 'mainnet';
  if (isTestnetAddress(address)) return 'testnet';
  return null;
}

/**
 * Parses a Stacks address and returns detailed information
 * @param address - The address to parse
 */
export function parseStacksAddress(address: string): AddressInfo | null {
  try {
    const [version, hash160] = c32addressDecode(address);
    
    let network: NetworkType;
    let type: AddressType;
    
    switch (version) {
      case ADDRESS_VERSION.MAINNET_SINGLE_SIG:
        network = 'mainnet';
        type = 'single-sig';
        break;
      case ADDRESS_VERSION.MAINNET_MULTI_SIG:
        network = 'mainnet';
        type = 'multi-sig';
        break;
      case ADDRESS_VERSION.TESTNET_SINGLE_SIG:
        network = 'testnet';
        type = 'single-sig';
        break;
      case ADDRESS_VERSION.TESTNET_MULTI_SIG:
        network = 'testnet';
        type = 'multi-sig';
        break;
      default:
        return null;
    }
    
    return {
      address,
      network,
      type,
      version,
      hash160,
      isValid: true,
    };
  } catch {
    return null;
  }
}

/**
 * Shortens an address for display (e.g., "SP2J6...4A1")
 * @param address - The address to shorten
 * @param startChars - Number of characters to show at start (default: 5)
 * @param endChars - Number of characters to show at end (default: 4)
 */
export function shortenAddress(address: string, startChars = 5, endChars = 4): string {
  if (!address || address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Converts a hash160 to a Stacks address
 * @param hash160 - The hash160 hex string
 * @param network - The network type
 * @param type - The address type
 */
export function hash160ToAddress(
  hash160: string, 
  network: NetworkType = 'mainnet',
  type: AddressType = 'single-sig'
): string {
  let version: number;
  
  if (network === 'mainnet') {
    version = type === 'single-sig' 
      ? ADDRESS_VERSION.MAINNET_SINGLE_SIG 
      : ADDRESS_VERSION.MAINNET_MULTI_SIG;
  } else {
    version = type === 'single-sig'
      ? ADDRESS_VERSION.TESTNET_SINGLE_SIG
      : ADDRESS_VERSION.TESTNET_MULTI_SIG;
  }
  
  return c32address(version, hash160);
}

/**
 * Checks if two addresses are equal (case-insensitive)
 * @param address1 - First address
 * @param address2 - Second address
 */
export function addressesEqual(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false;
  return address1.toUpperCase() === address2.toUpperCase();
}

