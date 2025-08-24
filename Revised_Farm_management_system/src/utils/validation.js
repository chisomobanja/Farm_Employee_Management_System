
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateRequired = (fields, body) => {
  const missing = [];
  fields.forEach(field => {
    if (!body[field] || body[field].toString().trim() === '') {
      missing.push(field);
    }
  });
  return missing;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired
};
