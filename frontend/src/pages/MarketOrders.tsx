import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';

interface MarketOrder {
  order_id: number;
  duration: number;
  issued: string;
  price: number;
  type_id: number;
  type_name: string;
  volume_remain: number;
  volume_total: number;
  wallet_division: number;
  is_buy_order: boolean;
}

const MarketOrders: React.FC = () => {
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/corp/market-orders');
        if (!response.ok) {
          throw new Error('Failed to fetch market orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sellOrders = orders.filter(order => !order.is_buy_order);
  const buyOrders = orders.filter(order => order.is_buy_order);

  const calculateTotalValue = (orders: MarketOrder[]) => {
    return orders.reduce((total, order) => total + (order.price * order.volume_remain), 0);
  };

  const formatISK = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + ' ISK';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const renderOrdersTable = (orders: MarketOrder[], title: string) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title} - Total Value: {formatISK(calculateTotalValue(orders))}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Volume</TableCell>
              <TableCell align="right">Total Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>
                  <img 
                    src={`https://images.evetech.net/types/${order.type_id}/icon`} 
                    alt={order.type_name}
                    style={{ width: 32, height: 32 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </TableCell>
                <TableCell>{order.type_name}</TableCell>
                <TableCell align="right">{formatISK(order.price)}</TableCell>
                <TableCell align="right">
                  {order.volume_remain} / {order.volume_total}
                </TableCell>
                <TableCell align="right">
                  {formatISK(order.price * order.volume_remain)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Orders
      </Typography>
      {renderOrdersTable(sellOrders, 'Sell Orders')}
      {renderOrdersTable(buyOrders, 'Buy Orders')}
    </Box>
  );
};

export default MarketOrders; 