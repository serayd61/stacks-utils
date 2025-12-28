/**
 * Stacking/PoX Utilities
 * Functions for working with Stacks stacking and Proof of Transfer
 */

import { microStxToStx, stxToMicroStx } from './tokens';

// PoX Constants
export const POX_CONSTANTS = {
  // Mainnet PoX contract
  MAINNET_POX_4: 'SP000000000000000000002Q6VF78.pox-4',
  
  // Testnet PoX contract
  TESTNET_POX_4: 'ST000000000000000000002AMW42H.pox-4',
  
  // Cycle length in blocks
  CYCLE_LENGTH: 2100,
  
  // Prepare phase length
  PREPARE_PHASE_LENGTH: 100,
  
  // Reward phase length
  REWARD_PHASE_LENGTH: 2000,
  
  // Minimum stacking amount (dynamic, but base is 90k STX)
  MIN_STACKING_AMOUNT_USTX: 90_000_000_000n, // 90,000 STX
  
  // Maximum lock cycles
  MAX_LOCK_CYCLES: 12,
  
  // Blocks per day (approximate)
  BLOCKS_PER_DAY: 144,
} as const;

export interface StackingInfo {
  amountMicroStx: bigint;
  lockPeriodCycles: number;
  startCycle: number;
  endCycle: number;
  poxAddress: string;
  estimatedRewardBtc?: number;
}

export interface CycleInfo {
  cycleNumber: number;
  startBlock: number;
  endBlock: number;
  preparePhaseStart: number;
  rewardPhaseStart: number;
  isActive: boolean;
  phase: 'prepare' | 'reward';
}

/**
 * Calculates the cycle number for a given block height
 * @param blockHeight - The block height
 * @param genesisBlock - The genesis block for PoX (default mainnet)
 */
export function getCycleForBlock(
  blockHeight: number,
  genesisBlock: number = 666050
): number {
  if (blockHeight < genesisBlock) return 0;
  return Math.floor((blockHeight - genesisBlock) / POX_CONSTANTS.CYCLE_LENGTH);
}

/**
 * Gets the start block for a given cycle
 * @param cycleNumber - The cycle number
 * @param genesisBlock - The genesis block for PoX
 */
export function getBlockForCycle(
  cycleNumber: number,
  genesisBlock: number = 666050
): number {
  return genesisBlock + (cycleNumber * POX_CONSTANTS.CYCLE_LENGTH);
}

/**
 * Gets detailed information about a stacking cycle
 * @param cycleNumber - The cycle number
 * @param currentBlock - Current block height
 * @param genesisBlock - The genesis block for PoX
 */
export function getCycleInfo(
  cycleNumber: number,
  currentBlock: number,
  genesisBlock: number = 666050
): CycleInfo {
  const startBlock = getBlockForCycle(cycleNumber, genesisBlock);
  const endBlock = startBlock + POX_CONSTANTS.CYCLE_LENGTH - 1;
  const preparePhaseStart = startBlock;
  const rewardPhaseStart = startBlock + POX_CONSTANTS.PREPARE_PHASE_LENGTH;
  
  const isActive = currentBlock >= startBlock && currentBlock <= endBlock;
  const phase = currentBlock < rewardPhaseStart ? 'prepare' : 'reward';
  
  return {
    cycleNumber,
    startBlock,
    endBlock,
    preparePhaseStart,
    rewardPhaseStart,
    isActive,
    phase,
  };
}

/**
 * Calculates blocks remaining until cycle ends
 * @param currentBlock - Current block height
 * @param genesisBlock - The genesis block for PoX
 */
export function getBlocksUntilCycleEnd(
  currentBlock: number,
  genesisBlock: number = 666050
): number {
  const currentCycle = getCycleForBlock(currentBlock, genesisBlock);
  const cycleEndBlock = getBlockForCycle(currentCycle + 1, genesisBlock) - 1;
  return cycleEndBlock - currentBlock;
}

/**
 * Calculates estimated time until cycle ends
 * @param currentBlock - Current block height
 * @param avgBlockTimeSeconds - Average block time in seconds (default 10 min)
 */
