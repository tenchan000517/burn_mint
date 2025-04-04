import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

// Space theme color palette
const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC', // Cosmic purple
      light: '#E2B8FF',
      dark: '#985EFF',
      contrastText: '#000',
    },
    secondary: {
      main: '#03DAC6', // Neon teal
      light: '#66FFF9',
      dark: '#00A896',
      contrastText: '#000',
    },
    background: {
      default: '#0A0A1A', // Darker deep space
      paper: '#1E1E1E',   // Slightly lighter background
    },
    error: {
      main: '#CF6679', // Material dark theme red
    },
    success: {
      main: '#00E676', // Alien green
    },
    warning: {
      main: '#FFD600', // Star light
    },
    info: {
      main: '#2196F3', // Earth blue
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
  },
  shape: {
    borderRadius: 16, // More rounded corners
  },
  typography: {
    fontFamily: '"Exo 2", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // Material 3 doesn't uppercase button text
      fontWeight: 500,
    },
  },
});

// Override component styles
const theme = createTheme({
  ...spaceTheme,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Darker gradient for background
          backgroundImage: 'radial-gradient(circle at 50% 50%, #101035 0%, #0A0A1A 60%, #050510 100%)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '28px',
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          textTransform: 'none',
          fontSize: '16px',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #BB86FC 30%, #8C61FF 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #E2B8FF 30%, #BB86FC 90%)',
            boxShadow: '0 4px 20px rgba(187, 134, 252, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #03DAC6 30%, #00A896 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #66FFF9 30%, #03DAC6 90%)',
            boxShadow: '0 4px 20px rgba(3, 218, 198, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: alpha('#BB86FC', 0.1),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          background: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: alpha('#BB86FC', 0.2),
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontSize: '14px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          height: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '24px',
          background: 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

export default theme;