const User = require('./models/user');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import your Map model so the server can use it
const MapGraph = require('./models/Map'); 

// Import your Academic Staff model so the server can use it
const AcademicStaff = require('./models/Staff');

//import staff routes
const staffRoutes = require('./routes/staffRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to the Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Database connection error:', err));

// ==========================================
// 2. YOUR NEW API ROUTE
// ==========================================
app.get('/api/map', async (req, res) => {
    try {
        // Go to Atlas, find all map data, and wait for the response
        const campusMap = await MapGraph.find(); 
        
        // Send the data back as JSON
        res.status(200).json(campusMap); 
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch map data" });
    }
});
// ==========================================

// ==========================================
// NEW: Route to fetch Academic Staff Data
// ==========================================
app.get('/api/staff', async (req, res) => {
    try {
        const staffList = await AcademicStaff.find();
        res.status(200).json(staffList);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch staff data" });
    }
});

//staff routes
app.use('/api/staff', staffRoutes);

// 3. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Check if user exists in MongoDB
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 2. Check password (using plain text for now, match with seed data)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 3. Success!
        res.status(200).json({ 
            message: "Login successful", 
            token: "success-token-123" 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});