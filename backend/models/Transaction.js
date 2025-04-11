const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverEmail: {
    type: String,
    required: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    default: ''
  },
  transactionType: {
    type: String,
    required: true,
    enum: {
      values: ['transfer', 'deposit', 'withdrawal'],
      message: '{VALUE} is not a valid transaction type'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: {
      values: ['upi', 'card', 'netbanking'],
      message: '{VALUE} is not a valid payment method'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add indexes for better query performance
transactionSchema.index({ senderEmail: 1, timestamp: -1 });
transactionSchema.index({ receiverEmail: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema); 