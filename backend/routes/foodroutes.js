import express from 'express';
import { getfoods, addfood, updatefood, deletefood, translatefood } from '../controllers/foodcontroller.js';

const router = express.Router();

router.get('/', getfoods);
router.post('/translate', translatefood);
router.post('/add', addfood);
router.put('/update/:id', updatefood);
router.delete('/delete/:id', deletefood);

export default router;