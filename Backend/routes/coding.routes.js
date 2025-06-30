// Backend/routes/coding.routes.js
import { Router } from 'express';
import { getLeetCodePotd, getCodeforcesPotd,  } from '../controllers/coding.controller.js';
// import { verifyJWT } from '../middlewares/auth.middleware.js'; // You can comment this out or keep it if used elsewhere

const router = Router();

router.route("/leetcode-potd").get(getLeetCodePotd);



router.route("/codeforces-potd").get(getCodeforcesPotd);



export default router;
