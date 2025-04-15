import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CardActionArea, Grid } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const Admin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'rgba(26, 26, 26, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(40, 40, 40, 0.95)',
              },
            }}
          >
            <CardActionArea 
              onClick={() => navigate('/admin/users')}
              sx={{ height: '100%' }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                <Typography variant="h5" component="div" color="white">
                  User Management
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
                  View and manage user accounts
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Admin; 