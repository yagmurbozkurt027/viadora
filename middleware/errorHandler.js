const log = require('../utils/logger');

// Custom error sınıfları
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Kimlik doğrulama başarısız') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Kaynak bulunamadı') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Çakışma oluştu') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Hata mesajları
const errorMessages = {
  400: 'Geçersiz istek',
  401: 'Kimlik doğrulama gerekli',
  403: 'Bu işlem için yetkiniz yok',
  404: 'Kaynak bulunamadı',
  409: 'Çakışma oluştu',
  422: 'İşlenemeyen varlık',
  429: 'Çok fazla istek',
  500: 'Sunucu hatası',
  502: 'Geçici sunucu hatası',
  503: 'Hizmet kullanılamıyor'
};

// Hata işleme middleware'i
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  log.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Geçersiz ID formatı';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} zaten kullanımda`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token süresi dolmuş';
    error = new AuthenticationError(message);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Dosya boyutu çok büyük';
    error = new ValidationError(message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Beklenmeyen dosya alanı';
    error = new ValidationError(message);
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    const message = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.';
    error = new AppError(message, 429);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || errorMessages[statusCode] || 'Bir hata oluştu';

  // Development vs Production error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`${req.originalUrl} - Sayfa bulunamadı`);
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler for unhandled rejections
const handleUnhandledRejection = (err) => {
  log.error('Unhandled Rejection', {
    error: err.message,
    stack: err.stack
  });
  
  // Gracefully shutdown the server
  process.exit(1);
};

// Global error handler for uncaught exceptions
const handleUncaughtException = (err) => {
  log.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  
  // Gracefully shutdown the server
  process.exit(1);
};

// Process error handlers
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 