import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const accountEmojis = {
  rob: '👨',
  lady: '👩',
  us: '💑'
};

function Transaction({ onTransactionComplete, accountType }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    try {
      await axios.post(`${API_URL}/deposit/${accountType}`, { 
        amount: Number(amount),
        description 
      });
      onTransactionComplete();
      resetForm();
    } catch (err) {
      setError('Failed to deposit');
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post(`${API_URL}/withdraw/${accountType}`, { 
        amount: Number(amount),
        description 
      });
      onTransactionComplete();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to withdraw');
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setError('');
  };

  const getAccountTitle = () => {
    switch(accountType) {
      case 'rob':
        return "Rob's Savings";
      case 'lady':
        return "Lady's Savings";
      case 'us':
        return 'Our Savings';
      default:
        return 'Savings';
    }
  };

  return (
    <div className="cute-card p-6">
      <h2 className="text-2xl font-bold mb-4 text-pink-600 text-center">
        {accountEmojis[accountType]} {getAccountTitle()}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="cute-input pl-8 pr-4 py-3 text-lg w-full"
          />
        </div>
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this for? 💝"
          className="cute-input px-4 py-3 w-full"
        />
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleDeposit}
            className="cute-button deposit-button text-white px-6 py-3 text-lg flex-1 hover:opacity-90"
          >
            Add Savings 💖
          </button>
          <button
            onClick={handleWithdraw}
            className="cute-button withdraw-button text-white px-6 py-3 text-lg flex-1 hover:opacity-90"
          >
            Use Savings 💝
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transaction;
