
/**
 * Format a number as currency
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with specified decimal places
 * @param value The number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
