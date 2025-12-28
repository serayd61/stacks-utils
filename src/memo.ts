/**
 * Memo Utilities
 * Encode/decode transaction memos for Stacks
 */

// Maximum memo length in bytes
export const MAX_MEMO_LENGTH = 34;

/**
 * Encodes a string to a transaction memo (hex)
 * @param message - The message to encode
 * @param padToLength - Whether to pad to max length
 */
export function encodeMemo(message: string, padToLength: boolean = true): string {
  if (!message) return padToLength ? '00'.repeat(MAX_MEMO_LENGTH) : '';
  
  // Convert string to bytes
  const encoder = new TextEncoder();
  let bytes = encoder.encode(message);
  
  // Truncate if too long
  if (bytes.length > MAX_MEMO_LENGTH) {
    bytes = bytes.slice(0, MAX_MEMO_LENGTH);
  }
  
  // Convert to hex
  let hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Pad with zeros if needed
  if (padToLength) {
    hex = hex.padEnd(MAX_MEMO_LENGTH * 2, '0');
  }
  
  return hex;
}

/**
 * Decodes a transaction memo from hex to string
 * @param hex - The hex-encoded memo
 */
export function decodeMemo(hex: string): string {
  if (!hex) return '';
  
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Convert hex to bytes, removing trailing zeros
  const bytes: number[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.slice(i, i + 2), 16);
    if (byte !== 0) {
      bytes.push(byte);
    } else {
      // Check if rest is all zeros
      const rest = cleanHex.slice(i);
      if (rest === '0'.repeat(rest.length)) {
        break;
      }
      bytes.push(byte);
    }
  }
  
  // Convert bytes to string
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(new Uint8Array(bytes)).trim();
}

/**
 * Validates a memo string
 * @param message - The message to validate
 */
export function isValidMemo(message: string): boolean {
  if (!message) return true; // Empty is valid
  
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  
  return bytes.length <= MAX_MEMO_LENGTH;
}

/**
 * Gets the byte length of a memo
 * @param message - The message
 */
export function getMemoByteLength(message: string): number {
  if (!message) return 0;
  const encoder = new TextEncoder();
  return encoder.encode(message).length;
}

/**
 * Truncates a message to fit in a memo
 * @param message - The message to truncate
 * @param ellipsis - Whether to add ellipsis
 */
export function truncateMemo(message: string, ellipsis: boolean = true): string {
  if (!message) return '';
  
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  
  if (bytes.length <= MAX_MEMO_LENGTH) {
    return message;
  }
  
  // Find the max length that fits
  const maxLength = ellipsis ? MAX_MEMO_LENGTH - 3 : MAX_MEMO_LENGTH;
  let truncated = message;
  
  while (encoder.encode(truncated).length > maxLength && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  
  return ellipsis ? truncated + '...' : truncated;
}

/**
 * Common memo prefixes for specific use cases
 */
export const MEMO_PREFIXES = {
  // Exchange identifiers
  EXCHANGE_ID: 'EX:',
  
  // Invoice/payment references
  INVOICE: 'INV:',
  
  // Order references
  ORDER: 'ORD:',
  
  // Tip/donation messages
  TIP: 'TIP:',
  
  // Stacking
  STACK: 'STK:',
  
  // Bridge transactions
  BRIDGE: 'BRG:',
} as const;

/**
 * Creates a formatted memo with a prefix
 * @param prefix - The prefix to use
 * @param content - The content
 */
export function createPrefixedMemo(
  prefix: keyof typeof MEMO_PREFIXES,
  content: string
): string {
  const fullMemo = `${MEMO_PREFIXES[prefix]}${content}`;
  return truncateMemo(fullMemo, false);
}

/**
 * Parses a prefixed memo
 * @param memo - The memo to parse
 */
export function parsePrefixedMemo(memo: string): {
  prefix: string | null;
  content: string;
} {
  for (const [key, prefix] of Object.entries(MEMO_PREFIXES)) {
    if (memo.startsWith(prefix)) {
      return {
        prefix: key,
        content: memo.slice(prefix.length),
      };
    }
  }
  
  return {
    prefix: null,
    content: memo,
  };
}

/**
 * Encodes a JSON object as a memo (compact)
 * @param data - The data to encode
 */
export function encodeJsonMemo(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  return encodeMemo(json, false);
}

/**
 * Decodes a JSON memo
 * @param hex - The hex-encoded memo
 */
export function decodeJsonMemo(hex: string): Record<string, unknown> | null {
  try {
    const decoded = decodeMemo(hex);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

