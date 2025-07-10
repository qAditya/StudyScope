const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  specialization: String,
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
  semesters: [
    {
      semester: Number,
      courses: [
        {
          name: String,
          ct: Number,
          mid: Number,
          final: Number
        }
      ]
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
