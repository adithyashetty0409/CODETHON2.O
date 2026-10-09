import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserByStudentId,
  findUserById,
} from '../services/store.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'smart_campus_codethon_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      password,
      confirmPassword,
      department,
      semester,
      role = 'student',
    } = req.body;

    // Field validation
    if (!name || !email || !password || !confirmPassword || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields (Name, Email, Department, Password).',
      });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required for student registration.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please verify.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate email
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check duplicate studentId
    if (studentId) {
      const existingId = await findUserByStudentId(studentId);
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Student ID already exists.',
        });
      }
    }

    // Create user
    const newUser = await createUser({
      name,
      studentId: studentId || '',
      email,
      password,
      department,
      semester: semester || 'Semester 1',
      role,
    });

    const token = generateToken(newUser._id || newUser.id, newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Smart Campus.',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        studentId: newUser.studentId,
        department: newUser.department,
        semester: newUser.semester,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email not found.',
      });
    }

    // Password comparison
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id || user.id, user.role);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

export default router;
