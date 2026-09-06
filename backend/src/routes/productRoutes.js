import express from 'express';
import {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize, checkVolunteerApproval } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, updateProduct)
  .delete(protect, authorize('admin', 'volunteer'), checkVolunteerApproval, deleteProduct);

export default router;
