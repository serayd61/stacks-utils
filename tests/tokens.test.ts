import { describe, it, expect } from 'vitest';
import {
  microStxToStx,
  stxToMicroStx,
  formatTokenAmount,
  parseTokenAmount,
  formatStx,
  formatSbtc,
  compareTokenAmounts,
} from '../src/tokens';

describe('Token Utilities', () => {
  describe('microStxToStx', () => {
    it('should convert micro-STX to STX', () => {
      expect(microStxToStx(1000000n)).toBe(1);
      expect(microStxToStx(1500000n)).toBe(1.5);
      expect(microStxToStx(0n)).toBe(0);
    });

    it('should handle string input', () => {
      expect(microStxToStx('1000000')).toBe(1);
    });

    it('should handle number input', () => {
      expect(microStxToStx(1000000)).toBe(1);
    });
  });

  describe('stxToMicroStx', () => {
    it('should convert STX to micro-STX', () => {
      expect(stxToMicroStx(1)).toBe(1000000n);
      expect(stxToMicroStx(1.5)).toBe(1500000n);
      expect(stxToMicroStx(0)).toBe(0n);
    });

    it('should handle string input', () => {
      expect(stxToMicroStx('2.5')).toBe(2500000n);
    });
  });

  describe('formatTokenAmount', () => {
    it('should format token amounts with proper decimals', () => {
      expect(formatTokenAmount(1000000n, 6)).toBe('1');
      expect(formatTokenAmount(1234567n, 6)).toBe('1.234567');
    });

    it('should respect maxDecimals option', () => {
      expect(formatTokenAmount(1234567n, 6, { maxDecimals: 2 })).toBe('1.23');
    });

    it('should respect minDecimals option', () => {
      expect(formatTokenAmount(1000000n, 6, { minDecimals: 2 })).toBe('1.00');
    });
  });

  describe('parseTokenAmount', () => {
    it('should parse formatted amounts', () => {
      expect(parseTokenAmount('1', 6)).toBe(1000000n);
      expect(parseTokenAmount('1.5', 6)).toBe(1500000n);
    });

    it('should handle amounts with thousands separators', () => {
      expect(parseTokenAmount('1,000', 6)).toBe(1000000000n);
    });

    it('should throw on invalid input', () => {
      expect(() => parseTokenAmount('invalid', 6)).toThrow();
    });
  });

  describe('formatStx', () => {
    it('should format STX with symbol', () => {
      expect(formatStx(1000000n)).toBe('1 STX');
      expect(formatStx(1500000n)).toBe('1.5 STX');
    });

    it('should format without symbol when specified', () => {
      expect(formatStx(1000000n, false)).toBe('1');
    });
  });

  describe('formatSbtc', () => {
    it('should format sBTC with symbol', () => {
      expect(formatSbtc(100000000n)).toBe('1 sBTC');
      expect(formatSbtc(50000000n)).toBe('0.5 sBTC');
    });
  });

  describe('compareTokenAmounts', () => {
    it('should compare token amounts correctly', () => {
      expect(compareTokenAmounts(1000n, 2000n)).toBe(-1);
      expect(compareTokenAmounts(2000n, 1000n)).toBe(1);
      expect(compareTokenAmounts(1000n, 1000n)).toBe(0);
    });

    it('should handle different input types', () => {
      expect(compareTokenAmounts('1000', 2000n)).toBe(-1);
      expect(compareTokenAmounts(1000, '1000')).toBe(0);
    });
  });
});

