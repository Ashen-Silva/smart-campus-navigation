const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const User = require('./models/user');
const MapGraph = require('./models/Map');
const AcademicStaff = require('./models/Staff');

// Routes & Middleware
const staffRoutes = require('./routes/staffRoutes');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 1. Safe Database Connection
// ==========================================
// 1. Database Connection (Safe Bypass)
// ==========================================
try {
    if (process.env.MONGODB_URI) {
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log('✅ Connected to MongoDB'))
            .catch(err => console.error('❌ Database connection error:', err));
    } else {
        console.warn('⚠️  MONGODB_URI is undefined. Skipping database connection.');
    }
} catch (error) {
    console.error('⚠️  Database connection could not be initiated:', error);
}

// 2. API Routes
app.get('/api/map', async (req, res) => {
    try {
        // If connected, fetch real data; otherwise return empty array
        const campusMap = mongoose.connection.readyState === 1 ? await MapGraph.find() : [];
        res.status(200).json(campusMap);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch map data" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        // If DB is not connected, return a mock response for testing
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ 
                message: "Login successful (Mock Mode)", 
                token: "mock-token", 
                role: "admin" 
            });
        }

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'super_secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Staff routes
app.use('/api/staff', authMiddleware, staffRoutes);

// 3. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});