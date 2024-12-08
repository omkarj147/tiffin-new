import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import MenuManagement from './components/Menu/MenuManagement';
import Menu from './components/Menu/Menu';
import Profile from './components/Profile/Profile';
import Orders from './components/Orders/Orders';
import Wallet from './components/Wallet/Wallet';
import PWAManager from './pwa/pwaManager';

const Layout = () => {
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
          <Route path="member/dashboard" element={<MemberDashboard />} />
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

// Enable hot module replacement
if (module.hot) {
  module.hot.accept();
}

export default App;
