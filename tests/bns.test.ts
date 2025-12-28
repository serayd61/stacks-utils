import { describe, it, expect } from 'vitest';
import {
  parseBnsName,
  isValidBnsName,
  isValidBnsNamespace,
  isValidFullBnsName,
  constructBnsName,
  formatBnsName,
  isKnownNamespace,
  estimateNamePrice,
} from '../src/bns';

describe('BNS Utilities', () => {
  describe('parseBnsName', () => {
    it('should parse valid BNS names', () => {
      const result = parseBnsName('satoshi.btc');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('satoshi');
      expect(result.namespace).toBe('btc');
    });

    it('should reject names without namespace', () => {
      const result = parseBnsName('satoshi');
      expect(result.isValid).toBe(false);
    });

    it('should reject names with multiple dots', () => {
      const result = parseBnsName('satoshi.nakamoto.btc');
      expect(result.isValid).toBe(false);
    });

    it('should handle empty input', () => {
      const result = parseBnsName('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('isValidBnsName', () => {
    it('should validate correct names', () => {
      expect(isValidBnsName('satoshi')).toBe(true);
      expect(isValidBnsName('my-name')).toBe(true);
      expect(isValidBnsName('name123')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidBnsName('')).toBe(false);
      expect(isValidBnsName('-invalid')).toBe(false);
      expect(isValidBnsName('invalid-')).toBe(false);
      expect(isValidBnsName('UPPER')).toBe(false);
    });

    it('should accept single character names', () => {
      expect(isValidBnsName('a')).toBe(true);
      expect(isValidBnsName('1')).toBe(true);
    });
  });

  describe('isValidBnsNamespace', () => {
    it('should validate correct namespaces', () => {
      expect(isValidBnsNamespace('btc')).toBe(true);
      expect(isValidBnsNamespace('stx')).toBe(true);
      expect(isValidBnsNamespace('id')).toBe(true);
    });

    it('should reject invalid namespaces', () => {
      expect(isValidBnsNamespace('')).toBe(false);
      expect(isValidBnsNamespace('has-hyphen')).toBe(false);
    });
  });

  describe('isValidFullBnsName', () => {
    it('should validate full BNS names', () => {
      expect(isValidFullBnsName('satoshi.btc')).toBe(true);
      expect(isValidFullBnsName('my-name.stx')).toBe(true);
    });

    it('should reject invalid full names', () => {
      expect(isValidFullBnsName('satoshi')).toBe(false);
      expect(isValidFullBnsName('.btc')).toBe(false);
    });
  });

  describe('constructBnsName', () => {
    it('should construct full name from parts', () => {
      expect(constructBnsName('satoshi', 'btc')).toBe('satoshi.btc');
      expect(constructBnsName('MyName', 'STX')).toBe('myname.stx');
    });
  });

  describe('formatBnsName', () => {
    it('should format name with emoji', () => {
      expect(formatBnsName('satoshi.btc')).toBe('🔗 satoshi.btc');
    });

    it('should format name without emoji', () => {
      expect(formatBnsName('satoshi.btc', false)).toBe('satoshi.btc');
    });
  });

  describe('isKnownNamespace', () => {
    it('should recognize known namespaces', () => {
      expect(isKnownNamespace('btc')).toBe(true);
      expect(isKnownNamespace('stx')).toBe(true);
      expect(isKnownNamespace('id')).toBe(true);
    });

    it('should not recognize unknown namespaces', () => {
      expect(isKnownNamespace('unknown')).toBe(false);
    });
  });

  describe('estimateNamePrice', () => {
    it('should return higher price for short names', () => {
      const shortPrice = estimateNamePrice('abc', 'btc');
      const longPrice = estimateNamePrice('satoshinakamoto', 'btc');
      expect(shortPrice).toBeGreaterThan(longPrice);
    });
  });
});

