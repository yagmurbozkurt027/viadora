const Joi = require('joi');
const log = require('../utils/logger');

// Validation schemas
const schemas = {
  // User validation schemas
  userRegister: Joi.object({
    username: Joi.string().min(3).max(30).required()
      .messages({
        'string.min': 'Kullanıcı adı en az 3 karakter olmalıdır',
        'string.max': 'Kullanıcı adı en fazla 30 karakter olabilir',
        'any.required': 'Kullanıcı adı zorunludur'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi zorunludur'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'any.required': 'Şifre zorunludur'
      })
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi zorunludur'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Şifre zorunludur'
      })
  }),

  userUpdateProfile: Joi.object({
    userId: Joi.string().required()
      .messages({
        'any.required': 'Kullanıcı ID zorunludur'
      }),
    username: Joi.string().min(3).max(30).required()
      .messages({
        'string.min': 'Kullanıcı adı en az 3 karakter olmalıdır',
        'string.max': 'Kullanıcı adı en fazla 30 karakter olabilir',
        'any.required': 'Kullanıcı adı zorunludur'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi zorunludur'
      }),
    phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]+$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
      }),
    birthDate: Joi.string().pattern(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Doğum tarihi gg.aa.yyyy formatında olmalıdır'
      }),
    gender: Joi.string().valid('erkek', 'kadın', 'diğer').optional()
      .messages({
        'any.only': 'Geçerli bir cinsiyet seçiniz'
      }),
    address: Joi.object({
      city: Joi.string().max(50).optional()
        .messages({
          'string.max': 'Şehir adı en fazla 50 karakter olabilir'
        }),
      district: Joi.string().max(50).optional()
        .messages({
          'string.max': 'İlçe adı en fazla 50 karakter olabilir'
        }),
      postalCode: Joi.string().pattern(/^[0-9]{5}$/).optional()
        .messages({
          'string.pattern.base': 'Posta kodu 5 haneli olmalıdır'
        }),
      fullAddress: Joi.string().max(200).optional()
        .messages({
          'string.max': 'Adres en fazla 200 karakter olabilir'
        })
    }).optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      marketing: Joi.boolean().optional(),
      security: Joi.boolean().optional()
    }).optional(),
    privacy: Joi.object({
      profileVisible: Joi.boolean().optional(),
      showEmail: Joi.boolean().optional(),
      showPhone: Joi.boolean().optional(),
      showBirthDate: Joi.boolean().optional(),
      allowSearch: Joi.boolean().optional(),
      dataSharing: Joi.boolean().optional()
    }).optional()
  }),

  // Product validation schemas
  productCreate: Joi.object({
    name: Joi.string().min(2).max(100).required()
      .messages({
        'string.min': 'Ürün adı en az 2 karakter olmalıdır',
        'string.max': 'Ürün adı en fazla 100 karakter olabilir',
        'any.required': 'Ürün adı zorunludur'
      }),
    description: Joi.string().min(10).max(1000).required()
      .messages({
        'string.min': 'Ürün açıklaması en az 10 karakter olmalıdır',
        'string.max': 'Ürün açıklaması en fazla 1000 karakter olabilir',
        'any.required': 'Ürün açıklaması zorunludur'
      }),
    price: Joi.number().positive().required()
      .messages({
        'number.positive': 'Fiyat pozitif olmalıdır',
        'any.required': 'Fiyat zorunludur'
      }),
    category: Joi.string().required()
      .messages({
        'any.required': 'Kategori zorunludur'
      }),
    stock: Joi.number().integer().min(0).required()
      .messages({
        'number.integer': 'Stok sayısı tam sayı olmalıdır',
        'number.min': 'Stok sayısı 0 veya daha büyük olmalıdır',
        'any.required': 'Stok sayısı zorunludur'
      })
  }),

  // Cart validation schemas
  cartAddItem: Joi.object({
    productId: Joi.string().required()
      .messages({
        'any.required': 'Ürün ID zorunludur'
      }),
    quantity: Joi.number().integer().min(1).max(100).required()
      .messages({
        'number.integer': 'Miktar tam sayı olmalıdır',
        'number.min': 'Miktar en az 1 olmalıdır',
        'number.max': 'Miktar en fazla 100 olabilir',
        'any.required': 'Miktar zorunludur'
      })
  }),

  // Order validation schemas
  orderCreate: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required()
      })
    ).min(1).required()
      .messages({
        'array.min': 'En az bir ürün seçilmelidir',
        'any.required': 'Ürünler zorunludur'
      }),
    shippingAddress: Joi.object({
      city: Joi.string().required(),
      district: Joi.string().required(),
      postalCode: Joi.string().pattern(/^[0-9]{5}$/).required(),
      fullAddress: Joi.string().required()
    }).required()
      .messages({
        'any.required': 'Teslimat adresi zorunludur'
      })
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      log.error(`Validation schema not found: ${schemaName}`);
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      log.warn('Validation failed', {
        schema: schemaName,
        errors: errorMessages,
        body: req.body
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Sanitized data'yı req.body'ye ata
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      log.error(`Validation schema not found: ${schemaName}`);
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      log.warn('Query validation failed', {
        schema: schemaName,
        errors: errorMessages,
        query: req.query
      });
      
      return res.status(400).json({
        error: 'Query validation failed',
        details: errorMessages
      });
    }

    req.query = value;
    next();
  };
};

// XSS Protection middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // XSS koruması için basit temizleme
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  
  next();
};

module.exports = {
  validate,
  validateQuery,
  sanitizeInput,
  schemas
}; 