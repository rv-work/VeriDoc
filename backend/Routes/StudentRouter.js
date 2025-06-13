import express from 'express';
import { verifyToken } from '../Middleware/Verify.js';
import { ViewIssuer } from '../Controllers/StudentController.js';

const studentRouter = express.Router();

studentRouter.post('/view', verifyToken , ViewIssuer);

export default studentRouter;
