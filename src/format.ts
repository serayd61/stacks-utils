/**
 * Formatting Utilities
 * General formatting functions for blockchain data
 */

/**
 * Formats a block height with thousands separator
 * @param height - Block height
 * @param locale - Locale for formatting
 */
export function formatBlockHeight(height: number, locale: string = 'en-US'): string {
  return height.toLocaleString(locale);
}

/**
 * Formats a transaction ID for display
 * @param txId - Full transaction ID
 * @param length - Number of characters to show (default: 8)
 */
export function formatTxId(txId: string, length: number = 8): string {
  if (!txId) return '';
  // Remove 0x prefix if present
  const cleaned = txId.startsWith('0x') ? txId.slice(2) : txId;
  if (cleaned.length <= length * 2 + 3) return txId;
  return `0x${cleaned.slice(0, length)}...${cleaned.slice(-length)}`;
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in seconds
 * @param options - Intl.DateTimeFormat options
 */
export function formatTimestamp(
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  // Handle both seconds and milliseconds timestamps
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Intl.DateTimeFormat('en-US', options).format(new Date(ms));
}

/**
 * Formats a relative time (e.g., "5 minutes ago")
 * @param timestamp - Unix timestamp in seconds
 */
export function formatRelativeTime(timestamp: number): string {
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const now = Date.now();
  const diff = now - ms;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Formats a duration in blocks to human-readable time
 * @param blocks - Number of blocks
 * @param avgBlockTime - Average block time in seconds (default: ~10 min for Stacks)
 */
export function formatBlockDuration(blocks: number, avgBlockTime: number = 600): string {
  const totalSeconds = blocks * avgBlockTime;
  const hours = Math.floor(totalSeconds / 3600);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `~${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `~${hours} hour${hours > 1 ? 's' : ''}`;
  return `~${Math.floor(totalSeconds / 60)} minutes`;
}

/**
 * Formats a large number with SI suffixes (K, M, B)
 * @param num - Number to format
 * @param decimals - Number of decimal places
 */
export function formatLargeNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

/**
 * Formats a percentage
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @param includeSign - Whether to include + sign for positive values
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  includeSign: boolean = false
): string {
  const formatted = value.toFixed(decimals);
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Formats USD value
 * @param value - USD value
 * @param decimals - Number of decimal places
 */
export function formatUsd(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Pads a hex string to the specified length
 * @param hex - Hex string
 * @param length - Target length
 */
export function padHex(hex: string, length: number): string {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  return '0x' + cleaned.padStart(length, '0');
}

/**
 * Formats clarity value for display
 * @param clarityType - The clarity type string
 * @param value - The value
 */
export function formatClarityValue(clarityType: string, value: unknown): string {
  switch (clarityType) {
    case 'uint':
    case 'int':
      return String(value);
    case 'principal':
      return String(value);
    case 'bool':
      return value ? 'true' : 'false';
    case 'buff':
      return `0x${value}`;
    case 'string-ascii':
    case 'string-utf8':
      return `"${value}"`;
    default:
      return JSON.stringify(value);
  }
}

