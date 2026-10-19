/**
 * Tickza Currency & Financial Formatting Utility (NGN - Nigerian Naira)
 */

export const NAIRA_SYMBOL = '₦';

/**
 * Format a number or numeric string as Nigerian Naira (NGN)
 * @param {number|string} amount - Amount in Naira
 * @param {Object} options
 * @param {number} [options.decimals=0] - Decimal places (default 0 for clean event pricing)
 * @param {boolean} [options.showSymbol=true] - Whether to prepend ₦
 * @param {string} [options.zeroLabel] - Optional custom label if amount is 0 (e.g. 'FREE')
 * @returns {string} Formatted currency string
 */
export const formatNaira = (amount, { decimals = 0, showSymbol = true, zeroLabel = null } = {}) => {
  const num = Number(amount);
  if (isNaN(num)) return showSymbol ? `${NAIRA_SYMBOL}0` : '0';

  if (num === 0 && zeroLabel !== null) {
    return zeroLabel;
  }

  // Format using standard Intl API
  try {
    const formatted = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);

    return showSymbol ? `${NAIRA_SYMBOL}${formatted}` : formatted;
  } catch (e) {
    // Fallback if Intl fails
    const fallback = num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return showSymbol ? `${NAIRA_SYMBOL}${fallback}` : fallback;
  }
};

/**
 * Format an integer minor unit (kobo) as Nigerian Naira
 * @param {number|string} amountKobo - Amount in kobo (100 kobo = 1 Naira)
 * @param {Object} options
 * @returns {string} Formatted currency string
 */
export const formatKobo = (amountKobo, options = {}) => {
  const numKobo = Number(amountKobo);
  if (isNaN(numKobo)) return formatNaira(0, options);
  return formatNaira(numKobo / 100, options);
};

export default formatNaira;
