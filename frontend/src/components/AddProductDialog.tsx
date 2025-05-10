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