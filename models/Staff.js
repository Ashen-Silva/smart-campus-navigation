// models/Staff.js
const mongoose = require('mongoose');


const AcademicStaffSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  department:    { type: String, required: true },
  currentStatus: { 
    type: String, 
    enum: ['UnknownStatus', 'InOffice', 'InLecture', 'InTransit', 'PrivacyMode_DoNotDisturb'], 
    default: 'UnknownStatus' 
  },
  location:      { type: String, default: "Unknown" }, 
  privacyMode:   { type: Boolean, default: false },
  confidenceScore: { type: Number, default: 0 },
  lastUpdated:   { type: Date, default: Date.now }
});

// METHOD 1 - updateLocation()
AcademicStaffSchema.methods.updateLocation = function(location, status) {
  if (this.privacyMode) {
    return { success: false, message: `${this.name} has privacy mode enabled` };
  }
  this.location = location;
  this.currentStatus = status;
  this.confidenceScore += 1;
  this.lastUpdated = Date.now();
  return { success: true, message: `${this.name}'s location updated successfully` };
};

// METHOD 2 - enablePrivacy()
AcademicStaffSchema.methods.enablePrivacy = function() {
  this.privacyMode = true;
  this.currentStatus = "PrivacyMode_DoNotDisturb";
  this.location = "Unknown";
  this.confidenceScore = 0;
  this.lastUpdated = Date.now();
  return { success: true, message: `${this.name} is now in Privacy Mode - Do Not Disturb` };
};

// METHOD 3 - disablePrivacy()
AcademicStaffSchema.methods.disablePrivacy = function() {
  this.privacyMode = false;
  this.currentStatus = "UnknownStatus";
  this.location = "Unknown";
  this.lastUpdated = Date.now();
  return { success: true, message: `${this.name} is now visible again` };
};

// METHOD 4 - systemReset()
AcademicStaffSchema.methods.systemReset = function() {
  this.currentStatus = "UnknownStatus";
  this.location = "Unknown";
  this.privacyMode = false;
  this.confidenceScore = 0;
  this.lastUpdated = Date.now();
  return { success: true, message: `${this.name}'s status has been reset for the day` };
};

// METHOD 5 - getPublicProfile()
AcademicStaffSchema.methods.getPublicProfile = function() {
  if (this.privacyMode) {
    return {
      _id: this._id,
      name: this.name,
      department: this.department,
      currentStatus: "PrivacyMode_DoNotDisturb",
      location: "Hidden",
    };
  }
  return {
    _id: this._id,
    name: this.name,
    department: this.department,
    currentStatus: this.currentStatus,
    location: this.location,
    confidenceScore: this.confidenceScore,
  };
};


// ── Export (DO NOT CHANGE) ────────────────────────────────────────────────────
module.exports = mongoose.model('AcademicStaff', AcademicStaffSchema);