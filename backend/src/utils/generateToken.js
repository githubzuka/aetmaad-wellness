import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a given user ID
 * @param {string} id - User ObjectId
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
