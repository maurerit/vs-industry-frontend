import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

interface EntryPageProps {
  isVisible: boolean;
}

const EntryPage: React.FC<EntryPageProps> = ({ isVisible }) => {
  const [loginUrl, setLoginUrl] = useState<string>('');
  const [needsFirstUser, setNeedsFirstUser] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if we need to create first user
    fetch('/api/has-users')
      .then(response => {
        if (response.status === 200) {
          setNeedsFirstUser(true);
        }
        return fetch('/js-api/login');
      })
      .then(response => response.json())
      .then(data => setLoginUrl(data.loginUrl))
      .catch(error => console.error('Failed to fetch data:', error));
  }, []);

  const handleCreateFirstUser = async () => {
    try {
      const response = await fetch(`/api/create-first-user?characterId=${encodeURIComponent(characterId)}&characterName=${encodeURIComponent(characterName)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create first user');
      }

      // Refresh the page to start the normal login flow
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!isVisible) {
    return null;
  }

  if (needsFirstUser) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 300,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Create First User
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            label="Character ID"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            fullWidth
          />
          <TextField
            label="Character Name"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleCreateFirstUser}
            disabled={!characterId || !characterName}
            sx={{ mt: 2 }}
          >
            Create User
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        Vapor Sea Industry
      </Typography>
      {loginUrl && (
        <Box
          component="a"
          href={loginUrl}
          sx={{
            backgroundImage: 'url(https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-black-large.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            width: '270px',
            height: '45px',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      )}
    </Box>
  );
};

export default EntryPage; 