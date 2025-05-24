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
import ReactECharts from 'echarts-for-react';

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

  const prepareIskAmountSeries = (orders: MarketOrder[]) => {
    // Count orders by item type
    const orderCounts: Record<string, number> = {};

    orders.forEach(order => {
      if (orderCounts[order.type_name]) {
        orderCounts[order.type_name] += order.volume_remain * order.price;
      } else {
        orderCounts[order.type_name] = order.volume_remain * order.price;
      }
    });

    // Convert to format needed for echarts
    return Object.entries(orderCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const prepareVolumeSeries = (orders: MarketOrder[]) => {
    // Count volumes by item type
    const volumeCounts: Record<string, number> = {};

    orders.forEach(order => {
      if (volumeCounts[order.type_name]) {
        volumeCounts[order.type_name] += order.volume_remain;
      } else {
        volumeCounts[order.type_name] = order.volume_remain;
      }
    });

    // Convert to format needed for echarts
    return Object.entries(volumeCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getChartOptions = (
    iskData: { name: string; value: number }[], 
    volumeData: { name: string; value: number }[], 
    title: string
  ) => {
    return {
      title: {
        text: `${title} Distribution`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#ffffff'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          // Format the value based on series name
          let formattedValue;
          if (params.seriesName.includes('Volume')) {
            formattedValue = new Intl.NumberFormat('en-US').format(params.value);
          } else {
            formattedValue = formatISK(params.value);
          }
          return `${params.seriesName}<br/>${params.name}: ${formattedValue} (${params.percent}%)`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 50,
        type: 'scroll',
        maxHeight: 300,
        textStyle: {
          color: '#ffffff',
          fontSize: 14,
          overflow: 'breakAll',
          width: 150,
          lineHeight: 20
        },
        formatter: function(name: string) {
          // Limit legend name length if too long
          return name.length > 20 ? name.substring(0, 18) + '...' : name;
        },
        tooltip: {
          show: true,
          formatter: function(params: any) {
            return params.name;
          }
        },
        itemGap: 12,
        padding: [5, 10],
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '55%'],
          data: iskData,
          itemStyle: {
            borderColor: '#000',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        {
          name: `${title} Volume`,
          type: 'pie',
          radius: ['0%', '30%'],
          center: ['60%', '55%'],
          data: volumeData,
          itemStyle: {
            borderColor: '#000',
            borderWidth: 1
          },
          label: {
            show: false
          },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
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

      {/* Sell Orders Section */}
      <Box sx={{ mb: 6 }}>
        {/* Sell Orders Chart */}
        <Box sx={{ mb: 4, height: 650 }}>
          <Typography variant="h6" gutterBottom>
            Sell Orders Distribution
          </Typography>
          <ReactECharts 
            option={getChartOptions(
              prepareIskAmountSeries(sellOrders), 
              prepareVolumeSeries(sellOrders), 
              'Sell Orders'
            )}
            style={{ height: '100%', width: '100%' }}
          />
        </Box>
        {/* Sell Orders Table */}
        {renderOrdersTable(sellOrders, 'Sell Orders')}
      </Box>

      {/* Buy Orders Section */}
      <Box sx={{ mb: 6 }}>
        {/* Buy Orders Chart */}
        <Box sx={{ mb: 4, height: 650 }}>
          <Typography variant="h6" gutterBottom>
            Buy Orders Distribution
          </Typography>
          <ReactECharts 
            option={getChartOptions(
              prepareIskAmountSeries(buyOrders), 
              prepareVolumeSeries(buyOrders), 
              'Buy Orders'
            )}
            style={{ height: '100%', width: '100%' }}
          />
        </Box>
        {/* Buy Orders Table */}
        {renderOrdersTable(buyOrders, 'Buy Orders')}
      </Box>
    </Box>
  );
};

export default MarketOrders; 
