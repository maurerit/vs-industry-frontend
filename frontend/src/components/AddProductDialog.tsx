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


import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);

  const fetchOptions = async (term: string) => {
    if (!term) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/data/blueprintName/${encodeURIComponent(term)}`);
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

  // Create a memoized debounced function using useCallback
  const debouncedFetch = useCallback(
    debounce(fetchOptions, 300),
    [] // Empty dependency array ensures this is only created once
  );

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]); // Removed debouncedFetch from dependencies as it's memoized

  // Focus on the input field when the dialog opens
  useEffect(() => {
    if (open) {
      // Use setTimeout to ensure the dialog is fully rendered before focusing
      setTimeout(() => {
        // Try multiple approaches to ensure focus works
        if (autocompleteRef.current) {
          autocompleteRef.current.focus();
        }

        // Alternative approach: find the input element within the container
        if (autocompleteContainerRef.current) {
          const inputElement = autocompleteContainerRef.current.querySelector('input');
          if (inputElement) {
            inputElement.focus();
          }
        }
      }, 300); // Increased timeout to ensure dialog is fully rendered
    }
  }, [open]);

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
          ref={autocompleteContainerRef}
          options={options}
          getOptionLabel={(option) => option.label || option.value}
          loading={loading}
          value={selectedOption}
          onChange={(_, newValue) => setSelectedOption(newValue)}
          inputValue={searchTerm}
          onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
          disablePortal // Ensure the dropdown is rendered within the container
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Blueprint"
              fullWidth
              margin="normal"
              inputRef={autocompleteRef}
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
