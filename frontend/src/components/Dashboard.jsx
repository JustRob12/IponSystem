import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const accountEmojis = {
  rob: '👨',
  lady: '👩',
  us: '💑'
};

const accountTitles = {
  rob: "Rob's",
  lady: "Lady's",
  us: 'Our'
};

function Dashboard({ accountType }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    averageTransaction: 0,
    monthlySavings: 0
  });

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [accountType]);

  useEffect(() => {
    calculateStats();
  }, [transactions]);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/balance/${accountType}`);
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/${accountType}`);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  };

  const calculateStats = () => {
    const deposits = transactions.filter(t => t.type === 'deposit');
    const withdrawals = transactions.filter(t => t.type === 'withdraw');

    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);

    const averageTransaction = transactions.length > 0
      ? (totalDeposits + totalWithdrawals) / transactions.length
      : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDeposits = deposits
      .filter(t => new Date(t.date) > thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const recentWithdrawals = withdrawals
      .filter(t => new Date(t.date) > thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySavings = recentDeposits - recentWithdrawals;

    setStats({
      totalDeposits,
      totalWithdrawals,
      averageTransaction,
      monthlySavings
    });
  };

  const formatPeso = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="balance-display p-6 rounded-lg stat-card col-span-full">
          <h3 className="text-lg font-semibold">
            {accountEmojis[accountType]} {accountTitles[accountType]} Balance
          </h3>
          <p className="text-3xl font-bold">{formatPeso(balance)}</p>
        </div>
        
        <div className="bg-pink-50 p-6 rounded-lg stat-card">
          <h3 className="text-lg font-semibold text-pink-700">Total Added 💖</h3>
          <p className="text-2xl font-bold text-pink-800">{formatPeso(stats.totalDeposits)}</p>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg stat-card">
          <h3 className="text-lg font-semibold text-red-700">Total Used 💝</h3>
          <p className="text-2xl font-bold text-red-800">{formatPeso(stats.totalWithdrawals)}</p>
        </div>
      </div>

      <div className="cute-card p-6">
        <h2 className="text-xl font-semibold mb-4 text-pink-600">
          {accountTitles[accountType]} Transaction History 💕
        </h2>
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg transaction-card ${
                transaction.type === 'deposit' 
                  ? 'bg-pink-50 border-2 border-pink-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {transaction.type === 'deposit' ? '💖 Added' : '💝 Used'}: {formatPeso(transaction.amount)}
                  </p>
                  {transaction.description && (
                    <p className="text-sm text-gray-700 mt-1">
                      {transaction.description}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">
              Start your savings journey! {accountEmojis[accountType]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
