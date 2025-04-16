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
  TablePagination,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Button,
  Autocomplete
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

interface ExtraCost {
  itemId: number;
  name: string;
  cost: number;
}

interface ExtraCostResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: ExtraCost[];
}

interface SearchItem {
  itemId: number;
  name: string;
}

interface SearchResponse {
  content: SearchItem[];
}

const ExtraCost: React.FC = () => {
  const [costs, setCosts] = useState<ExtraCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemSearch, setNewItemSearch] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchCosts = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/config/extracost?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch extra costs');
      }
      const data: ExtraCostResponse = await response.json();
      setCosts(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleEdit = (cost: ExtraCost) => {
    setEditingId(cost.itemId);
    setEditValue(cost.cost.toString());
  };

  const handleSave = async (itemId: number) => {
    try {
      setSavingId(itemId);
      const numericValue = parseFloat(editValue);
      
      if (isNaN(numericValue)) {
        throw new Error('Invalid cost value');
      }

      const response = await fetch('/api/config/extracost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: itemId,
          cost: numericValue 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cost');
      }

      // Update the local state with the new value
      setCosts(costs.map(cost => 
        cost.itemId === itemId ? { ...cost, cost: numericValue } : cost
      ));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Debounced search function
  useEffect(() => {
    if (!newItemSearch) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await fetch(`/api/data/type?page=0&pageSize=10&search=${encodeURIComponent(newItemSearch)}`);
        if (!response.ok) {
          throw new Error('Failed to search items');
        }
        const data: SearchResponse = await response.json();
        setSearchResults(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newItemSearch]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewItemSearch('');
    setNewItemCost('');
    setSelectedItem(null);
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewItemSearch('');
    setNewItemCost('');
    setSelectedItem(null);
  };

  const handleSaveNew = async () => {
    if (!selectedItem || !newItemCost) return;

    try {
      setSavingId(-1); // Use -1 to indicate saving new item
      const numericValue = parseFloat(newItemCost);
      
      if (isNaN(numericValue)) {
        throw new Error('Invalid cost value');
      }

      const response = await fetch('/api/config/extracost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: selectedItem.itemId,
          cost: numericValue 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add new cost');
      }

      // Add the new item to the list
      setCosts([...costs, {
        itemId: selectedItem.itemId,
        name: selectedItem.name,
        cost: numericValue
      }]);
      
      setIsAddingNew(false);
      setNewItemSearch('');
      setNewItemCost('');
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setSavingId(null);
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
          Extra Manufacturing Costs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          disabled={isAddingNew}
        >
          Add New
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell align="center" width={100}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAddingNew && (
              <TableRow>
                <TableCell>
                  <Autocomplete
                    value={selectedItem}
                    onChange={(_event, newValue) => {
                      setSelectedItem(newValue);
                    }}
                    inputValue={newItemSearch}
                    onInputChange={(_event, newInputValue) => {
                      setNewItemSearch(newInputValue);
                    }}
                    options={searchResults}
                    getOptionLabel={(option) => option.name}
                    loading={searching}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Search for item..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {searching ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    size="small"
                    type="number"
                    inputProps={{ 
                      step: "0.01",
                      min: "0",
                      style: { textAlign: 'right' }
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Save">
                    <IconButton 
                      onClick={handleSaveNew}
                      disabled={!selectedItem || !newItemCost || savingId === -1}
                      size="small"
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton 
                      onClick={handleCancelNew}
                      size="small"
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )}
            {costs.map((cost) => (
              <TableRow key={cost.itemId}>
                <TableCell>
                  <Link
                    to={`/item/${cost.itemId}`}
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    {cost.name}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  {editingId === cost.itemId ? (
                    <TextField
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      size="small"
                      type="number"
                      inputProps={{ 
                        step: "0.01",
                        min: "0",
                        style: { textAlign: 'right' }
                      }}
                      autoFocus
                    />
                  ) : (
                    cost.cost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  )}
                </TableCell>
                <TableCell align="center">
                  {editingId === cost.itemId ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton 
                          onClick={() => handleSave(cost.itemId)}
                          disabled={savingId === cost.itemId}
                          size="small"
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton 
                          onClick={handleCancel}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleEdit(cost)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Box>
  );
};

export default ExtraCost; 