export function getTimeUntilCycleEnd(
  currentBlock: number,
  avgBlockTimeSeconds: number = 600
): {
  blocks: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
} {
  const blocks = getBlocksUntilCycleEnd(currentBlock);
  const seconds = blocks * avgBlockTimeSeconds;
  
  return {
    blocks,
    seconds,
    minutes: Math.floor(seconds / 60),
    hours: Math.floor(seconds / 3600),
    days: Math.floor(seconds / 86400),
  };
}

/**
 * Checks if an amount meets the minimum stacking requirement
 * @param amountMicroStx - Amount in micro-STX
 * @param minimumRequired - Optional custom minimum (for dynamic threshold)
 */
export function meetsStackingMinimum(
  amountMicroStx: bigint,
  minimumRequired: bigint = POX_CONSTANTS.MIN_STACKING_AMOUNT_USTX
): boolean {
  return amountMicroStx >= minimumRequired;
}

/**
 * Calculates the unlock block for a stacking position
 * @param startCycle - The cycle when stacking starts
 * @param lockPeriod - Number of cycles to lock
 * @param genesisBlock - The genesis block for PoX
 */
export function calculateUnlockBlock(
  startCycle: number,
  lockPeriod: number,
  genesisBlock: number = 666050
): number {
  const endCycle = startCycle + lockPeriod;
  return getBlockForCycle(endCycle, genesisBlock);
}

/**
 * Estimates stacking rewards based on historical APY
 * @param amountStx - Amount being stacked in STX
 * @param lockPeriodCycles - Number of cycles to lock
 * @param estimatedApy - Estimated APY as decimal (e.g., 0.08 for 8%)
 */
export function estimateStackingRewards(
  amountStx: number,
  lockPeriodCycles: number,
  estimatedApy: number = 0.08
): {
  estimatedBtcReward: number;
  estimatedUsdValue: number;
  annualizedReturn: number;
} {
  // Each cycle is ~2 weeks, so 26 cycles per year
  const cyclesPerYear = 26;
  const periodFraction = lockPeriodCycles / cyclesPerYear;
  
  // Estimated BTC reward (rough calculation)
  const annualizedReturn = amountStx * estimatedApy;
  const periodReturn = annualizedReturn * periodFraction;
  
  // Convert to approximate BTC (assuming 1 STX ≈ 0.00002 BTC as example)
  const stxToBtcRate = 0.00002;
  const estimatedBtcReward = periodReturn * stxToBtcRate;
  
  return {
    estimatedBtcReward,
    estimatedUsdValue: periodReturn, // In STX terms
    annualizedReturn,
  };
}

/**
 * Validates a Bitcoin address for PoX rewards
 * @param btcAddress - Bitcoin address
 */
export function isValidPoxBtcAddress(btcAddress: string): boolean {
  if (!btcAddress || typeof btcAddress !== 'string') return false;
  
  // P2PKH (Legacy) - starts with 1
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(btcAddress)) return true;
  
  // P2SH - starts with 3
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(btcAddress)) return true;
  
  // Bech32 (Native SegWit) - starts with bc1q
  if (/^bc1q[a-z0-9]{38,58}$/.test(btcAddress)) return true;
  
  // Bech32m (Taproot) - starts with bc1p
  if (/^bc1p[a-z0-9]{58}$/.test(btcAddress)) return true;
  
  return false;
}

/**
 * Formats stacking duration in human-readable format
 * @param cycles - Number of cycles
 */
export function formatStackingDuration(cycles: number): string {
  const weeks = cycles * 2;
  const months = Math.floor(weeks / 4);
  
  if (months >= 1) {
    const remainingWeeks = weeks % 4;
    if (remainingWeeks > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
}

/**
 * Gets the PoX contract address for a network
 * @param network - Network type
 */
export function getPoxContract(network: 'mainnet' | 'testnet'): string {
  return network === 'mainnet' 
    ? POX_CONSTANTS.MAINNET_POX_4 
    : POX_CONSTANTS.TESTNET_POX_4;
}

