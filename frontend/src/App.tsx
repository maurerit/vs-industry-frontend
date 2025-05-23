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


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { darkTheme } from './theme';
import { Header } from './components/Header';
import SidePanel from './components/SidePanel';
import { Dashboard } from './pages/Dashboard.tsx';
import { Warehouse } from './pages/Warehouse.tsx';
import { Product } from './pages/Product';
import { Products } from './pages/Products.tsx';
import { Profile } from './pages/Profile.tsx';
import Admin from './pages/Admin';
import Users from './pages/Users';
import UserCreate from './pages/UserCreate';
import Items from './pages/Items';
import Item from './pages/Item';
import ExtraCost from './pages/ExtraCost';
import MarketOrders from './pages/MarketOrders';
import IndustryJobs from './pages/IndustryJobs';
import { VaporSeaIndustryProvider } from './context/VaporSeaIndustryContext';
import EntryPage from './pages/EntryPage.tsx';
import ConfigureProduct from './pages/ConfigureProduct';
import SPAIError from './pages/SPAIError';
import IgnoredProducts from './pages/IgnoredProducts';

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = document.cookie.split(';').some((cookie) => 
        cookie.trim().startsWith('EVETokenExpiry=')
      );

      if (hasToken) {
        try {
          const response = await fetch('/api/user/me');
          if (response.ok) {
            setIsValidUser(true);
            setIsAuthenticated(true);
          } else {
            setIsValidUser(false);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking user validity:', error);
          setIsValidUser(false);
          setIsAuthenticated(false);
        }
      } else {
        setIsValidUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
    // Check auth status every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  if (isValidUser === false) {
    return <SPAIError />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <EntryPage isVisible={!isAuthenticated} />
      {isAuthenticated && (
        <Router>
          <VaporSeaIndustryProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header/>
              <Box sx={{ display: 'flex', flex: 1 }}>
                <SidePanel isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
                <Box 
                  component="main" 
                  sx={{ 
                    flex: 1, 
                    p: 3, 
                    overflow: 'auto',
                    pt: '88px',
                    transition: theme => theme.transitions.create('margin-left', {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                    marginLeft: { 
                      xs: 0, 
                      sm: isCollapsed ? '64px' : '240px'
                    },
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/warehouse" element={<Warehouse />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/configure-product/:typeId" element={<ConfigureProduct />} />
                    <Route path="/product/:id" element={<Product />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/users/new" element={<UserCreate />} />
                    <Route path="/items" element={<Items />} />
                    <Route path="/item/:itemId" element={<Item />} />
                    <Route path="/admin/extracost" element={<ExtraCost />} />
                    <Route path="/market-orders" element={<MarketOrders />} />
                    <Route path="/industry-jobs" element={<IndustryJobs />} />
                    <Route path="/admin/ignored-products" element={<IgnoredProducts />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </VaporSeaIndustryProvider>
        </Router>
      )}
    </ThemeProvider>
  );
};

export default App;
