import { describe, it, expect } from 'vitest';
import {
  encodeMemo,
  decodeMemo,
  isValidMemo,
  getMemoByteLength,
  truncateMemo,
  createPrefixedMemo,
  parsePrefixedMemo,
  MAX_MEMO_LENGTH,
} from '../src/memo';

describe('Memo Utilities', () => {
  describe('encodeMemo', () => {
    it('should encode simple ASCII text', () => {
      const encoded = encodeMemo('hello', false);
      expect(encoded).toBe('68656c6c6f');
    });

    it('should pad to max length when requested', () => {
      const encoded = encodeMemo('hi', true);
      expect(encoded.length).toBe(MAX_MEMO_LENGTH * 2);
    });

    it('should handle empty string', () => {
      const encoded = encodeMemo('', false);
      expect(encoded).toBe('');
    });
  });

  describe('decodeMemo', () => {
    it('should decode hex to string', () => {
      const decoded = decodeMemo('68656c6c6f');
      expect(decoded).toBe('hello');
    });

    it('should handle 0x prefix', () => {
      const decoded = decodeMemo('0x68656c6c6f');
      expect(decoded).toBe('hello');
    });

    it('should strip trailing zeros', () => {
      const decoded = decodeMemo('68656c6c6f0000000000');
      expect(decoded).toBe('hello');
    });

    it('should handle empty input', () => {
      expect(decodeMemo('')).toBe('');
    });
  });

  describe('roundtrip', () => {
    it('should encode and decode correctly', () => {
      const messages = ['hello', 'test123', 'Payment for services'];
      
      for (const msg of messages) {
        const encoded = encodeMemo(msg, false);
        const decoded = decodeMemo(encoded);
        expect(decoded).toBe(msg);
      }
    });
  });

  describe('isValidMemo', () => {
    it('should accept valid memos', () => {
      expect(isValidMemo('hello')).toBe(true);
      expect(isValidMemo('')).toBe(true);
      expect(isValidMemo('a'.repeat(34))).toBe(true);
    });

    it('should reject memos that are too long', () => {
      expect(isValidMemo('a'.repeat(50))).toBe(false);
    });
  });

  describe('getMemoByteLength', () => {
    it('should return correct byte length', () => {
      expect(getMemoByteLength('hello')).toBe(5);
      expect(getMemoByteLength('')).toBe(0);
    });
  });

  describe('truncateMemo', () => {
    it('should not truncate short messages', () => {
      expect(truncateMemo('hello')).toBe('hello');
    });

    it('should truncate long messages with ellipsis', () => {
      const longMsg = 'a'.repeat(50);
      const truncated = truncateMemo(longMsg, true);
      expect(truncated.endsWith('...')).toBe(true);
      expect(getMemoByteLength(truncated)).toBeLessThanOrEqual(MAX_MEMO_LENGTH);
    });
  });

  describe('createPrefixedMemo', () => {
    it('should create memo with prefix', () => {
      const memo = createPrefixedMemo('INVOICE', '12345');
      expect(memo).toBe('INV:12345');
    });
  });

  describe('parsePrefixedMemo', () => {
    it('should parse prefixed memo', () => {
      const result = parsePrefixedMemo('INV:12345');
      expect(result.prefix).toBe('INVOICE');
      expect(result.content).toBe('12345');
    });

    it('should return null prefix for unprefixed memo', () => {
      const result = parsePrefixedMemo('just a message');
      expect(result.prefix).toBeNull();
      expect(result.content).toBe('just a message');
    });
  });
});

