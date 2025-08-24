const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const sanitizeString = (str) => {
  return str ? str.toString().trim() : '';
};

const generateEmployeeId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `EMP-${timestamp.slice(-6)}-${random.toUpperCase()}`;
};

const generateToolId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `TOOL-${timestamp.slice(-6)}-${random.toUpperCase()}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

module.exports = {
  formatDate,
  sanitizeString,
  generateEmployeeId,
  generateToolId,
  formatCurrency
};
