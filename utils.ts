
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // Changed to 0 to strictly show rounded whole numbers
  }).format(value);
};

export const parseNumber = (value: string): number => {
  const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};
