const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Added for checking hashed passwords
const authMiddleware = require('./middleware/auth');

require('dotenv').config();

// Import Models
const User = require('./models/user');
const MapGraph = require('./models/Map'); 
const AcademicStaff = require('./models/Staff');

// Import Routes
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/authRoutes'); // ADDED: Import the new auth file

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to the Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Database connection error:', err));

// ==========================================
// API ROUTES
// ==========================================

// Auth Routes (Sign Up)
app.use('/api/auth', authRoutes); // ADDED: Mount the sign up routes

// Staff Routes
// FIXED: Removed global authMiddleware. It is handled per-route inside staffRoutes.js
app.use('/api/staff', staffRoutes); 

// Map Route
app.get('/api/map', async (req, res) => {
    try {
        const campusMap = await MapGraph.find(); 
        res.status(200).json(campusMap); 
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch map data" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Check if user exists in MongoDB
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 2. Check password
        // Since older seed data is plain text and new signups use bcrypt, we check both
        const isMatch = await bcrypt.compare(password, user.password);
        const isPlainTextMatch = (user.password === password);

        if (!isMatch && !isPlainTextMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 3. Generate JWT Token (Make sure the payload keys match what auth.js expects)
        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'super_secret_key',
            { expiresIn: '1h' }
        );

        // 4. Success!
        res.status(200).json({ 
            message: "Login successful", 
            token: token,
            role: user.role
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 3. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});