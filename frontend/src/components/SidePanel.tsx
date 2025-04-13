import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Inventory as WarehouseIcon,
  Build as ProductsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Warehouse', icon: <WarehouseIcon />, path: '/warehouse' },
    { text: "Products", icon: <ProductsIcon />, path: '/products' },
    { text: 'Profile', icon: <AccountIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box
      sx={{
        width: isOpen ? 240 : 64,
        height: '100vh',
        backgroundColor: '#2a2a2a',
        color: 'white',
        transition: 'width 0.3s',
        position: 'fixed',
        left: 0,
        top: 0,
        paddingTop: '64px', // Height of header
      }}
    >
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          color: 'white',
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              {isOpen && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SidePanel; 