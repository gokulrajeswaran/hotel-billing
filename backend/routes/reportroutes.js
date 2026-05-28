import express from 'express';
import {
    datewiseCollection,
    foodwiseCollection,
    billwiseCollection,
    dayBook
} from '../controllers/reportcontroller.js';

const router = express.Router();

router.get('/datewise-collection', datewiseCollection);
router.get('/foodwise-collection',  foodwiseCollection);
router.get('/billwise-collection',  billwiseCollection);
router.get('/daybook',              dayBook);

export default router;