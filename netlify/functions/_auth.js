const jwt = require('jsonwebtoken');

exports.verifyAdmin = (event) => {
  const authHeader = event.headers.authorization;

  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
