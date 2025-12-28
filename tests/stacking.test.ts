import { describe, it, expect } from 'vitest';
import {
  getCycleForBlock,
  getBlockForCycle,
  getCycleInfo,
  meetsStackingMinimum,
  calculateUnlockBlock,
  formatStackingDuration,
  isValidPoxBtcAddress,
  POX_CONSTANTS,
} from '../src/stacking';

describe('Stacking Utilities', () => {
  const GENESIS = 666050;

  describe('getCycleForBlock', () => {
    it('should return 0 for blocks before genesis', () => {
      expect(getCycleForBlock(0, GENESIS)).toBe(0);
      expect(getCycleForBlock(666049, GENESIS)).toBe(0);
    });

    it('should calculate correct cycle for genesis block', () => {
      expect(getCycleForBlock(GENESIS, GENESIS)).toBe(0);
    });

    it('should calculate correct cycle for later blocks', () => {
      expect(getCycleForBlock(GENESIS + 2100, GENESIS)).toBe(1);
      expect(getCycleForBlock(GENESIS + 4200, GENESIS)).toBe(2);
    });
  });

  describe('getBlockForCycle', () => {
    it('should return genesis for cycle 0', () => {
      expect(getBlockForCycle(0, GENESIS)).toBe(GENESIS);
    });

    it('should calculate correct start block for cycles', () => {
      expect(getBlockForCycle(1, GENESIS)).toBe(GENESIS + 2100);
      expect(getBlockForCycle(10, GENESIS)).toBe(GENESIS + 21000);
    });
  });

  describe('getCycleInfo', () => {
    it('should return correct cycle info', () => {
      const currentBlock = GENESIS + 100;
      const info = getCycleInfo(0, currentBlock, GENESIS);

      expect(info.cycleNumber).toBe(0);
      expect(info.startBlock).toBe(GENESIS);
      expect(info.isActive).toBe(true);
    });
  });

  describe('meetsStackingMinimum', () => {
    it('should return true for amounts above minimum', () => {
      expect(meetsStackingMinimum(100_000_000_000n)).toBe(true);
    });

    it('should return false for amounts below minimum', () => {
      expect(meetsStackingMinimum(1_000_000n)).toBe(false);
    });

    it('should return true for exactly minimum', () => {
      expect(meetsStackingMinimum(POX_CONSTANTS.MIN_STACKING_AMOUNT_USTX)).toBe(true);
    });
  });

  describe('calculateUnlockBlock', () => {
    it('should calculate correct unlock block', () => {
      const startCycle = 5;
      const lockPeriod = 3;
      const unlock = calculateUnlockBlock(startCycle, lockPeriod, GENESIS);
      
      expect(unlock).toBe(getBlockForCycle(8, GENESIS));
    });
  });

  describe('formatStackingDuration', () => {
    it('should format single cycle as weeks', () => {
      expect(formatStackingDuration(1)).toBe('2 weeks');
    });

    it('should format cycles as months when >= 1 month', () => {
      expect(formatStackingDuration(2)).toBe('1 month');  // 4 weeks = 1 month
      expect(formatStackingDuration(4)).toBe('2 months');
      expect(formatStackingDuration(12)).toBe('6 months');
    });
  });

  describe('isValidPoxBtcAddress', () => {
    it('should validate P2PKH addresses', () => {
      expect(isValidPoxBtcAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    });

    it('should validate P2SH addresses', () => {
      expect(isValidPoxBtcAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
    });

    it('should validate Bech32 addresses', () => {
      expect(isValidPoxBtcAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidPoxBtcAddress('')).toBe(false);
      expect(isValidPoxBtcAddress('invalid')).toBe(false);
      expect(isValidPoxBtcAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe(false);
    });
  });
});

