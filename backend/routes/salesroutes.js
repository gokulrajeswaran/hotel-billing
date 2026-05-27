import express from 'express';
import { saveSale, getSaleByDetails } from '../controllers/salecontroller.js';
const router = express.Router();

router.post('/save', saveSale);
router.get('/find', getSaleByDetails);

export default router;