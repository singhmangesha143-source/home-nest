const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
  }],
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landlord',
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'shared', 'studio', 'apartment'],
    default: 'single',
  },
  furnishing: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    default: 'semi-furnished',
  },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

roomSchema.index({ 'location.city': 1, price: 1 });
roomSchema.index({ amenities: 1 });

module.exports = mongoose.model('Room', roomSchema);
