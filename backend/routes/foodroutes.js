import express from 'express';
import { getfoods, addfood, updatefood, deletefood } from '../controllers/foodcontroller.js';

const router = express.Router();

router.get('/', getfoods);
router.post('/add', addfood);
router.put('/update/:id', updatefood);
router.delete('/delete/:id', deletefood);

export default router;