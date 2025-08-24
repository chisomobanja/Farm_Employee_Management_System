const handleError = (res, error, message = 'Internal server error') => {
  console.error('Error:', error);
  
  // Check if response has already been sent
  if (res.headersSent) {
    return;
  }
  
  // Send error response
  res.status(500).json({ 
    error: message, 
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
};

// Global error middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error('Global error:', err.stack);
  
  // Check if response has already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = { handleError, globalErrorHandler };
