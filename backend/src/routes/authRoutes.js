import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  applyVolunteer,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/apply-volunteer', protect, applyVolunteer);
router.put('/profile', protect, updateUserProfile);

export default router;
