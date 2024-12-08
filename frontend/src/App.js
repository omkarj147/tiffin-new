import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import Navbar from './components/Navbar';
// eslint-disable-next-line no-unused-vars
import Home from './components/Home';
// eslint-disable-next-line no-unused-vars
import Login from './components/Auth/Login';
// eslint-disable-next-line no-unused-vars
import Signup from './components/Auth/Signup';
// eslint-disable-next-line no-unused-vars
import MemberDashboard from './components/Dashboard/MemberDashboard';
// eslint-disable-next-line no-unused-vars
import Menu from './components/Menu/Menu';
// eslint-disable-next-line no-unused-vars
import Orders from './components/Orders/Orders';
// eslint-disable-next-line no-unused-vars
import Wallet from './components/Wallet/Wallet';
// eslint-disable-next-line no-unused-vars
import Profile from './components/Profile/Profile';
// eslint-disable-next-line no-unused-vars
import MenuManagement from './components/Menu/MenuManagement';
// eslint-disable-next-line no-unused-vars
import AdminDashboard from './components/Dashboard/AdminDashboard';
// eslint-disable-next-line no-unused-vars
import PWAManager from './pwa/pwaManager';
// eslint-disable-next-line no-unused-vars
import PrivateRoute from './components/PrivateRoute';

// eslint-disable-next-line no-unused-vars
const _unused = useEffect;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You could log this to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout = () => {
  useEffect(() => {
    // Initialize PWA and store reference for cleanup
    const pwa = new PWAManager();
    
    // Global error handling
    const handleError = (event) => {
      console.error('Unhandled error:', event.error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      if (pwa && typeof pwa.cleanup === 'function') {
        pwa.cleanup();
      }
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
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
    <ErrorBoundary>
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
              path="admin/menu-management" 
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
            <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
