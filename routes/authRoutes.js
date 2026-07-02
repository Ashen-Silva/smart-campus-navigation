const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// POST: Sign Up a new user
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken." });
        }

        // Create new user (role defaults to 'user')
        const newUser = new User({ username, password });
        await newUser.save();

        // Generate a token so they are logged in immediately after signing up
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role }, 
            process.env.JWT_SECRET || 'super_secret_key', // Fixed from YOUR_SECRET_KEY
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: "User created successfully", token, role: newUser.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;