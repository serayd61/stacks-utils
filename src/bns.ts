/**
 * BNS (Blockchain Naming System) Utilities
 * Functions for working with Stacks domain names
 */

// BNS Constants
export const BNS_CONSTANTS = {
  // BNS contract on mainnet
  MAINNET_CONTRACT: 'SP000000000000000000002Q6VF78.bns',
  
  // BNS v2 contract
  MAINNET_CONTRACT_V2: 'SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96EZ9K7.BNS-V2',
  
  // Maximum name length
  MAX_NAME_LENGTH: 48,
  
  // Maximum namespace length
  MAX_NAMESPACE_LENGTH: 20,
  
  // Common namespaces
  NAMESPACES: {
    BTC: 'btc',
    STX: 'stx',
    ID: 'id',
    APP: 'app',
    MEGA: 'mega',
  },
  
  // Name registration duration in blocks (roughly 1 year)
  REGISTRATION_BLOCKS: 52560,
} as const;

export interface BnsName {
  name: string;
  namespace: string;
  fullName: string;
  owner?: string;
  zonefile?: string;
  expirationBlock?: number;
}

export interface ParsedName {
  name: string;
  namespace: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parses a full BNS name into its components
 * @param fullName - The full name (e.g., "satoshi.btc")
 */
export function parseBnsName(fullName: string): ParsedName {
  if (!fullName || typeof fullName !== 'string') {
    return { name: '', namespace: '', isValid: false, error: 'Invalid input' };
  }
  
  const parts = fullName.toLowerCase().trim().split('.');
  
  if (parts.length !== 2) {
    return { 
      name: '', 
      namespace: '', 
      isValid: false, 
      error: 'Name must be in format "name.namespace"' 
    };
  }
  
  const [name, namespace] = parts;
  
  // Validate name
  if (!isValidBnsName(name)) {
    return { name, namespace, isValid: false, error: 'Invalid name format' };
  }
  
  // Validate namespace
  if (!isValidBnsNamespace(namespace)) {
    return { name, namespace, isValid: false, error: 'Invalid namespace format' };
  }
  
  return { name, namespace, isValid: true };
}

/**
 * Validates a BNS name (without namespace)
 * @param name - The name to validate
 */
export function isValidBnsName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  if (name.length > BNS_CONSTANTS.MAX_NAME_LENGTH) return false;
  if (name.length < 1) return false;
  
  // Names can only contain lowercase letters, numbers, and hyphens
  // Cannot start or end with hyphen
  const regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
  return regex.test(name);
}

/**
 * Validates a BNS namespace
 * @param namespace - The namespace to validate
 */
export function isValidBnsNamespace(namespace: string): boolean {
  if (!namespace || typeof namespace !== 'string') return false;
  if (namespace.length > BNS_CONSTANTS.MAX_NAMESPACE_LENGTH) return false;
  if (namespace.length < 1) return false;
  
  // Namespaces can only contain lowercase letters and numbers
  const regex = /^[a-z0-9]+$/;
  return regex.test(namespace);
}

/**
 * Validates a full BNS name (with namespace)
 * @param fullName - The full name (e.g., "satoshi.btc")
 */
export function isValidFullBnsName(fullName: string): boolean {
  return parseBnsName(fullName).isValid;
}

/**
 * Constructs a full BNS name from components
 * @param name - The name
 * @param namespace - The namespace
 */
export function constructBnsName(name: string, namespace: string): string {
  return `${name.toLowerCase()}.${namespace.toLowerCase()}`;
}

/**
 * Gets the API URL for looking up a BNS name
 * @param fullName - The full BNS name
 * @param network - Network type
 */
export function getBnsLookupUrl(
  fullName: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const parsed = parseBnsName(fullName);
  if (!parsed.isValid) throw new Error('Invalid BNS name');
  
  const baseUrl = network === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';
    
  return `${baseUrl}/v1/names/${fullName}`;
}

/**
 * Gets the API URL for looking up names owned by an address
 * @param address - Stacks address
 * @param network - Network type
 */
export function getBnsNamesByAddressUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://api.hiro.so' 
    : 'https://api.testnet.hiro.so';
    
  return `${baseUrl}/v1/addresses/stacks/${address}`;
}

/**
 * Calculates name price based on length (simplified pricing model)
 * @param name - The name to price
 * @param namespace - The namespace
 */
export function estimateNamePrice(name: string, namespace: string): bigint {
  // Simplified pricing - actual pricing depends on namespace settings
  const length = name.length;
  
  // Base price varies by namespace
  const basePrices: Record<string, bigint> = {
    btc: 2_000_000n, // 2 STX base
    stx: 2_000_000n,
    id: 1_000_000n,  // 1 STX base
    app: 5_000_000n, // 5 STX base
  };
  
  const basePrice = basePrices[namespace.toLowerCase()] || 10_000_000n;
  
  // Shorter names cost more
  if (length <= 3) return basePrice * 100n;
  if (length <= 5) return basePrice * 10n;
  if (length <= 8) return basePrice * 5n;
  
  return basePrice;
}

/**
 * Formats a BNS name for display
 * @param fullName - The full BNS name
 * @param showEmoji - Whether to show a domain emoji
 */
export function formatBnsName(fullName: string, showEmoji: boolean = true): string {
  const parsed = parseBnsName(fullName);
  if (!parsed.isValid) return fullName;
  
  const emoji = showEmoji ? '🔗 ' : '';
  return `${emoji}${parsed.name}.${parsed.namespace}`;
}

/**
 * Checks if a namespace is a known/official namespace
 * @param namespace - The namespace to check
 */
export function isKnownNamespace(namespace: string): boolean {
  const knownNamespaces = Object.values(BNS_CONSTANTS.NAMESPACES) as string[];
  return knownNamespaces.includes(namespace.toLowerCase());
}

/**
 * Generates a zonefile for a BNS name
 * @param fullName - The full BNS name
 * @param owner - The owner's Stacks address
 * @param url - Optional website URL
 */
export function generateZonefile(
  fullName: string,
  owner: string,
  url?: string
): string {
  const parsed = parseBnsName(fullName);
  if (!parsed.isValid) throw new Error('Invalid BNS name');
  
  let zonefile = `$ORIGIN ${fullName}\n`;
  zonefile += `$TTL 3600\n`;
  zonefile += `_resolver URI 10 1 "https://stacks.co"\n`;
  
  if (url) {
    zonefile += `_redirect URI 10 1 "${url}"\n`;
  }
  
  zonefile += `@ TXT "owner=${owner}"\n`;
  
  return zonefile;
}

