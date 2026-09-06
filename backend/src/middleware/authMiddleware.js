import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - Verifies JWT bearer token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Authorize roles - RBAC authorization
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'volunteer')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Ensure volunteers have approved status before performing operations
 */
export const checkVolunteerApproval = (req, res, next) => {
  if (req.user && req.user.role === 'volunteer') {
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        message: `Volunteer access restricted. Current approval status: '${req.user.status}'. Account must be approved by an admin.`,
      });
    }
  }
  next();
};
