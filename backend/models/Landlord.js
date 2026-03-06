const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Landlord', landlordSchema);
