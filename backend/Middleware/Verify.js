import jwt from 'jsonwebtoken';
import { prisma } from '../Utils/prisma.js';
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success : false, message: 'No token. Auth denied Login First' });

    const decoded = jwt.verify(token, 'secretkey');
    req.user = await prisma.user.findUnique({
      where: {
        id : decoded.id,
      },
    });
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
