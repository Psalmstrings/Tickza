/**
 * Tickza Shared Currency & Financial Formatting Utility (NGN - Nigerian Naira)
 */
export const NAIRA_SYMBOL = '₦';

/**
 * Format a numeric amount as Nigerian Naira (NGN)
 * @param {number|string} amount - Amount in Naira
 * @param {Object} [options]
 * @param {number} [options.decimals] - Maximum fraction digits (defaults to 2)
 * @param {string} [options.zeroLabel] - Custom label if amount is 0 (e.g. 'FREE')
 * @returns {string} Formatted currency string with ₦
 */
export const formatNaira = (amount, options = {}) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return '₦0';
  }

  if (value === 0 && options && options.zeroLabel !== undefined && options.zeroLabel !== null) {
    return options.zeroLabel;
  }

  try {
    const minDigits = options && options.decimals !== undefined ? options.decimals : 0;
    const maxDigits = options && options.decimals !== undefined ? options.decimals : 2;

    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(value);
  } catch (e) {
    const minDigits = options && options.decimals !== undefined ? options.decimals : 0;
    const maxDigits = options && options.decimals !== undefined ? options.decimals : 2;

    const fallback = value.toLocaleString('en-US', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    return `₦${fallback}`;
  }
};

/**
 * Format an integer minor unit (kobo) as Nigerian Naira
 * @param {number|string} amountKobo - Amount in kobo (100 kobo = 1 Naira)
 * @param {Object} [options]
 * @returns {string} Formatted currency string
 */
export const formatKobo = (amountKobo, options = {}) => {
  const numKobo = Number(amountKobo);
  if (!Number.isFinite(numKobo)) return formatNaira(0, options);
  return formatNaira(numKobo / 100, options);
};

export default formatNaira;
