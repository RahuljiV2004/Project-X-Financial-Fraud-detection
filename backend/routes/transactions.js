const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get transaction history for a user
router.get('/history/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find all transactions where the user is either sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { senderEmail: email },
        { receiverEmail: email }
      ]
    }).sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
});

// Create a new transaction
router.post('/new', async (req, res) => {
  try {
    const {
      senderEmail,
      receiverEmail,
      amount,
      description,
      transactionType,
      paymentMethod,
      timestamp
    } = req.body;

    // Validate required fields
    if (!senderEmail || !receiverEmail || !amount || !transactionType || !paymentMethod) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Check if sender exists
    const sender = await User.findOne({ email: senderEmail });
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check if receiver exists
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create new transaction
    const transaction = new Transaction({
      senderEmail,
      receiverEmail,
      amount,
      description,
      transactionType,
      paymentMethod,
      timestamp: timestamp || new Date().toISOString()
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      message: 'Error creating transaction', 
      error: error.message 
    });
  }
});

router.get('/summary', async (req, res) => {
  try {
    console.log("hiii");
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 