const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdraw'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  accountType: {
    type: String,
    enum: ['rob', 'lady', 'us'],
    required: true
  }
});

const accountSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ['rob', 'lady', 'us'],
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [transactionSchema],
  monthlyGoal: {
    type: Number,
    default: 0
  },
  lastMonthSavings: {
    type: Number,
    default: 0
  },
  goalProgress: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
accountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate monthly goal progress
accountSchema.methods.updateGoalProgress = function() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthTransactions = this.transactions.filter(t => 
    t.date >= firstDayOfMonth && t.type === 'deposit'
  );
  
  const monthlyTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  this.goalProgress = this.monthlyGoal > 0 
    ? (monthlyTotal / this.monthlyGoal) * 100 
    : 0;
  
  return this.goalProgress;
};

// Calculate last month's savings
accountSchema.methods.updateLastMonthSavings = function() {
  const now = new Date();
  const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const lastMonthTransactions = this.transactions.filter(t => 
    t.date >= firstDayOfLastMonth && t.date < firstDayOfThisMonth
  );
  
  const deposits = lastMonthTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const withdrawals = lastMonthTransactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);
  
  this.lastMonthSavings = deposits - withdrawals;
  return this.lastMonthSavings;
};

module.exports = mongoose.model('Account', accountSchema);
