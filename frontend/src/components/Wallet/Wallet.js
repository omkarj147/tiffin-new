import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Wallet.css';
import { API_URL } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBalance(response.data.balance);

      // Fetch transaction history
      const transactionsResponse = await axios.get(`${API_URL}/wallet/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError('Failed to fetch wallet data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/wallet/add-funds`,  
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setAmount('');
      setShowAddFunds(false);
      fetchWalletData(); // Refresh wallet data
      toast.success(`Successfully added ₹${amount} to your wallet!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add funds');
      toast.error(err.response?.data?.message || 'Failed to add funds');
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (loading) return (
    <div className="orders-loading">
      <div className="loader"></div>
      <p>Loading your Balance...</p>
    </div>
  );
  return (
    <div className="wallet-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="header-container">
        <button className="arrow-button" onClick={() => navigate('/member/dashboard')}></button>
        <div className="title-card">
          <h2>My Wallet</h2>
          <span className="wallet-balance">Balance: ₹{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="wallet-balance-card">
        <button 
          className="add-funds-button"
          onClick={() => setShowAddFunds(true)}
        >
          Add Funds
        </button>
      </div>

      {showAddFunds && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Funds to Wallet</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddFunds}>
              <div className="form-group">
                <label></label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddFunds(false)}>Cancel</button>
                <button type="submit">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="transactions-section">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction._id} className="transaction-card">
                <div className="transaction-type">
                  {transaction.type === 'credit' ? '+ ' : '- '}
                  ₹{transaction.amount.toFixed(2)}
                </div>
                <div className="transaction-details">
                  <span className="transaction-description">{transaction.description}</span>
                  <span className="transaction-date">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
