/**
 * Standard API Response Format conforming to Ignite Enginow Specifications
 */

export const successResponse = (res, statusCode = 200, message = "Operation successful", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode = 500, message = "Operation failed", code = "SERVER_ERROR", details = null) => {
  const payload = {
    success: false,
    message,
    code,
  };
  if (details && process.env.NODE_ENV !== "production") {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
};

export const paginatedResponse = (res, statusCode = 200, data = [], pagination = {}) => {
  const { page = 1, limit = 10, total = 0 } = pagination;
  const totalPages = Math.ceil(total / (limit || 1)) || 1;
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages,
    },
  });
};

export const ApiResponse = {
  success: (res, data, message = "Operation successful", statusCode = 200) =>
    successResponse(res, statusCode, message, data),
  created: (res, data, message = "Resource created successfully") =>
    successResponse(res, 201, message, data),
  error: (res, message = "Operation failed", statusCode = 500, code = "SERVER_ERROR", details = null) =>
    errorResponse(res, statusCode, message, code, details),
};
