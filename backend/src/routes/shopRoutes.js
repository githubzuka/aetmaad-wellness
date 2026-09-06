import express from 'express';
import {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from '../controllers/shopController.js';
import { getProductsByShop, createProduct } from '../controllers/productController.js';
import { getShopOrders } from '../controllers/orderController.js';
import { submitShopFeedback, getShopFeedbackHistory } from '../controllers/shopFeedbackController.js';
import { protect, authorize, checkVolunteerApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getShops)
  .post(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, createShop);

router
  .route('/:id')
  .get(getShopById)
  .put(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, updateShop)
  .delete(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, deleteShop);

// Weekly Shop Feedback Routes
router
  .route('/:id/feedback')
  .post(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, submitShopFeedback)
  .get(protect, getShopFeedbackHistory);

// Nested Product Routes for Shop
router
  .route('/:shopId/products')
  .get(getProductsByShop)
  .post(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, createProduct);

// Nested Order Routes for Shop
router
  .route('/:shopId/orders')
  .get(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, getShopOrders);

export default router;
