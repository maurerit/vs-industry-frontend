import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UserCreate: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    characterId: '',
    characterName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: parseInt(formData.characterId),
          characterName: formData.characterName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      navigate('/admin/users');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ color: 'white', mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Create User
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          p: 3,
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Character ID"
              name="characterId"
              value={formData.characterId}
              onChange={handleChange}
              required
              type="number"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
            <TextField
              label="Character Name"
              name="characterName"
              value={formData.characterName}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/users')}
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                {saving ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserCreate; 