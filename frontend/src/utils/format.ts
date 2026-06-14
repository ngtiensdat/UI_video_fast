const THOUSAND = 1000;
const MILLION = 1000000;
const DECIMALS_LIMIT = 1;

/**
 * Formats a number to a compact string representation (e.g., 1.5K, 2.3M)
 */
export function formatCount(count: number): string {
  if (count >= MILLION) {
    return `${(count / MILLION).toFixed(DECIMALS_LIMIT).replace(/\.0$/, "")}M`;
  }
  if (count >= THOUSAND) {
    return `${(count / THOUSAND).toFixed(DECIMALS_LIMIT).replace(/\.0$/, "")}K`;
  }
  return count.toString();
}
export { THOUSAND, MILLION, DECIMALS_LIMIT };
