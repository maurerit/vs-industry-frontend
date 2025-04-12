import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button } from '@mui/material';

const Header: React.FC = () => {
  const [loginUrl, setLoginUrl] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/js-api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    // Check for token expiry cookie and refresh if needed
    const checkAuth = async () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as { [key: string]: string });

      console.log('All cookies:', cookies);
      const tokenExpiry = cookies['EVETokenExpiry'];
      
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();
        const timeUntilExpiry = expiryDate.getTime() - now.getTime();
        
        // If token expires in less than 5 minutes (300000ms), refresh it
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300000) {
          console.log('Token expiring soon, refreshing...');
          await refreshToken();
        }
        
        // Update login state based on token validity
        const isValid = expiryDate > now;
        if (isValid !== isLoggedIn) {
          console.log('Updating login state from', isLoggedIn, 'to', isValid);
          setIsLoggedIn(isValid);
        }
      } else if (isLoggedIn) {
        setIsLoggedIn(false);
      }
    };

    // Check auth on mount and every 30 seconds
    checkAuth();
    const interval = setInterval(checkAuth, 30000);

    // Fetch login URL
    fetch('/js-api/login')
      .then(response => response.json())
      .then(data => setLoginUrl(data.loginUrl))
      .catch(error => console.error('Failed to fetch login URL:', error));

    return () => clearInterval(interval);
  }, [isLoggedIn, refreshToken]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/js-api/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear local state
      setIsLoggedIn(false);
      setLoginUrl('');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  console.log('Rendering with isLoggedIn:', isLoggedIn); // Debug log for render

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#1a1a1a',
        color: 'white',
      }}
    >
      <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        EVE Industry
      </Box>
      {isLoggedIn ? (
        <Button
          onClick={handleLogout}
          sx={{
            color: 'white',
            border: '1px solid white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Logout
        </Button>
      ) : (
        <Button
          component="a"
          href={loginUrl}
          sx={{
            backgroundImage: 'url(https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            width: '200px',
            height: '40px',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      )}
    </Box>
  );
};

export default Header; 