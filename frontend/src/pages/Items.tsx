import React, { useState, useEffect, useRef, ReactNode } from 'react';
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
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate, Link } from 'react-router-dom';

interface Item {
  itemId: number;
  name: string;
  description: string | null;
}

interface ItemResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: Item[];
}

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchItems = async (page: number, pageSize: number, searchTerm: string) => {
    try {
      setLoading(true);
      let url = `/api/data/type?page=${page}&pageSize=${pageSize}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data: ItemResponse = await response.json();
      setItems(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update debounced search value after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Fetch items when debounced search changes
  useEffect(() => {
    fetchItems(page, rowsPerPage, debouncedSearch);
  }, [page, rowsPerPage, debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  const handleClearSearch = () => {
    setSearch('');
    // Focus the search field after clearing
    searchFieldRef.current?.focus();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const parseDescription = (text: string | null) => {
    if (!text) return '-';
    
    // First replace \r\n with newlines
    const textWithNewlines = text.replace(/\\r\\n/g, '\n');
    
    // Replace <a href=showinfo:ID>Text</a> with links
    const linkRegex = /<a href=showinfo:(\d+)>([^<]+)<\/a>/g;
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(textWithNewlines)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(textWithNewlines.substring(lastIndex, match.index));
      }
      
      // Add the link
      const typeId = match[1];
      const linkText = match[2];
      parts.push(
        <Link 
          key={`${typeId}-${match.index}`} 
          to={`/item/${typeId}`}
          style={{ color: 'inherit', textDecoration: 'underline' }}
          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
        >
          {linkText}
        </Link>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < textWithNewlines.length) {
      parts.push(textWithNewlines.substring(lastIndex));
    }

    return parts.length > 0 ? parts : textWithNewlines;
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
      <Typography variant="h4" component="h1" gutterBottom>
        Items
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          inputRef={searchFieldRef}
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={search}
          onChange={handleSearchChange}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.itemId}
                onClick={() => navigate(`/item/${item.itemId}`)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-line' }}>
                  {parseDescription(item.description)}
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

export default Items; 