/**
 * Transaction Builder Helpers
 * Utilities for building and working with Stacks transactions
 */

import { CLARITY_TYPES, POST_CONDITION_MODE, TX_STATUS } from './constants';

// Transaction Types
export const TRANSACTION_TYPES = {
  TOKEN_TRANSFER: 0x00,
  SMART_CONTRACT: 0x01,
  CONTRACT_CALL: 0x02,
  POISON_MICROBLOCK: 0x03,
  COINBASE: 0x04,
  COINBASE_TO_ALT_RECIPIENT: 0x05,
  VERSIONED_SMART_CONTRACT: 0x06,
  TENURE_CHANGE: 0x07,
  NAKAMOTO_COINBASE: 0x08,
} as const;

export interface PostCondition {
  type: 'stx' | 'fungible' | 'nft';
  principal: string;
  conditionCode: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  amount?: bigint;
  assetInfo?: {
    contractAddress: string;
    contractName: string;
    assetName: string;
  };
  assetId?: string; // For NFTs
}

export interface TransactionOptions {
  fee?: bigint;
  nonce?: bigint;
  postConditionMode?: 'allow' | 'deny';
  postConditions?: PostCondition[];
  sponsored?: boolean;
  anchorMode?: 'any' | 'on-chain' | 'off-chain';
}

export interface ContractCallPayload {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
}

export interface ClarityValue {
  type: string;
  value: unknown;
}

/**
 * Creates a STX post condition
 * @param principal - The principal (address)
 * @param conditionCode - The condition code
 * @param amount - Amount in micro-STX
 */
export function createStxPostCondition(
  principal: string,
  conditionCode: PostCondition['conditionCode'],
  amount: bigint
): PostCondition {
  return {
    type: 'stx',
    principal,
    conditionCode,
    amount,
  };
}

/**
 * Creates a fungible token post condition
 * @param principal - The principal (address)
 * @param conditionCode - The condition code
 * @param amount - Token amount
 * @param contractAddress - Token contract address
 * @param contractName - Token contract name
 * @param assetName - Token asset name
 */
export function createFungiblePostCondition(
  principal: string,
  conditionCode: PostCondition['conditionCode'],
  amount: bigint,
  contractAddress: string,
  contractName: string,
  assetName: string
): PostCondition {
  return {
    type: 'fungible',
    principal,
    conditionCode,
    amount,
    assetInfo: {
      contractAddress,
      contractName,
      assetName,
    },
  };
}

/**
 * Creates an NFT post condition
 * @param principal - The principal (address)
 * @param conditionCode - The condition code ('eq' for sends, 'lte' for does not send)
 * @param contractAddress - NFT contract address
 * @param contractName - NFT contract name
 * @param assetName - NFT asset name
 * @param assetId - NFT token ID
 */
export function createNftPostCondition(
  principal: string,
  conditionCode: 'eq' | 'lte',
  contractAddress: string,
  contractName: string,
  assetName: string,
  assetId: string
): PostCondition {
  return {
    type: 'nft',
    principal,
    conditionCode,
    assetInfo: {
      contractAddress,
      contractName,
      assetName,
    },
    assetId,
  };
}

/**
 * Estimates transaction fee based on byte size
 * @param txSizeBytes - Transaction size in bytes
 * @param feeRateMicroStx - Fee rate per byte in micro-STX
 */
export function estimateFee(
  txSizeBytes: number,
  feeRateMicroStx: number = 1
): bigint {
  // Minimum fee is typically around 180-200 micro-STX
  const minFee = 200n;
  const calculatedFee = BigInt(Math.ceil(txSizeBytes * feeRateMicroStx));
  return calculatedFee > minFee ? calculatedFee : minFee;
}

/**
 * Creates a contract call payload
 * @param contractId - Full contract ID (address.name)
 * @param functionName - Function to call
 * @param functionArgs - Function arguments
 */
