import { Router } from 'express';
import { register, loginUser, veryFyEmail, verifyCodeCtrl, recoverPassword, passwrodChangeStart } from "../controllers/auth.controller.js"
import { UserModel } from '../models/user.model.js';
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js"
import { validateRegister } from "../middlewares/authValidator.js"

const router = Router();

router.post('/login', loginUser)

router.post('/register', validateRegister, register);

router.post("/verify-email", veryFyEmail);

router.post("/verify-code", verifyCodeCtrl)


router.post("/send-email-recover", passwrodChangeStart)
router.post("/recover-password", recoverPassword)

export default router;
