
// routes/staffRoutes.js
// Each route calls the exact methods defined in models/Staff.js

const express = require('express');
const router = express.Router();
const AcademicStaff = require('../models/Staff');

// ============================================================
// ROUTE 1 — GET /api/staff
// Calls: getPublicProfile() on every staff member
// Returns: all staff — hides location if privacyMode is true
// ============================================================
router.get('/', async (req, res) => {
    try {
        const allStaff = await AcademicStaff.find();

        // getPublicProfile() returns:
        // - If privacyMode ON  → { name, department, currentStatus: "PrivacyMode_DoNotDisturb", location: "Hidden" }
        // - If privacyMode OFF → { name, department, currentStatus, location, confidenceScore }
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
//
// What updateLocation() does internally:
//   - If privacyMode is true  → returns { success: false } → we send 403
//   - If privacyMode is false → updates location, status, confidenceScore +1
// ============================================================
router.put('/:id/location', async (req, res) => {
    try {
        const { location, currentStatus } = req.body;

        // Validate the status value matches Staff.js enum exactly
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

        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 1 from Staff.js — updateLocation(location, status)
        const result = person.updateLocation(location, currentStatus);

        if (!result.success) {
            // updateLocation() returned false because privacyMode is ON
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
//
// What enablePrivacy() does internally:
//   - Sets privacyMode = true
//   - Sets currentStatus = "PrivacyMode_DoNotDisturb"
//   - Sets location = "Unknown"
//   - Sets confidenceScore = 0
// ============================================================
router.put('/:id/privacy/enable', async (req, res) => {
    try {
        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 2 from Staff.js — enablePrivacy()
        const result = person.enablePrivacy();

        await person.save();
        res.status(200).json({
            success: true,
            message: result.message  // "Dr. X is now in Privacy Mode - Do Not Disturb"
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to enable privacy mode' });
    }
});

// ============================================================
// ROUTE 5 — PUT /api/staff/:id/privacy/disable
// Calls: disablePrivacy() — METHOD 3 in Staff.js
//
// What disablePrivacy() does internally:
//   - Sets privacyMode = false
//   - Sets currentStatus = "UnknownStatus"
//   - Sets location = "Unknown"
// ============================================================
router.put('/:id/privacy/disable', async (req, res) => {
    try {
        const person = await AcademicStaff.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Call METHOD 3 from Staff.js — disablePrivacy()
        const result = person.disablePrivacy();

        await person.save();
        res.status(200).json({
            success: true,
            message: result.message  // "Dr. X is now visible again"
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to disable privacy mode' });
    }
});

// ============================================================
// ROUTE 6 — POST /api/staff/reset
// Calls: systemReset() on ALL staff — METHOD 4 in Staff.js
// Run this at end of day (18:00) to clear all staff statuses
//
// What systemReset() does internally:
//   - Sets currentStatus = "UnknownStatus"
//   - Sets location = "Unknown"
//   - Sets privacyMode = false
//   - Sets confidenceScore = 0
// ============================================================
router.post('/reset', async (req, res) => {
    try {
        const allStaff = await AcademicStaff.find();

        // Call METHOD 4 from Staff.js — systemReset() on every person
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