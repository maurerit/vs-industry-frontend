/*
 * MIT License
 *
 * Copyright (c) 2025 VaporSea
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CardActionArea, Grid, Snackbar, Alert } from '@mui/material';
import { People as PeopleIcon, AttachMoney as MoneyIcon, Block as BlockIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleStoreTokens = async () => {
    try {
      const response = await fetch('/api/data/store-tokens', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to store tokens');
      }

      setNotification({
        open: true,
        message: 'Tokens stored successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error storing tokens:', error);
      setNotification({
        open: true,
        message: 'Failed to store tokens. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Box
          sx={{
            width: '100%',
            '@media (min-width:600px)': {
              width: '50%',
            },
            '@media (min-width:900px)': {
              width: '33.33%',
            },
            p: 1,
          }}
        >
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(40, 40, 40, 0.95)',
              },
            }}
          >
            <CardActionArea 
              onClick={() => navigate('/admin/users')}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                <Typography variant="h5" component="div" color="white">
                  User Management
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  View and manage user accounts
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        <Box
          sx={{
            width: '100%',
            '@media (min-width:600px)': {
              width: '50%',
            },
            '@media (min-width:900px)': {
              width: '33.33%',
            },
            p: 1,
          }}
        >
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(40, 40, 40, 0.95)',
              },
            }}
          >
            <CardActionArea 
              onClick={() => navigate('/admin/extracost')}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                <Typography variant="h5" component="div" color="white">
                  Extra Costs
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  Manage manufacturing overhead costs
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        <Box
          sx={{
            width: '100%',
            '@media (min-width:600px)': {
              width: '50%',
            },
            '@media (min-width:900px)': {
              width: '33.33%',
            },
            p: 1,
          }}
        >
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(40, 40, 40, 0.95)',
              },
            }}
          >
            <CardActionArea 
              onClick={() => navigate('/admin/ignored-products')}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <BlockIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                <Typography variant="h5" component="div" color="white">
                  Ignored Products
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  Manage products excluded from manufacturing
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
        <Box
          sx={{
            width: '100%',
            '@media (min-width:600px)': {
              width: '50%',
            },
            '@media (min-width:900px)': {
              width: '33.33%',
            },
            p: 1,
          }}
        >
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(40, 40, 40, 0.95)',
              },
            }}
          >
            <CardActionArea 
              onClick={handleStoreTokens}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <RefreshIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                <Typography variant="h5" component="div" color="white">
                  Store API Tokens
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  This only needs to be done once during initial setup.
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  The backend will automatically handle token refreshes.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Grid>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Admin; 
