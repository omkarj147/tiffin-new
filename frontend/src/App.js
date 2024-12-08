import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MemberDashboard from './pages/MemberDashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import MenuManagement from './pages/MenuManagement';
import AdminDashboard from './pages/AdminDashboard';
import PWAManager from './pwa/pwaManager';
import PrivateRoute from './components/PrivateRoute';

const Layout = () => {
  useEffect(() => {
    // Initialize PWA and store reference for cleanup
    const pwa = new PWAManager();
    
    // Return cleanup function
    return () => {
      if (pwa && typeof pwa.cleanup === 'function') {
        pwa.cleanup();
      }
    };
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route 
            path="member/dashboard" 
            element={
              <PrivateRoute>
                <MemberDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin/menu" element={<MenuManagement />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
