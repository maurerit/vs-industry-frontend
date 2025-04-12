import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import { Warehouse } from './components/Warehouse';
import { Dashboard } from './components/Dashboard';
import { Product } from './pages/Product';
import { WarehouseProvider } from './context/WarehouseContext';

function App() {
  return (
    <Router>
      <WarehouseProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
          <SidePanel />
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3,
              marginLeft: '240px', // Width of the sidebar
              backgroundColor: '#000000',
              minHeight: 'calc(100vh - 64px)', // Full height minus header
            }}
          >
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/product/:itemId" element={<Product />} />
            </Routes>
          </Box>
        </Box>
      </WarehouseProvider>
    </Router>
  );
}

export default App;
