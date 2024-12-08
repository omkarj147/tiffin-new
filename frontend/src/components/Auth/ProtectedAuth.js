import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedAuth = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      const userData = JSON.parse(user);
      // Redirect based on user type
      if (userData.userType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    }
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedAuth;
