import express from 'express';
import { getvarieties, addvariety, updatevariety, deletevariety } from '../controllers/varietycontroller.js';

const router = express.Router();

router.get('/', getvarieties);
router.post('/add', addvariety);
router.put('/update/:id', updatevariety);
router.delete('/delete/:id', deletevariety);

export default router;