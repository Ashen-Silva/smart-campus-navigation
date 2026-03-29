const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
  fromNode: { type: String, required: true }, 
  toNode: { type: String, required: true },   
  distance: { type: Number, required: true }, 
  isAccessible: { type: Boolean, default: false } // Filters out stairs for accessible routes [cite: 322-323, 360]
});
const MapGraphSchema = new mongoose.Schema({
  nodes: [String], 
  edges: [EdgeSchema]
});

module.exports = mongoose.model('MapGraph', MapGraphSchema);
