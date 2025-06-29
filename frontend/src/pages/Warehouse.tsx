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
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Numbers as NumbersIcon,
  PriceChange as PriceChangeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AddDeliveryDialog from '../components/AddDeliveryDialog';

interface InventoryItem {
  itemId: number;
  name: string;
  quantity: number;
  costPerItem: number;
  totalValue: number;
}

interface SortOrder {
  field: keyof InventoryItem;
  direction: 'asc' | 'desc';
}

export const Warehouse: React.FC = () => {
  const navigate = useNavigate();
  const { 
    nameFilter, 
    setNameFilter, 
    lastScrollPosition, 
    setLastScrollPosition,
    setPrefetchedProduct 
  } = useVaporSeaIndustry();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>({ field: 'name', direction: 'asc' });
  const [editingItem, setEditingItem] = useState<{ itemId: number; field: 'quantity' | 'costPerItem'; value: number } | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [isAddDeliveryDialogOpen, setIsAddDeliveryDialogOpen] = useState(false);

  const searchFieldRef = useRef<HTMLInputElement>(null);
  const editFieldRef = useRef<HTMLInputElement>(null);

  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = lastScrollPosition;
    }
  }, [lastScrollPosition]);

  useEffect(() => {
    try {
      const regex = new RegExp(nameFilter, 'i');
      const filtered = items.filter(item => 
        regex.test(item.name)
      );
      setFilteredItems(filtered);
    } catch (e) {
      // If the regex is invalid, fall back to simple string matching
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [items, nameFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/warehouse');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      // Calculate totalValue for each item
      const itemsWithTotal = data.map((item: InventoryItem) => ({
        ...item,
        totalValue: item.quantity * item.costPerItem
      }));
      setItems(itemsWithTotal);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof InventoryItem) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (itemId: number, field: 'quantity' | 'costPerItem', value: number) => {
    setEditingItem({ itemId, field, value });
    setTimeout(() => {
      if (editFieldRef.current) {
        editFieldRef.current.focus();
        editFieldRef.current.select();
      }
    }, 0);
  };

  const handleSave = async (itemId: number) => {
    if (!editingItem) return;

    try {
      setSaving(itemId);
      const response = await fetch('/api/warehouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: editingItem.field === 'quantity' ? editingItem.value : items.find(i => i.itemId === itemId)?.quantity,
          costPerItem: editingItem.field === 'costPerItem' ? editingItem.value : items.find(i => i.itemId === itemId)?.costPerItem,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save item');
      }

      // Update local state
      setItems(prevItems => 
        prevItems.map(item => {
          if (item.itemId === itemId) {
            const updatedItem = { ...item };
            if (editingItem.field === 'quantity') {
              updatedItem.quantity = editingItem.value;
              updatedItem.totalValue = editingItem.value * item.costPerItem;
            } else {
              updatedItem.costPerItem = editingItem.value;
              updatedItem.totalValue = item.quantity * editingItem.value;
            }
            return updatedItem;
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error saving item:', error);
      // You might want to show an error message to the user here
    } finally {
      setEditingItem(null);
      setSaving(null);
    }
  };

  const handleClearSearch = () => {
    setNameFilter('');
    setTimeout(() => {
      searchFieldRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, itemId: number) => {
    if (e.key === 'Enter') {
      handleSave(itemId);
    }
  };

  const handleRowClick = async (e: React.MouseEvent, itemId: number) => {
    // Check if the click was on an edit button or its parent cell
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('td:last-child')) {
      return; // Don't navigate if clicking edit buttons or their container
    }

    if(editingItem?.itemId === itemId) {
      return;
    }

    try {
      const response = await fetch(`/api/product/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setPrefetchedProduct(itemId.toString(), data);
        if (containerRef.current) {
          setLastScrollPosition(containerRef.current.scrollTop);
        }
        navigate(`/product/${itemId}`);
      }
    } catch (error) {
      console.error('Error prefetching product:', error);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(event.target.value);
  };

  const handleOpenAddDeliveryDialog = () => {
    setIsAddDeliveryDialogOpen(true);
  };

  const handleCloseAddDeliveryDialog = () => {
    setIsAddDeliveryDialogOpen(false);
  };

  const handleDeliverySuccess = () => {
    fetchItems(); // Refresh the items list after a successful delivery
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortOrder.field];
    const bValue = b[sortOrder.field];
    const multiplier = sortOrder.direction === 'asc' ? 1 : -1;
    return aValue < bValue ? -1 * multiplier : aValue > bValue ? 1 * multiplier : 0;
  });

  const totalValue = sortedItems.reduce((sum, item) => sum + item.totalValue, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        Error: {error}
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ pr: 3, height: 'calc(100vh - 128px)', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Warehouse Inventory
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', color: 'white' }}>
            <Typography variant="h6" component="div">
              Total Warehouse Value:
            </Typography>
            <Typography variant="h5" component="div" sx={{ color: '#4caf50' }}>
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ISK
            </Typography>
          </Paper>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDeliveryDialog}
            sx={{ alignSelf: 'flex-end', width: 'auto' }}
          >
            Add Delivery
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter by name..."
          value={nameFilter}
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
            endAdornment: nameFilter && (
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

      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1a1a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Icon</TableCell>
              <TableCell sx={{ color: 'white' }}>
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
              <TableCell align="right" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={sortOrder.field === 'quantity'}
                  direction={sortOrder.field === 'quantity' ? sortOrder.direction : 'asc'}
                  onClick={() => handleSort('quantity')}
                  sx={{
                    color: 'white !important',
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={sortOrder.field === 'costPerItem'}
                  direction={sortOrder.field === 'costPerItem' ? sortOrder.direction : 'asc'}
                  onClick={() => handleSort('costPerItem')}
                  sx={{
                    color: 'white !important',
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Cost per Item
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={sortOrder.field === 'totalValue'}
                  direction={sortOrder.field === 'totalValue' ? sortOrder.direction : 'asc'}
                  onClick={() => handleSort('totalValue')}
                  sx={{
                    color: 'white !important',
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Total Value
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow 
                key={item.itemId}
                onClick={(e) => handleRowClick(e, item.itemId)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#262626' }
                }}
              >
                <TableCell sx={{ color: 'white' }}>
                  <img 
                    src={`https://images.evetech.net/types/${item.itemId}/icon`} 
                    alt={item.name}
                    style={{ width: 32, height: 32 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'white' }}>{item.name}</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>
                  {editingItem?.itemId === item.itemId && editingItem.field === 'quantity' ? (
                    <TextField
                      type="number"
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: Number(e.target.value) })}
                      onKeyDown={(e) => handleKeyDown(e, item.itemId)}
                      size="small"
                      sx={{ width: '100px' }}
                      inputProps={{ 
                        style: { color: 'white' },
                        ref: editFieldRef
                      }}
                    />
                  ) : (
                    item.quantity.toLocaleString()
                  )}
                </TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>
                  {editingItem?.itemId === item.itemId && editingItem.field === 'costPerItem' ? (
                    <TextField
                      type="number"
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: Number(e.target.value) })}
                      onKeyDown={(e) => handleKeyDown(e, item.itemId)}
                      size="small"
                      sx={{ width: '100px' }}
                      inputProps={{ 
                        style: { color: 'white' },
                        ref: editFieldRef
                      }}
                    />
                  ) : (
                    item.costPerItem.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  )}
                </TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>
                  {item.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell align="right">
                  {editingItem?.itemId === item.itemId ? (
                    <IconButton
                      onClick={() => handleSave(item.itemId)}
                      disabled={saving === item.itemId}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      {saving === item.itemId ? <CircularProgress size={20} /> : <SaveIcon />}
                    </IconButton>
                  ) : (
                    <>
                      <Tooltip title="Edit Quantity">
                        <IconButton
                          onClick={() => handleEdit(item.itemId, 'quantity', item.quantity)}
                          size="small"
                          sx={{ color: 'white', mr: 1 }}
                        >
                          <NumbersIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Cost">
                        <IconButton
                          onClick={() => handleEdit(item.itemId, 'costPerItem', item.costPerItem)}
                          size="small"
                          sx={{ color: 'white' }}
                        >
                          <PriceChangeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Delivery Dialog */}
      <AddDeliveryDialog
        open={isAddDeliveryDialogOpen}
        onClose={handleCloseAddDeliveryDialog}
        onSuccess={handleDeliverySuccess}
      />
    </Box>
  );
}; 
