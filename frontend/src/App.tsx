import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme';
import { Header } from './components/Header';
import SidePanel from './components/SidePanel';
import { Dashboard } from './components/Dashboard';
import { Warehouse } from './components/Warehouse';
import { Product } from './pages/Product';
import { Products } from './components/Products.tsx';
import { Profile } from './components/Profile.tsx';
import Admin from './pages/Admin';
import Users from './pages/Users';
import UserCreate from './pages/UserCreate';
import { Box } from '@mui/material';
import { WarehouseProvider } from './context/WarehouseContext';
import { useState } from 'react';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <WarehouseProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <SidePanel isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
              <Box 
                component="main" 
                sx={{ 
                  flex: 1, 
                  p: 3, 
                  overflow: 'auto',
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
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/users/new" element={<UserCreate />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </WarehouseProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
