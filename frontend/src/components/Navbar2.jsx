import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Navbar2({ activeAccount, onAccountChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accountSummary, setAccountSummary] = useState({
    rob: { balance: 0, goalProgress: 0 },
    lady: { balance: 0, goalProgress: 0 },
    us: { balance: 0, goalProgress: 0 }
  });

  useEffect(() => {
    fetchAccountSummary();
  }, [activeAccount]);

  const fetchAccountSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/summary`);
      const summary = response.data.accounts.reduce((acc, account) => {
        acc[account.accountType] = {
          balance: account.balance,
          goalProgress: account.goalProgress
        };
        return acc;
      }, {});
      setAccountSummary(summary);
    } catch (error) {
      console.error('Failed to fetch account summary');
    }
  };

  const accounts = [
    {
      id: 'rob',
      name: 'Rob',
      emoji: '👨',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'lady',
      name: 'Lady',
      emoji: '👩',
      color: 'from-pink-400 to-pink-600',
      hoverColor: 'hover:from-pink-500 hover:to-pink-700'
    },
    {
      id: 'us',
      name: 'Us',
      emoji: '💑',
      color: 'from-purple-400 to-purple-600',
      hoverColor: 'hover:from-purple-500 hover:to-purple-700'
    }
  ];

  const formatPeso = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="mb-8">
      {/* Desktop Navigation */}
      <div className="hidden sm:grid grid-cols-3 gap-4">
        {accounts.map(account => (
          <button
            key={account.id}
            onClick={() => onAccountChange(account.id)}
            className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform ${
              activeAccount === account.id ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            {/* Background with gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                activeAccount === account.id 
                  ? account.color
                  : 'from-gray-100 to-gray-200 ' + account.hoverColor
              } opacity-90 transition-all duration-300`}
            />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{account.emoji}</span>
                <span className={`text-sm font-medium ${
                  activeAccount === account.id ? 'text-white' : 'text-gray-600'
                }`}>
                  {account.name}'s Account
                </span>
              </div>
              
              <div className={`text-lg font-bold ${
                activeAccount === account.id ? 'text-white' : 'text-gray-700'
              }`}>
                {formatPeso(accountSummary[account.id]?.balance || 0)}
              </div>
              
              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={
                    activeAccount === account.id ? 'text-white' : 'text-gray-600'
                  }>Monthly Goal Progress</span>
                  <span className={
                    activeAccount === account.id ? 'text-white' : 'text-gray-600'
                  }>{Math.round(accountSummary[account.id]?.goalProgress || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-white transition-all duration-300"
                    style={{ width: `${accountSummary[account.id]?.goalProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <div className="bg-white rounded-lg shadow-md">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {accounts.find(a => a.id === activeAccount)?.emoji}
              </span>
              <span className="font-medium">
                {accounts.find(a => a.id === activeAccount)?.name}'s Account
              </span>
            </div>
            <svg
              className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Mobile Dropdown */}
          {isOpen && (
            <div className="border-t border-gray-100">
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => {
                    onAccountChange(account.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 flex items-center justify-between ${
                    activeAccount === account.id
                      ? 'bg-gradient-to-r ' + account.color + ' text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{account.emoji}</span>
                    <span className="font-medium">{account.name}'s Account</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatPeso(accountSummary[account.id]?.balance || 0)}
                    </div>
                    <div className="text-sm">
                      Goal: {Math.round(accountSummary[account.id]?.goalProgress || 0)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar2;
