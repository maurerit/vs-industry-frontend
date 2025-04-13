import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme';
import { Header } from './components/Header';
import SidePanel from './components/SidePanel';
import { Dashboard } from './components/Dashboard';
import { Warehouse } from './components/Warehouse';
import { Product } from './pages/Product';
import { Products } from './pages/Products';
import { Profile } from './pages/Profile';
import { Box } from '@mui/material';
import { WarehouseProvider } from './context/WarehouseContext';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <WarehouseProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
              <SidePanel />
              <Box 
                component="main" 
                sx={{ 
                  flex: 1, 
                  p: 3, 
                  overflow: 'auto',
                  marginLeft: '240px', // Width of the SidePanel
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/warehouse" element={<Warehouse />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/profile" element={<Profile />} />
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
