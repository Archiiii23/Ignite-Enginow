/**
 * Higher-order function to avoid repetitive try/catch blocks in Express controllers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
