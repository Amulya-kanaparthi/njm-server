import express from 'express';
import { getBooks, getChapters, getVerses } from '../controllers/bibleController.js';

const router = express.Router();

router.get('/books/:language',getBooks);

router.get('/:language/:book/chapters',getChapters);

router.get('/:language/:book/:chapter',getVerses);


export default router;