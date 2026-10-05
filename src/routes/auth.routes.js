import { Router } from 'express';
import { register, loginUser, veryFyEmail ,verifyCodeCtrl} from "../controllers/auth.controller.js"
import { UserModel } from '../models/user.model.js';
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js"
import { validateRegister } from "../middlewares/authValidator.js"

const router = Router();

router.post('/login', loginUser)

router.post('/register', validateRegister, register);

router.post("/verifyemail", veryFyEmail);

router.post("/verifycode",verifyCodeCtrl)
export default router;
