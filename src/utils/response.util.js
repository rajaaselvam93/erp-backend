const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

const created = (res, data = null, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, 400, errors);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Forbidden - Insufficient permissions') => {
  return error(res, message, 403);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

const conflict = (res, message = 'Resource already exists') => {
  return error(res, message, 409);
};

const validationError = (res, errors, message = 'Validation failed') => {
  return error(res, message, 422, errors);
};

const paginated = (res, data, total, page, limit, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  return success(res, data, message, 200, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
};

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  paginated,
};
