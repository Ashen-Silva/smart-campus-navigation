// routes/staffRoutes.js
// Each route calls the exact methods defined in models/Staff.js
// Supports complete in-memory mock persistence when database is not connected.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AcademicStaff = require('../models/Staff');

// In-memory mock database for offline mode
let mockStaff = [
    { id: "mock-1", name: "Dr. Sandamal", department: "CSE", currentStatus: "InOffice", location: "Department of Computer Science and Engineering - Room 201", confidenceScore: 5, privacyMode: false },
    { id: "mock-2", name: "Dr. Ranmali", department: "Electrical", currentStatus: "InLecture", location: "Electrical Department - Lecture Hall 1", confidenceScore: 3, privacyMode: false },
    { id: "mock-3", name: "Dr. Ashen Silva", department: "CSE", currentStatus: "InTransit", location: "Department of Computer Science and Engineering Hall 1", confidenceScore: 8, privacyMode: false }
];

// Helper to format mock profile
function getMockPublicProfile(person) {
    if (person.privacyMode) {
        return {
            id: person.id,
            name: person.name,
            department: person.department,
            currentStatus: "PrivacyMode_DoNotDisturb",
            location: "Hidden",
        };
    }
    return {
        id: person.id,
        name: person.name,
        department: person.department,
        currentStatus: person.currentStatus,
        location: person.location,
        confidenceScore: person.confidenceScore,
    };
}

// ============================================================
// ROUTE 1 — GET /api/staff
// Calls: getPublicProfile() on every staff member
// Returns: all staff — hides location if privacyMode is true
// ============================================================
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const profiles = mockStaff.map(getMockPublicProfile);
            return res.status(200).json(profiles);
        }

        const allStaff = await AcademicStaff.find();
        const profiles = allStaff.map(person => person.getPublicProfile());
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch staff list' });
    }
});

// ============================================================
// ROUTE 2 — GET /api/staff/:id
// Calls: getPublicProfile() on one staff member
// Returns: single staff public profile
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const person = mockStaff.find(p => p.id === req.params.id);
            if (!person) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            return res.status(200).json(getMockPublicProfile(person));
        }

        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        res.status(200).json(person.getPublicProfile());
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch staff member' });
    }
});

// ============================================================
// ROUTE 3 — PUT /api/staff/:id/location
// Calls: updateLocation(location, status) — METHOD 1 in Staff.js
// Body:  { location: "Room 201", currentStatus: "InOffice" }
// ============================================================
router.put('/:id/location', async (req, res) => {
    try {
        const { location, currentStatus } = req.body;
        const allowedStatuses = [
            'UnknownStatus',
            'InOffice',
            'InLecture',
            'InTransit',
            'PrivacyMode_DoNotDisturb'
        ];

        if (!location || !currentStatus) {
            return res.status(400).json({ 
                error: 'Both location and currentStatus are required' 
            });
        }

        if (!allowedStatuses.includes(currentStatus)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` 
            });
        }

        if (mongoose.connection.readyState !== 1) {
            const person = mockStaff.find(p => p.id === req.params.id);
            if (!person) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            if (person.privacyMode) {
                return res.status(403).json({ error: `${person.name} has privacy mode enabled` });
            }
            person.location = location;
            person.currentStatus = currentStatus;
            person.confidenceScore += 1;
            return res.status(200).json({
                success: true,
                message: `${person.name}'s location updated successfully`,
                staff: getMockPublicProfile(person)
            });
        }

        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 1 from Staff.js — updateLocation(location, status)
        const result = person.updateLocation(location, currentStatus);

        if (!result.success) {
            return res.status(403).json({ error: result.message });
        }

        await person.save(); // Save updated fields to MongoDB
        res.status(200).json({
            success: true,
            message: result.message,
            staff: person.getPublicProfile()
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// ============================================================
// ROUTE 4 — PUT /api/staff/:id/privacy/enable
// Calls: enablePrivacy() — METHOD 2 in Staff.js
// ============================================================
router.put('/:id/privacy/enable', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const person = mockStaff.find(p => p.id === req.params.id);
            if (!person) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            person.privacyMode = true;
            person.currentStatus = "PrivacyMode_DoNotDisturb";
            person.location = "Unknown";
            person.confidenceScore = 0;
            return res.status(200).json({
                success: true,
                message: `${person.name} is now in Privacy Mode - Do Not Disturb`
            });
        }

        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 2 from Staff.js — enablePrivacy()
        const result = person.enablePrivacy();

        await person.save();
        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to enable privacy mode' });
    }
});

// ============================================================
// ROUTE 5 — PUT /api/staff/:id/privacy/disable
// Calls: disablePrivacy() — METHOD 3 in Staff.js
// ============================================================
router.put('/:id/privacy/disable', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const person = mockStaff.find(p => p.id === req.params.id);
            if (!person) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            person.privacyMode = false;
            person.currentStatus = "UnknownStatus";
            person.location = "Unknown";
            return res.status(200).json({
                success: true,
                message: `${person.name} is now visible again`
            });
        }

        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 3 from Staff.js — disablePrivacy()
        const result = person.disablePrivacy();

        await person.save();
        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to disable privacy mode' });
    }
});

// ============================================================
// ROUTE 6 — POST /api/staff/reset
// Calls: systemReset() on ALL staff — METHOD 4 in Staff.js
// ============================================================
router.post('/reset', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            mockStaff.forEach(person => {
                person.currentStatus = "UnknownStatus";
                person.location = "Unknown";
                person.privacyMode = false;
                person.confidenceScore = 0;
            });
            return res.status(200).json({
                success: true,
                message: `All ${mockStaff.length} staff statuses have been reset for the day`
            });
        }

        const allStaff = await AcademicStaff.find();
        for (const person of allStaff) {
            person.systemReset();
            await person.save();
        }

        res.status(200).json({
            success: true,
            message: `All ${allStaff.length} staff statuses have been reset for the day`
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to reset all staff statuses' });
    }
});

module.exports = router;