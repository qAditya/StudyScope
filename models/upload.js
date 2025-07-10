const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  fileName: String,
  originalName: String,
  uploadDate: { type: Date, default: Date.now },
  college: String,
  recordCount: Number,
  specializations: [String],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Upload', uploadSchema);
