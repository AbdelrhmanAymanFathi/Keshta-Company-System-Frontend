/**
 * Flow Utilities for handling IN/OUT and signedAmount mapping
 * 
 * Mode A: Use (amount + flow) where:
 *   - flow: "IN" or "OUT"
 *   - amount: always positive
 *   - Backend stores signedAmount = amount (if IN) or -amount (if OUT)
 * 
 * Mode B: Use signedAmount directly
 *   - signedAmount: positive for IN, negative for OUT
 *   - amount and flow are derived from signedAmount
 */

/**
 * Convert amount + flow to signedAmount
 * @param {number | string} amount - Positive amount
 * @param {string} flow - 'IN' or 'OUT'
 * @returns {number} signedAmount (positive for IN, negative for OUT)
 */
export function convertToSignedAmount(amount, flow) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return 0;
  
  if (flow === 'IN') {
    return Math.abs(num);
  } else if (flow === 'OUT') {
    return -Math.abs(num);
  }
  
  return 0;
}

/**
 * Convert signedAmount to amount + flow
 * @param {number | string} signedAmount - Signed amount (positive or negative)
 * @returns {{amount: number, flow: string}} Object with positive amount and flow
 */
export function convertFromSignedAmount(signedAmount) {
  const num = typeof signedAmount === 'string' ? parseFloat(signedAmount) : signedAmount;
  
  if (isNaN(num)) {
    return { amount: 0, flow: 'OUT' };
  }
  
  return {
    amount: Math.abs(num),
    flow: num >= 0 ? 'IN' : 'OUT'
  };
}

/**
 * Detect user input mode: is it a negative number that should be treated as OUT?
 * If user types "-100" while flow is OUT, auto-correct to "100"
 * If user types "-100" while flow is IN, auto-correct to "100" and switch to OUT
 * @param {string | number} inputValue - Raw input value
 * @param {string} currentFlow - Current flow setting ('IN' or 'OUT')
 * @returns {{correctedAmount: number, suggestedFlow: string, needsCorrection: boolean}}
 */
export function detectNegativeInputCorrection(inputValue, currentFlow = 'OUT') {
  const num = typeof inputValue === 'string' ? parseFloat(inputValue) : inputValue;
  
  if (isNaN(num)) {
    return { correctedAmount: 0, suggestedFlow: currentFlow, needsCorrection: false };
  }
  
  if (num < 0) {
    // User entered negative number
    return {
      correctedAmount: Math.abs(num),
      suggestedFlow: 'OUT', // Negative typically means OUT
      needsCorrection: currentFlow !== 'OUT'
    };
  }
  
  return { correctedAmount: num, suggestedFlow: currentFlow, needsCorrection: false };
}

/**
 * Get localized label for flow
 * @param {string} flow - 'IN' or 'OUT'
 * @param {Object} labels - Labels object with IN and OUT translations
 * @returns {string} Localized label
 */
export function getFlowLabel(flow, labels = {}) {
  const defaults = {
    IN: 'Income',
    OUT: 'Expense'
  };
  
  return (labels[flow] || defaults[flow] || flow).toString();
}

/**
 * Get CSS class or color for flow indicator
 * @param {string} flow - 'IN' or 'OUT'
 * @returns {{bgColor: string, textColor: string, icon: string}} Color and icon info
 */
export function getFlowColor(flow) {
  if (flow === 'IN') {
    return {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      icon: '↓', // Down arrow for inflow
      arrowIcon: '▼'
    };
  } else if (flow === 'OUT') {
    return {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      icon: '↑', // Up arrow for outflow
      arrowIcon: '▲'
    };
  }
  
  return {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '→',
    arrowIcon: '→'
  };
}

/**
 * Get Tailwind classes for flow badge
 * @param {string} flow - 'IN' or 'OUT'
 * @returns {string} Tailwind class string
 */
export function getFlowBadgeClass(flow) {
  const colors = getFlowColor(flow);
  return `${colors.bgColor} ${colors.textColor} ${colors.borderColor}`;
}

/**
 * Validate flow value
 * @param {string} flow - Value to validate
 * @returns {boolean} True if valid flow
 */
export function isValidFlow(flow) {
  return flow === 'IN' || flow === 'OUT';
}

/**
 * Toggle flow between IN and OUT
 * @param {string} currentFlow - Current flow value
 * @returns {string} Opposite flow value
 */
export function toggleFlow(currentFlow) {
  return currentFlow === 'IN' ? 'OUT' : 'IN';
}

/**
 * Format signed amount with flow indicator
 * @param {number | string} signedAmount - Signed amount
 * @param {Function} currencyFormatter - Function to format as currency
 * @returns {string} Formatted string with flow indicator
 */
export function formatSignedAmount(signedAmount, currencyFormatter = null) {
  const num = typeof signedAmount === 'string' ? parseFloat(signedAmount) : signedAmount;
  
  if (isNaN(num)) return '0.00';
  
  const formatted = currencyFormatter 
    ? currencyFormatter(Math.abs(num))
    : Math.abs(num).toFixed(2);
  
  const prefix = num >= 0 ? '+' : '-';
  return prefix + formatted;
}

/**
 * Calculate total income and expenses from list of items
 * @param {Array} items - Array of expense objects with signedAmount
 * @returns {{totalIncome: number, totalExpense: number, net: number}}
 */
export function calculateTotals(items = []) {
  let totalIncome = 0;
  let totalExpense = 0;
  
  items.forEach(item => {
    const signed = typeof item.signedAmount === 'string' 
      ? parseFloat(item.signedAmount) 
      : item.signedAmount;
    
    if (signed > 0) {
      totalIncome += signed;
    } else if (signed < 0) {
      totalExpense += Math.abs(signed);
    }
  });
  
  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    net: Math.round((totalIncome - totalExpense) * 100) / 100
  };
}

/**
 * Parse flow from API response (handles both "IN"/"OUT" and "income"/"expense" formats)
 * @param {Object} item - API response item
 * @returns {string} Normalized flow value ('IN' or 'OUT')
 */
export function normalizeFlowFromAPI(item) {
  if (item.flow && (item.flow === 'IN' || item.flow === 'OUT')) {
    return item.flow;
  }
  
  // Fallback: infer from signedAmount
  if (item.signedAmount !== undefined) {
    const signed = typeof item.signedAmount === 'string' 
      ? parseFloat(item.signedAmount) 
      : item.signedAmount;
    return signed >= 0 ? 'IN' : 'OUT';
  }
  
  // Fallback: check income/expense fields
  if (item.income && item.expense) {
    return parseInt(item.income) > 0 ? 'IN' : 'OUT';
  }
  
  return 'OUT'; // Default to OUT
}
