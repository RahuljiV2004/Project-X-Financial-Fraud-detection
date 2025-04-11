const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword ? 'Yes' : 'No');
    
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    console.log('Login successful for:', email);
    res.json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message,
      details: error.toString()
    });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          email: !email,
          password: !password,
          role: !role
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name: name || email.split('@')[0]
    });

    await user.save();
    console.log('User created successfully:', email);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    res.status(201).json(userData);
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message,
      details: error.toString(),
      validationErrors: error.errors
    });
  }
});

// Test route to get all users
router.get('/test', async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, role: 1 });
    res.json({ message: 'Server is running', users });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

module.exports = router; 