export function createContractCallPayload(
  contractId: string,
  functionName: string,
  functionArgs: ClarityValue[] = []
): ContractCallPayload {
  const [contractAddress, contractName] = contractId.split('.');
  
  if (!contractAddress || !contractName) {
    throw new Error('Invalid contract ID format. Expected "address.name"');
  }
  
  return {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
  };
}

/**
 * Validates transaction status
 * @param status - Transaction status string
 */
export function isSuccessfulTx(status: string): boolean {
  return status === TX_STATUS.SUCCESS || status === 'success';
}

/**
 * Checks if transaction is pending
 * @param status - Transaction status string
 */
export function isPendingTx(status: string): boolean {
  return status === TX_STATUS.PENDING || status === 'pending';
}

/**
 * Checks if transaction failed
 * @param status - Transaction status string
 */
export function isFailedTx(status: string): boolean {
  return status === TX_STATUS.FAILED || 
         status === 'abort_by_response' || 
         status === 'abort_by_post_condition';
}

/**
 * Formats post condition for display
 * @param pc - Post condition
 */
export function formatPostCondition(pc: PostCondition): string {
  const conditionText = {
    eq: 'exactly',
    gt: 'more than',
    gte: 'at least',
    lt: 'less than',
    lte: 'at most',
  }[pc.conditionCode];
  
  if (pc.type === 'stx') {
    const stx = Number(pc.amount || 0n) / 1_000_000;
    return `${pc.principal} sends ${conditionText} ${stx} STX`;
  }
  
  if (pc.type === 'fungible' && pc.assetInfo) {
    return `${pc.principal} sends ${conditionText} ${pc.amount} ${pc.assetInfo.assetName}`;
  }
  
  if (pc.type === 'nft' && pc.assetInfo) {
    const action = pc.conditionCode === 'eq' ? 'sends' : 'does not send';
    return `${pc.principal} ${action} ${pc.assetInfo.assetName} #${pc.assetId}`;
  }
  
  return 'Unknown post condition';
}

/**
 * Creates a Clarity uint value
 * @param value - Numeric value
 */
export function cvUint(value: number | bigint): ClarityValue {
  return { type: 'uint', value: BigInt(value) };
}

/**
 * Creates a Clarity int value
 * @param value - Numeric value
 */
export function cvInt(value: number | bigint): ClarityValue {
  return { type: 'int', value: BigInt(value) };
}

/**
 * Creates a Clarity principal value
 * @param address - Stacks address
 * @param contractName - Optional contract name
 */
export function cvPrincipal(address: string, contractName?: string): ClarityValue {
  const value = contractName ? `${address}.${contractName}` : address;
  return { type: 'principal', value };
}

/**
 * Creates a Clarity bool value
 * @param value - Boolean value
 */
export function cvBool(value: boolean): ClarityValue {
  return { type: 'bool', value };
}

/**
 * Creates a Clarity string-ascii value
 * @param value - String value
 */
export function cvStringAscii(value: string): ClarityValue {
  return { type: 'string-ascii', value };
}

/**
 * Creates a Clarity string-utf8 value
 * @param value - String value
 */
export function cvStringUtf8(value: string): ClarityValue {
  return { type: 'string-utf8', value };
}

/**
 * Creates a Clarity buff value
 * @param value - Buffer as hex string
 */
export function cvBuff(value: string): ClarityValue {
  const hex = value.startsWith('0x') ? value.slice(2) : value;
  return { type: 'buff', value: hex };
}

/**
 * Creates a Clarity none value
 */
export function cvNone(): ClarityValue {
  return { type: 'optional', value: null };
}

/**
 * Creates a Clarity some value
 * @param value - The wrapped Clarity value
 */
export function cvSome(value: ClarityValue): ClarityValue {
  return { type: 'optional', value };
}

/**
 * Creates a Clarity list value
 * @param values - Array of Clarity values
 */
export function cvList(values: ClarityValue[]): ClarityValue {
  return { type: 'list', value: values };
}

/**
 * Creates a Clarity tuple value
 * @param data - Object with Clarity values
 */
export function cvTuple(data: Record<string, ClarityValue>): ClarityValue {
  return { type: 'tuple', value: data };
}

