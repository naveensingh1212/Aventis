import express from 'express';
import getContest from '../controllers/contest.controller.js';

const router = express.Router();

router.get('/',getContest);

export default router;