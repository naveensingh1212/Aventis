import express from 'express';
import { getCodeforcesContests, getLeetCodeContests, getCodeChefContests } from '../controllers/contest.controller.js';

const router = express.Router();

router.get('/codeforces', getCodeforcesContests);
router.get('/leetcode', getLeetCodeContests);
router.get('/codechef', getCodeChefContests);

export default router;