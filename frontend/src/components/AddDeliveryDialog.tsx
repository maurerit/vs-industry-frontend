import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Box,
} from '@mui/material';
import { debounce } from 'lodash';

interface SearchItem {
  itemId: number;
  name: string;
}

interface SearchResponse {
  content: SearchItem[];
}

interface AddDeliveryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddDeliveryDialog: React.FC<AddDeliveryDialogProps> = ({ open, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchItem | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchOptions = async (term: string) => {
    if (!term) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/data/type?page=0&pageSize=10&search=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch type options');
      }
      const data: SearchResponse = await response.json();
      setOptions(data.content);
    } catch (error) {
      console.error('Error fetching type options:', error);
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
  }, [searchTerm, debouncedFetch]);

  // Focus on the input field when the dialog opens
  useEffect(() => {
    if (open) {
      // Use setTimeout to ensure the dialog is fully rendered before focusing
      setTimeout(() => {
        if (autocompleteRef.current) {
          autocompleteRef.current.focus();
        }
      }, 300);
    }
  }, [open]);

  const resetForm = () => {
    setSelectedOption(null);
    setSearchTerm('');
    setQuantity('');
    setAmount('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!selectedOption) {
      setError('Please select an item');
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/warehouse/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedOption.itemId,
          quantity: quantityNum,
          costPerItem: amountNum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to warehouse');
      }

      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding item to warehouse:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        component: 'form',
        ref: formRef,
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Add Delivery</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name}
            loading={loading}
            value={selectedOption}
            onChange={(_, newValue) => setSelectedOption(newValue)}
            inputValue={searchTerm}
            onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Item"
                fullWidth
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
          
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputRef={quantityRef}
            onKeyDown={handleKeyDown}
            inputProps={{ min: 1 }}
          />
          
          <TextField
            label="Amount per Item"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputRef={amountRef}
            onKeyDown={handleKeyDown}
            inputProps={{ min: 0.01, step: 0.01 }}
          />
          
          {error && (
            <Box sx={{ color: 'error.main', mt: 1 }}>
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          type="submit"
          variant="contained" 
          color="primary"
          disabled={submitting || !selectedOption || !quantity || !amount}
        >
          {submitting ? <CircularProgress size={24} /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDeliveryDialog;