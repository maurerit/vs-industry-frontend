import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { debounce } from 'lodash';

interface BlueprintOption {
  id: string;
  label: string;
  value: string;
}

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<BlueprintOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<BlueprintOption | null>(null);

  const fetchOptions = async (term: string) => {
    if (!term) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/js-api/blueprint/blueprint/api/blueprintName.php?term=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blueprint options');
      }
      const data = await response.json();
      setOptions(data);
    } catch (error) {
      console.error('Error fetching blueprint options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = debounce(fetchOptions, 300);

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]);

  const handleAdd = () => {
    if (selectedOption) {
      // Navigate to ConfigureProduct with the selected type ID
      navigate(`/configure-product/${selectedOption.id}`);
      setSelectedOption(null);
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.label || option.value}
          loading={loading}
          value={selectedOption}
          onChange={(_, newValue) => setSelectedOption(newValue)}
          inputValue={searchTerm}
          onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Blueprint"
              fullWidth
              margin="normal"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleAdd} 
          variant="contained" 
          color="primary"
          disabled={!selectedOption}
        >
          Configure
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog; 