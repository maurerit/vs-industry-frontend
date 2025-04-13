import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff0000', // Pure red
    },
    secondary: {
      main: '#2a2a2a', // Dark gray
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}); 