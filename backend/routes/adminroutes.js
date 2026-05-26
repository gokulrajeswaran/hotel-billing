import express from 'express';
import { adminLogin } from '../controllers/admincontroller.js';

const router = express.Router();

router.post('/login', adminLogin);

export default router;