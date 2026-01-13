import express from 'express';
import { protect } from '../middleware/auth';
import {
  login,
  register,
  getProfile,
  logout
} from '../controllers/AuthController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router;