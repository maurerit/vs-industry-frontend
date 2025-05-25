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


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaporSeaIndustry } from '../context/VaporSeaIndustryContext';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  Button,
  TextField,
  InputAdornment,
  TableSortLabel
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';
import AddProductDialog from '../components/AddProductDialog.tsx';

interface Product {
  itemId: number;
  name: string;
  cost: number;
  description: string | null;
}

interface ProductResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: Product[];
}

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const { 
    productsPage, 
    setProductsPage, 
    productsPageSize, 
    setProductsPageSize,
    productsFilter,
    setProductsFilter
  } = useVaporSeaIndustry();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<{ field: keyof Product; direction: 'asc' | 'desc' }>({ 
    field: 'name', 
    direction: 'asc' 
  });

  const searchFieldRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (productsFilter) {
        queryParams.append('search', productsFilter);
      }

      const response = await fetch(`/api/product?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data: ProductResponse = await response.json();
      setProducts(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(productsPage, productsPageSize);
  }, [productsPage, productsPageSize, productsFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setProductsPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setProductsPageSize(Number(event.target.value));
    setProductsPage(0);
  };

  const handleTablePaginationRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProductsPageSize(parseInt(event.target.value, 10));
    setProductsPage(0);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductsFilter(event.target.value);
    setProductsPage(0); // Reset to first page when filter changes
  };

  const handleClearSearch = () => {
    setProductsFilter('');
    setTimeout(() => {
      searchFieldRef.current?.focus();
    }, 0);
  };

  const handleSort = (field: keyof Product) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Configure Product
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={productsPageSize}
              label="Page Size"
              onChange={handleChangeRowsPerPage}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Configure Products">
            <IconButton 
              onClick={() => navigate('/products/configure')}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter by name..."
          value={productsFilter}
          onChange={handleFilterChange}
          inputRef={searchFieldRef}
          sx={{
            backgroundColor: '#1a1a1a',
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: '#333',
              },
              '&:hover fieldset': {
                borderColor: '#444',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#666',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
            endAdornment: productsFilter && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{ color: 'white', '&:hover': { color: '#ccc' } }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortOrder.field === 'name'}
                  direction={sortOrder.field === 'name' ? sortOrder.direction : 'asc'}
                  onClick={() => handleSort('name')}
                  sx={{
                    color: 'white !important',
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortOrder.field === 'cost'}
                  direction={sortOrder.field === 'cost' ? sortOrder.direction : 'asc'}
                  onClick={() => handleSort('cost')}
                  sx={{
                    color: 'white !important',
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Cost
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...products]
              .sort((a, b) => {
                const aValue = a[sortOrder.field];
                const bValue = b[sortOrder.field];
                const multiplier = sortOrder.direction === 'asc' ? 1 : -1;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                  return aValue.localeCompare(bValue) * multiplier;
                }

                return ((aValue as number) - (bValue as number)) * multiplier;
              })
              .map((product) => (
              <TableRow 
                key={product.itemId}
                hover
                onClick={() => navigate(`/product/${product.itemId}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <img 
                    src={`https://images.evetech.net/types/${product.itemId}/icon`} 
                    alt={product.name}
                    style={{ width: 32, height: 32 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell align="right">
                  {product.description || '-'}
                </TableCell>
                <TableCell align="right">
                  {product.cost.toLocaleString()} ISK
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={productsPage}
        onPageChange={handleChangePage}
        rowsPerPage={productsPageSize}
        onRowsPerPageChange={handleTablePaginationRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />

      <AddProductDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </Box>
  );
}; 
