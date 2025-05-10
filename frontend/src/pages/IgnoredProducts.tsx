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
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  TablePagination,
  Autocomplete
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface IgnoredProduct {
  productId: number;
  productName: string;
  reason: string;
}

interface IgnoredProductsResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: IgnoredProduct[];
}

interface ProductType {
  itemId: number;
  name: string;
  description: string;
}

interface ProductTypeResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: ProductType[];
}

const IgnoredProducts: React.FC = () => {
  const [products, setProducts] = useState<IgnoredProduct[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [reason, setReason] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/config/ignoredproduct?page=${page}&pageSize=${rowsPerPage}`);
      const data: IgnoredProductsResponse = await response.json();
      setProducts(data.content);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching ignored products:', error);
    }
  };

  const searchProducts = async (search: string) => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/data/type?page=0&pageSize=25&search=${encodeURIComponent(search)}&marketGroupSearch=false`);
      const data: ProductTypeResponse = await response.json();
      setSearchResults(data.content);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      searchProducts(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (_event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(_event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (_event: React.SyntheticEvent, value: string) => {
    setSearchTerm(value);
  };

  const handleProductSelect = (_event: React.SyntheticEvent, value: ProductType | null) => {
    setSelectedProduct(value);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || !reason) return;

    try {
      const response = await fetch('/api/config/ignoredproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.itemId,
          productName: selectedProduct.name,
          reason: reason
        }),
      });

      if (response.ok) {
        setSelectedProduct(null);
        setReason('');
        setSearchTerm('');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding ignored product:', error);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/config/ignoredproduct/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting ignored product:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Ignored Products</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Autocomplete
          sx={{ flex: 1 }}
          options={searchResults}
          getOptionLabel={(option) => option.name}
          value={selectedProduct}
          onChange={handleProductSelect}
          inputValue={searchTerm}
          onInputChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Products"
              variant="outlined"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <img 
                src={`https://images.evetech.net/types/${option.itemId}/icon`} 
                alt={option.name}
                style={{ width: 32, height: 32, marginRight: 8 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {option.name}
            </Box>
          )}
        />
        <TextField
          sx={{ flex: 1 }}
          label="Reason"
          variant="outlined"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          disabled={!selectedProduct || !reason}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Icon</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell>
                  <img 
                    src={`https://images.evetech.net/types/${product.productId}/icon`} 
                    alt={product.productName}
                    style={{ width: 32, height: 32 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.reason}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(product.productId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default IgnoredProducts; 