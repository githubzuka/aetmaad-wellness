import express from 'express';
import { submitContact } from '../controllers/contactController.js';

const router = express.Router();

// Public: anyone can reach out to the ASHVA team
router.post('/', submitContact);

export default router;
