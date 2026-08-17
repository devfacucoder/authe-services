import { Router } from 'express';
import { register, loginUser } from "../controllers/auth.controller.js"
import { UserModel } from '../models/user.model.js';
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js"
const router = Router();

router.post('/login',authRateLimiter, loginUser)

router.post('/register', register);
export default router;
