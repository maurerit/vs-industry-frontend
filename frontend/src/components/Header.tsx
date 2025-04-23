import React, { useEffect, useState, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import { useCharacterInfo } from '../hooks/useCharacterInfo';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { characterInfo, isLoading, refetch } = useCharacterInfo();
  const [loginUrl, setLoginUrl] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const checkAndRefreshToken = useCallback(async () => {
    const expiryStr = document.cookie
      .split('; ')
      .find(row => row.startsWith('EVETokenExpiry='))
      ?.split('=')[1];

    if (!expiryStr) return;

    const expiry = new Date(decodeURIComponent(expiryStr));
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    
    // If token is already expired or will expire in less than 25 minutes, refresh it
    if (timeUntilExpiry < 5 * 60 * 1000) {
      try {
        const response = await fetch('/js-api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          // Refetch character info after successful token refresh
          await refetch();
        } else {
          // If refresh fails, redirect to login
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        window.location.href = '/';
      }
    }
  }, [refetch]);

  useEffect(() => {
    // Check token expiration every 30 seconds
    const intervalId = setInterval(checkAndRefreshToken, 30000);
    
    // Initial check
    checkAndRefreshToken();

    return () => clearInterval(intervalId);
  }, [checkAndRefreshToken]);

  useEffect(() => {
    // Fetch login URL when component mounts
    fetch('/js-api/login')
      .then(response => response.json())
      .then(data => setLoginUrl(data.loginUrl))
      .catch(error => console.error('Failed to fetch login URL:', error));
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/js-api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#1a1a1a' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EVE Industry Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isLoading && characterInfo && (
            <>
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                  padding: 0,
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <Avatar
                  src={`https://image.eveonline.com/Character/${characterInfo.characterId}_64.png`}
                  alt={characterInfo.characterName}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: '#1a1a1a',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      fontSize: '0.9rem',
                      py: 1,
                      px: 2,
                      minWidth: 150,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  component={Link}
                  to="/profile"
                >
                  {characterInfo.characterName}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
          {!isLoading && !characterInfo && loginUrl && (
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
      </Toolbar>
    </AppBar>
  );
}; 