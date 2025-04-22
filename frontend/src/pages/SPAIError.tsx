import React from 'react';
import { Box, Typography } from '@mui/material';

const SPAIError: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: 'red',
          fontWeight: 'bold',
          fontSize: '10rem',
        }}
      >
        SPAI
      </Typography>
    </Box>
  );
};

export default SPAIError; 