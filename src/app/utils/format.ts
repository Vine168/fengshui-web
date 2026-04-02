
/**
 * Global Number Formatting System
 * 
 * Rules:
 * - 0 to 999.00: Display full number
 * - 1,000 to 9,999.00: Show one decimal place + "K" (e.g., 1.2K)
 * - 10,000 to 999,999.00: Whole numbers + "K" (e.g., 15K)
 * - 1 million to < 1 billion: One decimal place + "M" (e.g., 1.5M)
 * - 1 billion+: One decimal place + "B" (e.g., 2.3B)
 * - All numbers in English numeric format
 */

export const formatNumber = (value: number | string): string => {
  let num: number;
  
  if (typeof value === 'string') {
    // Remove all non-numeric characters except dot and minus to handle currency strings like "$1,200.00"
    const clean = value.replace(/[^0-9.-]/g, '');
    num = parseFloat(clean);
  } else {
    num = value;
  }

  if (isNaN(num)) return '0';

  if (num < 1000) {
    // 0 to 999.00: Full number
    // toLocaleString helps with decimals if they exist, but we want up to 2.
    return num.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  }

  if (num < 10000) {
    // 1,000 to 9,999.00: 1 decimal place + K
    return (num / 1000).toFixed(1) + 'K';
  }

  if (num < 1000000) {
    // 10,000 to 999,999.00: Whole numbers + K
    return Math.floor(num / 1000).toFixed(0) + 'K';
  }

  if (num < 1000000000) {
    // 1M to < 1B: 1 decimal place + M
    return (num / 1000000).toFixed(1) + 'M';
  }

  // 1B+: 1 decimal place + B
  return (num / 1000000000).toFixed(1) + 'B';
};

/**
 * Returns the full unformatted number for hover details.
 * Example: 1,200.00
 */
export const formatFullNumber = (value: number | string): string => {
  let num: number;
  if (typeof value === 'string') {
    const clean = value.replace(/[^0-9.-]/g, '');
    num = parseFloat(clean);
  } else {
    num = value;
  }
  
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
