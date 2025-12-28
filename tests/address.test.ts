import { describe, it, expect } from 'vitest';
import {
  isValidStacksAddress,
  parseStacksAddress,
  shortenAddress,
  isMainnetAddress,
  isTestnetAddress,
  getNetworkFromAddress,
  addressesEqual,
} from '../src/address';

describe('Address Utilities', () => {
  describe('isValidStacksAddress', () => {
    it('should validate mainnet single-sig addresses', () => {
      expect(isValidStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe(true);
    });

    it('should validate testnet single-sig addresses', () => {
      expect(isValidStacksAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidStacksAddress('')).toBe(false);
      expect(isValidStacksAddress('invalid')).toBe(false);
      expect(isValidStacksAddress('0x1234')).toBe(false);
      expect(isValidStacksAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(false);
    });
  });

  describe('parseStacksAddress', () => {
    it('should parse mainnet single-sig address', () => {
      const result = parseStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
      expect(result).not.toBeNull();
      expect(result?.network).toBe('mainnet');
      expect(result?.type).toBe('single-sig');
      expect(result?.isValid).toBe(true);
    });

    it('should return null for invalid address', () => {
      expect(parseStacksAddress('invalid')).toBeNull();
    });
  });

  describe('shortenAddress', () => {
    it('should shorten long addresses', () => {
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      expect(shortenAddress(address)).toBe('SP2J6...9EJ7');
    });

    it('should handle custom lengths', () => {
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      expect(shortenAddress(address, 8, 6)).toBe('SP2J6ZY4...RV9EJ7');
    });

    it('should return short addresses unchanged', () => {
      expect(shortenAddress('SP123')).toBe('SP123');
    });
  });

  describe('network detection', () => {
    it('should detect mainnet addresses', () => {
      expect(isMainnetAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe(true);
      expect(isMainnetAddress('SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe(true);
      expect(isMainnetAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).toBe(false);
    });

    it('should detect testnet addresses', () => {
      expect(isTestnetAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).toBe(true);
      expect(isTestnetAddress('SN2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).toBe(true);
      expect(isTestnetAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe(false);
    });

    it('should get network from address', () => {
      expect(getNetworkFromAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).toBe('mainnet');
      expect(getNetworkFromAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).toBe('testnet');
      expect(getNetworkFromAddress('invalid')).toBeNull();
    });
  });

  describe('addressesEqual', () => {
    it('should compare addresses case-insensitively', () => {
      const addr1 = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const addr2 = 'sp2j6zy48gv1ez5v2v5rb9mp66sw86pykknrv9ej7';
      expect(addressesEqual(addr1, addr2)).toBe(true);
    });

    it('should return false for different addresses', () => {
      const addr1 = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const addr2 = 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ';
      expect(addressesEqual(addr1, addr2)).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(addressesEqual('', 'SP123')).toBe(false);
    });
  });
});

