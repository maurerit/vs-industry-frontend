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

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {item.name}
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