import express from 'express';
import { getcategories, addcategory, updatecategory, deletecategory } from '../controllers/categorycontroller.js';

const router = express.Router();

router.get('/', getcategories);
router.post('/add', addcategory);
router.put('/update/:id', updatecategory);
router.delete('/delete/:id', deletecategory);

export default router;