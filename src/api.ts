/**
 * Stacks API Helpers
 * Utility functions for interacting with Stacks blockchain APIs
 */

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export const STACKS_API_ENDPOINTS = {
  MAINNET: 'https://api.hiro.so',
  TESTNET: 'https://api.testnet.hiro.so',
  NAKAMOTO_TESTNET: 'https://api.nakamoto.testnet.hiro.so',
} as const;

export interface AccountBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    locked: string;
  };
  fungible_tokens: Record<string, { balance: string; total_sent: string; total_received: string }>;
  non_fungible_tokens: Record<string, { count: string; total_sent: string; total_received: string }>;
}

export interface TransactionStatus {
  tx_id: string;
  tx_status: 'pending' | 'success' | 'failed' | 'dropped';
  tx_type: string;
  block_height?: number;
  block_hash?: string;
}

/**
 * Creates an API client configuration
 * @param network - The network to use
 * @param customUrl - Optional custom API URL
 */
export function createApiConfig(
  network: 'mainnet' | 'testnet' | 'nakamoto-testnet' = 'mainnet',
  customUrl?: string
): ApiConfig {
  let baseUrl: string;
  
  if (customUrl) {
    baseUrl = customUrl;
  } else {
    switch (network) {
      case 'testnet':
        baseUrl = STACKS_API_ENDPOINTS.TESTNET;
        break;
      case 'nakamoto-testnet':
        baseUrl = STACKS_API_ENDPOINTS.NAKAMOTO_TESTNET;
        break;
      default:
        baseUrl = STACKS_API_ENDPOINTS.MAINNET;
    }
  }
  
  return {
    baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Builds an API URL with path and query parameters
 * @param config - API configuration
 * @param path - API path
 * @param params - Query parameters
 */
export function buildApiUrl(
  config: ApiConfig,
  path: string,
  params?: Record<string, string | number | boolean>
): string {
  const url = new URL(path, config.baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Builds the URL for fetching account info
 * @param address - Stacks address
 * @param network - Network to use
 */
export function getAccountInfoUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const config = createApiConfig(network);
  return buildApiUrl(config, `/extended/v1/address/${address}/balances`);
}

/**
 * Builds the URL for fetching transaction status
 * @param txId - Transaction ID
 * @param network - Network to use
 */
export function getTransactionUrl(
  txId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const config = createApiConfig(network);
  return buildApiUrl(config, `/extended/v1/tx/${txId}`);
}

/**
 * Builds the URL for fetching contract info
 * @param contractId - Contract identifier (e.g., "SP123.contract-name")
 * @param network - Network to use
 */
export function getContractInfoUrl(
  contractId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const config = createApiConfig(network);
  return buildApiUrl(config, `/extended/v1/contract/${contractId}`);
}

/**
 * Builds the URL for fetching NFTs owned by an address
 * @param address - Stacks address
 * @param network - Network to use
 */
export function getNftsUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const config = createApiConfig(network);
  return buildApiUrl(config, `/extended/v1/tokens/nft/holdings`, {
    principal: address,
  });
}

/**
 * Builds the explorer URL for a transaction
 * @param txId - Transaction ID
 * @param network - Network to use
 */
export function getExplorerTxUrl(
  txId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = 'https://explorer.hiro.so';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/txid/${txId}${chain}`;
}

/**
 * Builds the explorer URL for an address
 * @param address - Stacks address
 * @param network - Network to use
 */
export function getExplorerAddressUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = 'https://explorer.hiro.so';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/address/${address}${chain}`;
}

/**
 * Parses a contract identifier into its components
 * @param contractId - Contract identifier (e.g., "SP123.contract-name")
 */
export function parseContractId(contractId: string): {
  address: string;
  contractName: string;
} | null {
  const parts = contractId.split('.');
  if (parts.length !== 2) return null;
  
  return {
    address: parts[0],
    contractName: parts[1],
  };
}

/**
 * Builds a contract identifier from address and name
 * @param address - Contract deployer address
 * @param contractName - Contract name
 */
export function buildContractId(address: string, contractName: string): string {
  return `${address}.${contractName}`;
}

