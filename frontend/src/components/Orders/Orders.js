import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import { API_URL } from '../../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated.');

      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Ensure orders is always an array
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
      console.error('Error fetching orders:', err);
      setOrders([]); // Initialize to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated.');

      // Find the order to get its amount
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Cancel the order
      await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Refund the amount to wallet
      await axios.post(`${API_URL}/wallet/add-funds`, {
        amount: order.totalAmount,
        description: `Refund for order #${orderId.slice(-8)}`
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Show success message
      setSuccessMessage('Order cancelled and amount refunded to wallet');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh orders after cancellation
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order.');
      console.error('Error canceling order:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="orders-loading">
      <div className="loader"></div>
      <p>Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="orders-error">
      <div className="error-icon">❌</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="orders-container">
      {successMessage && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}
      <div className="header-container">
        <div className="arrow-container">
          <button className="arrow-button" onClick={() => navigate('/member/dashboard')}></button>
        </div>
        <div className="title-card">
          <h2>My Orders</h2>
          <span className="orders-count">
            {Array.isArray(orders) ? `${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'}` : '0 Orders'}
          </span>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="orders-section">
        <h2 className="section-title">Active Orders</h2>
        <div className="orders-list">
          {Array.isArray(orders) ? (
            orders
              .filter(order => order && order.status && !['cancelled', 'delivered'].includes(order.status.toLowerCase()))
              .map(order => (
                <div key={order._id || Math.random()} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <div className="order-number">
                        <span className="label">Order #</span>
                        <span className="value">{(order._id || '').slice(-8)}</span>
                      </div>
                      <div className={`order-status status-${(order.status || '').toLowerCase()}`}>
                        {order.status || 'Unknown'}
                      </div>
                    </div>
                    <div className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Date not available'}
                    </div>
                  </div>

                  <div className="order-items-list">
                    {Array.isArray(order.items) ? order.items.map(item => (
                      <div key={item.menuItemId?._id || Math.random()} className="order-item">
                        <div className="item-details">
                          <span className="item-name">{item.menuItemId?.dishName || 'Unknown Item'}</span>
                          <div className="item-meta">
                            <span className="item-quantity">Qty: {item.quantity || 0}</span>
                            <span className="item-price">
                              ₹{((item.menuItemId?.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="no-items">No items available</div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <button 
                      className="cancel-order-btn" 
                      onClick={() => order._id && cancelOrder(order._id)}
                      disabled={!order._id}
                    >
                      Cancel Order
                      <span className="btn-icon">×</span>
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="no-orders">
              <p>No active orders at the moment</p>
            </div>
          )}
          {Array.isArray(orders) && 
            orders.filter(order => order && order.status && !['cancelled', 'delivered'].includes(order.status.toLowerCase())).length === 0 && (
            <div className="no-orders">
              <p>No active orders at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Orders Section */}
      <div className="orders-section">
        <h2 className="section-title">Past Orders</h2>
        <div className="orders-list">
          {Array.isArray(orders) ? (
            orders
              .filter(order => order && order.status && ['cancelled', 'delivered'].includes(order.status.toLowerCase()))
              .map(order => (
                <div key={order._id || Math.random()} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <div className="order-number">
                        <span className="label">Order #</span>
                        <span className="value">{(order._id || '').slice(-8)}</span>
                      </div>
                      <div className={`order-status status-${(order.status || '').toLowerCase()}`}>
                        {order.status || 'Unknown'}
                      </div>
                    </div>
                    <div className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Date not available'}
                    </div>
                  </div>

                  <div className="order-items-list">
                    {Array.isArray(order.items) ? order.items.map(item => (
                      <div key={item.menuItemId?._id || Math.random()} className="order-item">
                        <div className="item-details">
                          <span className="item-name">{item.menuItemId?.dishName || 'Unknown Item'}</span>
                          <div className="item-meta">
                            <span className="item-quantity">Qty: {item.quantity || 0}</span>
                            <span className="item-price">
                              ₹{((item.menuItemId?.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="no-items">No items available</div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="no-orders">
              <p>No past orders</p>
            </div>
          )}
          {Array.isArray(orders) && 
            orders.filter(order => order && order.status && ['cancelled', 'delivered'].includes(order.status.toLowerCase())).length === 0 && (
            <div className="no-orders">
              <p>No past orders</p>
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <div className="empty-icon">🛍️</div>
          <h3>No Orders Yet</h3>
          <p>When you place an order, it will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
