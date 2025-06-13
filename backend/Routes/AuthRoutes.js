import express from 'express';
import { CheckAuth, Login, Signup , Logout, Metamask } from '../Controllers/AuthControllers.js';
import { verifyToken } from '../Middleware/Verify.js';

const authRouter = express.Router();

authRouter.post('/signup', Signup);
authRouter.post('/login', Login);
authRouter.get('/check', CheckAuth);
authRouter.post('/metamask', verifyToken,  Metamask);
authRouter.get('/logout', Logout);

export default authRouter;
