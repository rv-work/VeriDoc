import express from 'express';
import { verifyToken } from '../Middleware/Verify.js';
import { FetchRequests  , ApproveRequest, FetchAll, RemoveUniversitiy} from '../Controllers/AdminControllers.js';
import { adminToken } from '../Middleware/OnlyAdmin.js';

const adminRouter = express.Router();

adminRouter.get('/pending', verifyToken , adminToken , FetchRequests);
adminRouter.post('/accept', verifyToken , adminToken ,  ApproveRequest);
adminRouter.get('/all-universities', verifyToken , adminToken,   FetchAll);
adminRouter.post('/remove', verifyToken , adminToken ,   RemoveUniversitiy);

export default adminRouter;
