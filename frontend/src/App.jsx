import { useState } from 'react';
import Transaction from './components/Transaction';
import Dashboard from './components/Dashboard';
import Navbar2 from './components/Navbar2';
import './App.css';

function App() {
  const [activeAccount, setActiveAccount] = useState('us');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 app-title">
          Ipon System <span className="love-icon">♥</span>
        </h1>
        
        <Navbar2 
          activeAccount={activeAccount} 
          onAccountChange={setActiveAccount} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Transaction 
              onTransactionComplete={handleTransactionComplete}
              accountType={activeAccount}
            />
          </div>
          
          <div className="lg:col-span-2">
            <Dashboard 
              key={refreshKey} 
              accountType={activeAccount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;