const mongoose = require('mongoose');

const AcademicStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  currentStatus: { 
    type: String, 
    enum: ['UnknownStatus', 'InOffice', 'InLecture', 'InTransit', 'PrivacyMode_DoNotDisturb'], 
    default: 'UnknownStatus' 
  }, // Matches your State Machine Diagram states [cite: 286-299]
  location: { type: String, default: "Unknown" }, 
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademicStaff', AcademicStaffSchema);