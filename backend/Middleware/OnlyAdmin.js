import jwt from 'jsonwebtoken';

export const adminToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success : false, message: 'No token. Auth denied Login First' });

    const decoded = jwt.verify(token, 'secretkey');
    if(decoded.Iam !== "admin"){
      return res.status(401).json({ success : false, message: 'Only Admin Can Perform this action' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
