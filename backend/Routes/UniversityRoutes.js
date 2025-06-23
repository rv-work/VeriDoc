import express from 'express';
import { verifyToken } from '../Middleware/Verify.js';
import { CheckStatus, GetDetails, UniversityRequest } from '../Controllers/UniversityControllers.js';
import { instituteToken } from '../Middleware/OnlyInstitute.js';

const universityRouter = express.Router();

universityRouter.post('/request', verifyToken , instituteToken,   UniversityRequest);
universityRouter.post('/status', verifyToken , instituteToken,  CheckStatus);
universityRouter.get('/details', verifyToken ,  GetDetails);

export default universityRouter;
