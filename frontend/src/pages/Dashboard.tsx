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


import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useVaporSeaIndustry } from '../context/VaporSeaIndustryContext';

interface WalletBalance {
  division: number;
  balance: number;
}

function Dashboard() {
  const { 
    isRefreshing, 
    isProcessing, 
    fetchAll, 
    processWarehouse,
    setIsRefreshing
  } = useVaporSeaIndustry();

  const [stats, setStats] = useState<{
    totalOrders: Record<number, number>;
    totalSell: Record<number, number>;
    totalBuy: Record<number, number>;
  } | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFetchStatus = async () => {
      try {
        const response = await fetch('/api/data/fetch-status');
        if (!response.ok) return;

        const data = await response.json();
        if (data.status === 'Fetching in progress') {
          setIsRefreshing(true);
          // Set up polling
          const interval = setInterval(async () => {
            const statusResponse = await fetch('/api/data/fetch-status');
            if (!statusResponse.ok) {
              clearInterval(interval);
              return;
            }
            const statusData = await statusResponse.json();
            if (statusData.status !== 'Fetching in progress') {
              setIsRefreshing(false);
              clearInterval(interval);
            }
          }, 5000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking fetch status:', error);
      }
    };

    checkFetchStatus();
  }, [setIsRefreshing]);

  const fetchMarketSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/data/market-order-summary');
      if (!response.ok) throw new Error('Failed to fetch market summary');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load market summary');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalances = async () => {
    try {
      const response = await fetch('/api/corp/wallet-balances');
      if (!response.ok) throw new Error('Failed to fetch wallet balances');
      const data = await response.json();
      setWalletBalances(data);
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
    }
  };

  useEffect(() => {
    fetchMarketSummary();
    fetchWalletBalances();
  }, []);

  const handleProcess = async () => {
    try {
      await processWarehouse();
      await fetchMarketSummary();
    } catch (error) {
      console.error('Error processing warehouse data:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchAll();
      await fetchMarketSummary();
      await fetchWalletBalances();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const formatIsk = (value: number) => {
    return value.toLocaleString() + ' ISK';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          sx={{
            bgcolor: '#ff0000', // Pure red
            '&:hover': {
              bgcolor: '#cc0000', // Darker pure red on hover
            },
            '&:disabled': {
              bgcolor: '#ff0000',
              opacity: 0.7,
              color: 'white', // Ensure text is visible when disabled
            },
          }}
        >
          {isRefreshing ? 'Fetching...' : 'REFRESH DATA'}
        </Button>
        <Button
          variant="contained"
          onClick={handleProcess}
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          sx={{
            bgcolor: '#2a2a2a', // Dark gray
            '&:hover': {
              bgcolor: '#1a1a1a', // Darker gray on hover
            },
            '&:disabled': {
              bgcolor: '#2a2a2a',
              opacity: 0.7,
              color: 'white', // Ensure text is visible when disabled
            },
          }}
        >
          {isProcessing ? 'Processing...' : 'Process Warehouse Data'}
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && stats && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px' }}>
          <Card sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Orders by Division
              </Typography>
              {stats.totalOrders && Object.entries(stats.totalOrders).map(([division, count]) => (
                <Typography key={division} variant="body1">
                  Division {division}: {count.toLocaleString()} orders
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Sell Orders by Division
              </Typography>
              {stats.totalSell && Object.entries(stats.totalSell).map(([division, value]) => (
                <Typography key={division} variant="body1">
                  Division {division}: {formatIsk(value)}
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Buy Orders by Division
              </Typography>
              {stats.totalBuy && Object.entries(stats.totalBuy).map(([division, value]) => (
                <Typography key={division} variant="body1">
                  Division {division}: {formatIsk(value)}
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#1a1a1a', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wallet Balances by Division
              </Typography>
              {walletBalances.map((balance) => (
                <Typography key={balance.division} variant="body1">
                  Division {balance.division}: {formatIsk(balance.balance)}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export { Dashboard }; 
