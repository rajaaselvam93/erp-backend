const Joi = require('joi');
const response = require('../utils/response.util');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return response.validationError(res, errors);
    }

    req[property] = value;
    next();
  };
};

// Common schemas
const schemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(100).default('createdAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
    search: Joi.string().max(200).allow('', null),
  }),

  uuid: Joi.string().uuid({ version: 'uuidv4' }),

  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

module.exports = { validate, schemas };
