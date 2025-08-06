import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Spinner Component
 * BCOLBD 2025 - Team GreyDevs
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2, color: '#4CAF50' }} />
      <Typography variant="h6" color="textSecondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
