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


import React, { useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Item {
  itemId: number;
  name: string;
  description: string | null;
  // Add other item properties as needed
}

const Item: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseDescription = (text: string | null) => {
    if (!text) return 'No description available';
    
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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/data/type/${itemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item');
        }
        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

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
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mt: 2,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          aria-label="Back to items"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Item not found</Typography>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            mt: 2,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          aria-label="Back to items"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <IconButton 
        onClick={() => navigate(-1)}
        sx={{ 
          mb: 2,
          color: 'text.primary',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        aria-label="Back to items"
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img 
            src={`https://images.evetech.net/types/${item.itemId}/icon`} 
            alt={item.name}
            style={{ width: 64, height: 64, marginBottom: 16 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {item.name}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Item ID: {item.itemId}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {parseDescription(item.description)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Item; 