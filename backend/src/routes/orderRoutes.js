import express from 'express';
import {
  createOrder,
  createVolunteerOrder,
  getAllOrders,
  getMyOrders,
  getMyVolunteerOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorize, checkVolunteerApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder);

router.route('/volunteer').post(protect, authorize('volunteer', 'admin'), createVolunteerOrder);

router.route('/my-volunteer-orders').get(protect, authorize('volunteer', 'admin'), getMyVolunteerOrders);

router.route('/all').get(protect, authorize('admin'), getAllOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router
  .route('/:id/status')
  .put(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, updateOrderStatus)
  .patch(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, updateOrderStatus);

export default router;
