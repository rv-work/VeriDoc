import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../Utils/prisma.js';
import { ethers } from 'ethers';

export const Signup = async (req, res) => {
  try {
    const { name, password, email, dob, gender, role , walletAddress } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      return res.status(409).json({ msg: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob,
        gender,
        role,
        walletAddress 
      },
    });

    const token = jwt.sign({ id: user.id, Iam: user.role }, 'secretkey', {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, msg: 'User registered successfully', userRole : user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return res.status(401).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, Iam: user.role }, 'secretkey', {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, msg: 'Login successful', userRole : user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const CheckAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: 'No token. Auth denied' });

    const decoded = jwt.verify(token, 'secretkey');
    res.json({ success: true  , userRole : decoded.Iam });

  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export const Logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: 'No token. Auth denied' });

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ msg: 'Error clearing cookie' });
  }
};

export const Metamask = async (req, res) => {
  console.log("inside metamask controller");
  const VERIFY_MESSAGE = "Please sign this message to verify ownership of your wallet.";
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(401).json({ error: "Missing wallet signature or address" });
  }

  try {
    const recoveredAddress = ethers.verifyMessage(VERIFY_MESSAGE, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({ error: "Signature does not match address" });
    }

  
    const user = await prisma.user.findUnique({
      where: { walletAddress: recoveredAddress }, 
    });

    if(!user) {
      return res.status(403).json({ success : false ,  message: "address is not assosiated with any account " });
    }


    res.json({ success: true, message: "Signature verified successfully", address: recoveredAddress });
  } catch (err) {
    console.error("Signature verification failed", err);
    res.status(401).json({ error: "Invalid signature" });
  }
};
