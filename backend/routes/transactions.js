const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

// Default monthly goals for each account type
const DEFAULT_MONTHLY_GOALS = {
  rob: 5000,    // ₱5,000 for Rob
  lady: 5000,   // ₱5,000 for Lady
  us: 10000     // ₱10,000 for joint savings
};

// Initialize accounts if they don't exist
async function initializeAccounts() {
  const accountTypes = ['rob', 'lady', 'us'];
  for (const type of accountTypes) {
    const exists = await Account.findOne({ accountType: type });
    if (!exists) {
      await Account.create({ 
        accountType: type, 
        balance: 0,
        monthlyGoal: DEFAULT_MONTHLY_GOALS[type],
        goalProgress: 0,
        lastMonthSavings: 0,
        transactions: []
      });
    }
  }
}

// Initialize accounts when the server starts
initializeAccounts().catch(console.error);

// Get balance and stats for specific account
router.get('/balance/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    let account = await Account.findOne({ accountType });
    if (!account) {
      account = await Account.create({ 
        accountType, 
        balance: 0,
        monthlyGoal: DEFAULT_MONTHLY_GOALS[accountType],
        goalProgress: 0,
        lastMonthSavings: 0,
        transactions: []
      });
    }

    // Update goal progress and last month savings
    account.updateGoalProgress();
    account.updateLastMonthSavings();
    await account.save();

    res.json({
      balance: account.balance,
      monthlyGoal: account.monthlyGoal,
      goalProgress: account.goalProgress,
      lastMonthSavings: account.lastMonthSavings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions for specific account
router.get('/transactions/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    const account = await Account.findOne({ accountType });
    if (!account) {
      return res.json({ transactions: [] });
    }

    // Sort transactions by date in descending order
    const sortedTransactions = account.transactions.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.json({ transactions: sortedTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a deposit for specific account
router.post('/deposit/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    const { amount, description = '' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let account = await Account.findOne({ accountType });
    if (!account) {
      account = await Account.create({ 
        accountType, 
        balance: 0,
        monthlyGoal: DEFAULT_MONTHLY_GOALS[accountType],
        goalProgress: 0,
        lastMonthSavings: 0,
        transactions: []
      });
    }
    
    account.balance += amount;
    account.transactions.push({
      type: 'deposit',
      amount,
      description,
      accountType,
      date: new Date()
    });

    // Update goal progress
    account.updateGoalProgress();
    await account.save();

    res.json({ 
      balance: account.balance,
      goalProgress: account.goalProgress,
      transaction: account.transactions[account.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a withdrawal for specific account
router.post('/withdraw/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    const { amount, description = '' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let account = await Account.findOne({ accountType });
    if (!account) {
      account = await Account.create({ 
        accountType, 
        balance: 0,
        monthlyGoal: DEFAULT_MONTHLY_GOALS[accountType],
        goalProgress: 0,
        lastMonthSavings: 0,
        transactions: []
      });
    }
    
    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    account.balance -= amount;
    account.transactions.push({
      type: 'withdraw',
      amount,
      description,
      accountType,
      date: new Date()
    });
    
    await account.save();
    res.json({ 
      balance: account.balance,
      transaction: account.transactions[account.transactions.length - 1]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update monthly goal for specific account
router.post('/goal/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    const { monthlyGoal } = req.body;

    if (!monthlyGoal || monthlyGoal < 0) {
      return res.status(400).json({ error: 'Invalid goal amount' });
    }

    let account = await Account.findOne({ accountType });
    if (!account) {
      account = await Account.create({ 
        accountType, 
        balance: 0,
        monthlyGoal,
        goalProgress: 0,
        lastMonthSavings: 0,
        transactions: []
      });
    } else {
      account.monthlyGoal = monthlyGoal;
      account.updateGoalProgress();
      await account.save();
    }

    res.json({ 
      monthlyGoal: account.monthlyGoal,
      goalProgress: account.goalProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all accounts summary
router.get('/summary', async (req, res) => {
  try {
    const accounts = await Account.find({});
    const summary = accounts.map(account => {
      account.updateGoalProgress();
      account.updateLastMonthSavings();
      return {
        accountType: account.accountType,
        balance: account.balance,
        monthlyGoal: account.monthlyGoal,
        goalProgress: account.goalProgress,
        lastMonthSavings: account.lastMonthSavings
      };
    });
    res.json({ accounts: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly statistics for specific account
router.get('/stats/:accountType', async (req, res) => {
  try {
    const { accountType } = req.params;
    const account = await Account.findOne({ accountType });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthTransactions = account.transactions.filter(t => 
      t.date >= firstDayOfMonth
    );

    const monthlyDeposits = monthTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyWithdrawals = monthTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      monthlyDeposits,
      monthlyWithdrawals,
      netSavings: monthlyDeposits - monthlyWithdrawals,
      goalProgress: account.updateGoalProgress(),
      lastMonthSavings: account.updateLastMonthSavings()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
