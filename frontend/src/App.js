import React, { useEffect } from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "member/dashboard", element: <MemberDashboard /> },
      { path: "menu", element: <Menu /> },
      { path: "orders", element: <Orders /> },
      { path: "wallet", element: <Wallet /> },
      { path: "profile", element: <Profile /> },
      { path: "admin/menu", element: <MenuManagement /> },
      { path: "admin/dashboard", element: <AdminDashboard /> },
    ]
  }
], {
  future: {
    v7_startTransition: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

// Enable hot module replacement
if (module.hot) {
  module.hot.accept();
}

export default App;
