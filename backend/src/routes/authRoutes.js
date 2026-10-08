import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  applyVolunteer,
  updateUserProfile,
  requestPasswordReset,
  adminResetUserPassword,
  getLoginAttempts,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/login-attempts', getLoginAttempts);
router.post('/forgot-password', requestPasswordReset);
router.get('/profile', protect, getUserProfile);
router.post('/apply-volunteer', protect, applyVolunteer);
router.put('/profile', protect, updateUserProfile);
router.patch('/users/:id/password', protect, authorize('admin'), adminResetUserPassword);

export default router;
