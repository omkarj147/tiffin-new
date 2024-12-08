import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import Menu from './components/Menu/Menu';
import Orders from './components/Orders/Orders';
import Wallet from './components/Wallet/Wallet';
import Profile from './components/Profile/Profile';
import MenuManagement from './components/Menu/MenuManagement';
import AdminDashboard from './components/Dashboard/AdminDashboard';
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
          <Route 
            path="menu" 
            element={
              <PrivateRoute>
                <Menu />
              </PrivateRoute>
            } 
          />
          <Route 
            path="orders" 
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            } 
          />
          <Route 
            path="wallet" 
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="admin/menu" 
            element={
              <PrivateRoute>
                <MenuManagement />
              </PrivateRoute>
            } 
          />
          <Route 
            path="admin/dashboard" 
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
        </Route>
        <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
