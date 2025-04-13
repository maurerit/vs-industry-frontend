import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useCharacterInfo } from '../hooks/useCharacterInfo';

interface CharacterEsiData {
  corporation_id: number;
  birthday: string;
  security_status: number;
  name: string;
}

export const Profile: React.FC = () => {
  const { characterInfo, isLoading, error } = useCharacterInfo();
  const [esiData, setEsiData] = useState<CharacterEsiData | null>(null);
  const [esiError, setEsiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEsiData = async () => {
      if (!characterInfo?.characterId) return;
      
      try {
        const response = await fetch(
          `https://esi.evetech.net/latest/characters/${characterInfo.characterId}/?datasource=tranquility`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch character ESI data');
        }

        const data = await response.json();
        setEsiData(data);
      } catch (error) {
        console.error('Error fetching ESI data:', error);
        setEsiError(error instanceof Error ? error.message : 'Failed to load ESI data');
      }
    };

    fetchEsiData();
  }, [characterInfo?.characterId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !characterInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">Failed to load profile: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
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
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box
              sx={{
                position: 'relative',
                width: 256,
                height: 256,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <img 
                src={`https://image.eveonline.com/Character/${characterInfo.characterId}_256.png`}
                alt={`${characterInfo.characterName}'s portrait`}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {esiData && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <img 
                    src={`https://image.eveonline.com/Corporation/${esiData.corporation_id}_32.png`}
                    alt="Corporation logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 500,
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              {characterInfo.characterName}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              '& .MuiTypography-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
              }
            }}>
              <Typography>
                <strong>Character ID:</strong> {characterInfo.characterId}
              </Typography>
              {esiError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {esiError}
                </Typography>
              )}
              {esiData && (
                <>
                  <Typography>
                    <strong>Security Status:</strong> {esiData.security_status.toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Birthday:</strong> {new Date(esiData.birthday).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}; 