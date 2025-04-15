import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface User {
  characterId: number;
  characterName: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  page: number;
  totalPages: number;
  totalElements: number;
  content: User[];
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (page: number, size: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user?page=${page}&pageSize=${size}`);
      const data: UserResponse = await response.json();
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/users/new')}
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Character ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Character Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Created At</TableCell>
              <TableCell sx={{ color: 'white' }}>Updated At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.characterId}>
                <TableCell sx={{ color: 'white' }}>{user.characterId}</TableCell>
                <TableCell sx={{ color: 'white' }}>{user.characterName}</TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  {new Date(user.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label" sx={{ color: 'white' }}>Rows per page</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={rowsPerPage.toString()}
            onChange={handleChangeRowsPerPage}
            label="Rows per page"
            sx={{ 
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
          sx={{
            color: 'white',
            '& .MuiTablePagination-selectIcon': {
              color: 'white',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Users; 