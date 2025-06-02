const mongoose = require('mongoose');

const rollSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true
  },
  hardness: {
    type: String,
    required: true
  },
  machining: {
    type: String
  },
  rollDescription: {
    type: String
  },
  dimensions: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'casting', 'annealing', 'machining', 'baring/wobler', 'dispached'],
    default: 'Pending'
  },
  grade: {
    type: String,
    enum: ['ALLOYS', 'ADAMITE', 'S.G.I', 'W.S.G', 'ACCICULAR', 'CHILL']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  broker: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  orderDate: {
    type: Date,
    required: true
  },
  expectedDelivery: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  rolls: [rollSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 