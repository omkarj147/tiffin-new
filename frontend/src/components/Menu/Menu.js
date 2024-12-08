import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaShoppingCart, FaWallet, FaTimes } from 'react-icons/fa';
import './Menu.css';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await api.get('/wallet/balance');
        setWalletBalance(response.data.balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        navigate('/login');
        return;
      }

      
      const response = await api.get('/menu');
      
      
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure response.data is an array
      const items = Array.isArray(response.data) ? response.data : [];
      
      if (items.length === 0) {
        console.warn('No menu items received from server');
        setError('No menu items available');
        setMenuItems([]);
        return;
      }
      
      // Validate menu items have required fields
      const validItems = items.filter(item => {
        if (!item || typeof item !== 'object') {
          console.warn('Invalid menu item received:', item);
          return false;
        }
        
        const hasRequiredFields = 
          item._id && 
          item.dishName && 
          item.price && 
          item.mealType && 
          item.foodType && 
          item.portionSize;
          
        if (!hasRequiredFields) {
          console.warn(`Menu item ${item._id || 'unknown'} missing required fields:`, item);
          return false;
        }
        
        return true;
      });
      if (validItems.length === 0) {
        setError('No valid menu items available');
      } else {
        setMenuItems(validItems);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
   
    fetchMenu();
    fetchWalletBalance();

    // Cleanup function
    return () => {
      setMenuItems([]);
      setLoading(false);
      setError(null);
    };
  }, [navigate, fetchMenu, fetchWalletBalance]);

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
      const orderItems = Object.keys(cart).map(itemId => ({
        menuItemId: itemId,
        quantity: cart[itemId]
      }));

      const selectedItem = menuItems.find(item => item._id === orderItems[0].menuItemId);
      
      // Place the order
      await api.post('/orders', {
        items: orderItems,
        totalAmount,
        mealType: selectedItem.mealType,
        foodType: selectedItem.foodType,
        portionSize: selectedItem.portionSize
      });

      // Deduct amount from wallet
      await api.post('/wallet/deduct', {
        amount: totalAmount,
        description: 'Order payment'
      });

      // Update wallet balance in state
      setWalletBalance(prevBalance => prevBalance - totalAmount);

      setOrderSuccess(true);
      toast.success('Order placed successfully! Redirecting to orders page...');
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        navigate('/orders');
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
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
              <p></p>
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
