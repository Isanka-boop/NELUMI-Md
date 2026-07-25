// middlewares/auth.js (simple API key check for admin panel, optional)
module.exports = (req, res, next) => {
  // For production, add API key verification if needed. For now, allow all.
  next();
};
