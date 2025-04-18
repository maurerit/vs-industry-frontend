import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button
} from '@mui/material';
import { Settings as SettingsIcon, Add as AddIcon } from '@mui/icons-material';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchProducts = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product?page=${page}&pageSize=${pageSize}`);
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
    fetchProducts(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleTablePaginationRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddProduct = async (blueprintId: string) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blueprintId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      // Refresh the products list
      fetchProducts(page, rowsPerPage);
    } catch (error) {
      console.error('Error adding product:', error);
    }
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
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Product
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={rowsPerPage}
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

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
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
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleTablePaginationRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />

      <AddProductDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddProduct}
      />
    </Box>
  );
}; 