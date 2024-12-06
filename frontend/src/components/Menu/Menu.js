import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMinus, FaShoppingCart, FaWallet, FaTimes } from 'react-icons/fa';
import './Menu.css';
import { API_URL } from '../../services/api';

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWalletBalance(response.data.balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMenu();
    fetchWalletBalance();
  }, [navigate]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const items = response.data;
      
      // Validate menu items have required fields
      const validItems = items.map(item => {
        if (!item.mealType) console.warn(`Menu item ${item._id} missing mealType`);
        if (!item.foodType) console.warn(`Menu item ${item._id} missing foodType`);
        if (!item.portionSize) console.warn(`Menu item ${item._id} missing portionSize`);
        return item;
      });

      setMenuItems(validItems);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = useCallback(() => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i._id === itemId);
      return item ? total + (item.price * quantity) : total;
    }, 0);
  }, [cart, menuItems]);

  const handleQuantityChange = (itemId, change) => {
    setCart(prevCart => {
      const currentQty = prevCart[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [itemId]: removed, ...rest } = prevCart;
        return rest;
      }
      
      return {
        ...prevCart,
        [itemId]: newQty
      };
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('cart');
  };

  const handlePlaceOrder = async () => {
    try {
      const totalAmount = calculateTotal();
      
      if (totalAmount > walletBalance) {
        setInsufficientFunds(true);
        setTimeout(() => setInsufficientFunds(false), 3000);
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const orderItems = Object.keys(cart).map(itemId => ({
        menuItemId: itemId,
        quantity: cart[itemId]
      }));

      const selectedItem = menuItems.find(item => item._id === orderItems[0].menuItemId);
      
      // Place the order
      await axios.post(`${API_URL}/orders`, {
        items: orderItems,
        totalAmount,
        mealType: selectedItem.mealType,
        foodType: selectedItem.foodType,
        portionSize: selectedItem.portionSize
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Deduct amount from wallet
      await axios.post(`${API_URL}/wallet/deduct`, {
        amount: totalAmount,
        description: 'Order payment'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update wallet balance in state
      setWalletBalance(prevBalance => prevBalance - totalAmount);

      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        navigate('/member/dashboard');
      }, 2000);

    } catch (error) {
      setError('Failed to place order. Please try again.');
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (itemId) => cart[itemId] || 0;

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  if (loading && !menuItems.length) {
    return <div className="menu-container"><p>Loading menu...</p></div>;
  }

  if (error) {
    return (
      <div className="menu-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMenu}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {insufficientFunds && (
        <div className="error-popup">
          Insufficient funds! Please add money to your wallet.
        </div>
      )}
      <div className="menu-header">
        <h1>Today's Menu</h1>
        <div className="header-actions">
          <button 
            className="cart-btn"
            onClick={() => setCartVisible(!cartVisible)}
          >
            <FaShoppingCart />
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </button>
          <button className="arrow-button" onClick={() => navigate('/member/dashboard')}>
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="success-message">
          Order placed successfully! Redirecting to dashboard...
        </div>
      )}

      <div className="menu-content">
        <div className="menu-list">
          {menuItems.map(item => (
            <div key={item._id} className="menu-card">
              <div className="menu-card-header">
                <h3>{item.dishName}</h3>
                <span className={`food-type-badge ${item.foodType.toLowerCase()}`}>
                  {item.foodType}
                </span>
              </div>
              <div className="menu-card-content">
                <div className="menu-details">
                  <div className="detail-item">
                    <span className="detail-label">Meal Type:</span>
                    <span className={`detail-value meal-type ${item.mealType.toLowerCase()}`}>
                      {item.mealType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Portion:</span>
                    <span className={`detail-value portion-size ${item.portionSize.toLowerCase()}`}>
                      {item.portionSize}
                    </span>
                  </div>
                </div>
                <div className="price-section">
                  <span className="price-label">Price:</span>
                  <span className="price-value">₹{item.price}</span>
                </div>
              </div>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(item._id, -1)}
                  disabled={!cart[item._id]}
                  className={`quantity-btn ${!cart[item._id] ? 'disabled' : ''}`}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span className="quantity-display">{getItemQuantity(item._id)}</span>
                <button 
                  onClick={() => handleQuantityChange(item._id, 1)}
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>
              {cart[item._id] > 0 && (
                <div className="item-total">
                  Total: ₹{(item.price * cart[item._id]).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`order-summary ${cartVisible ? 'visible' : ''}`}>
          <div className="order-summary-header">
            <button className="close-btn" onClick={() => setCartVisible(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="delivery-info">
            <div className="timer-icon">🧾</div>
            <div className="delivery-details">
              <h2>Order Summary</h2>
              <p>Got</p>
            </div>
          </div>

          <div className="wallet-balance">
            <FaWallet className="wallet-icon" />
            <span>Balance: ₹{walletBalance.toFixed(2)}</span>
          </div>

          {Object.keys(cart).length === 0 ? (
            <p className="empty-cart-message">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = menuItems.find(i => i._id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-details">
                          <span className="item-name">{item.dishName}</span>
                          <span className="item-weight">{item.portionSize}</span>
                          <span className="item-weight">{item.mealType}</span>
                          <span className="item-weight">{item.foodType}</span>  
                          <span className="item-price">₹{item.price}</span>
                        </div>
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={quantity === 0}
                          >
                            -
                          </button>
                          <span className="quantity">{quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="voucher-info">
                <div className="voucher-icon">🎁</div>
                <div className="voucher-text">
                  Cancellation Policy
                  <div className="voucher-subtext">Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable</div>
                </div>
              </div>

              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="cart-item-count">
                    <span>{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button 
                  className="next-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading || Object.keys(cart).length === 0}
                >
                  {loading ? 'Processing...' : 'Next →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
