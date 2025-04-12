import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';

interface WalletBalance {
  division: number;
  balance: number;
}

function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{
    totalOrders: Record<number, number>;
    totalSell: Record<number, number>;
    totalBuy: Record<number, number>;
  } | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/warehouse/processAll', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to process warehouse data');
      await fetchMarketSummary();
    } catch (error) {
      console.error('Error processing warehouse data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/data/fetch-all', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to refresh data');
      await fetchMarketSummary();
      await fetchWalletBalances();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
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
          sx={{
            bgcolor: '#ff0000', // Pure red
            '&:hover': {
              bgcolor: '#cc0000', // Darker pure red on hover
            },
            '&:disabled': {
              bgcolor: '#ff0000',
              opacity: 0.7,
            },
          }}
        >
          {isRefreshing ? 'Fetching...' : 'REFRESH DATA'}
        </Button>
        <Button
          variant="contained"
          onClick={handleProcess}
          disabled={isProcessing}
          sx={{
            bgcolor: '#2a2a2a', // Dark gray
            '&:hover': {
              bgcolor: '#1a1a1a', // Darker gray on hover
            },
            '&:disabled': {
              bgcolor: '#2a2a2a',
              opacity: 0.7,
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