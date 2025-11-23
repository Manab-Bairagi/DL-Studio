import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff5d00', // Orange
      light: '#ff8e33',
      dark: '#c43c00',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff', // White accents
      light: '#ffffff',
      dark: '#cccccc',
      contrastText: '#000000',
    },
    background: {
      default: '#050505', // Deep black
      paper: '#0a0a0a',   // Slightly lighter black
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      disabled: '#505050',
    },
    divider: '#1f1f1f',
    success: {
      main: '#00ff9d', // Neon green
      light: '#5effcf',
      dark: '#00cc7d',
    },
    warning: {
      main: '#ffb700',
      light: '#ffcf4d',
      dark: '#cc9200',
    },
    error: {
      main: '#ff3333',
      light: '#ff6666',
      dark: '#cc0000',
    },
    info: {
      main: '#00d9ff',
      light: '#66e8ff',
      dark: '#00a3bf',
    },
  },
  typography: {
    fontFamily: "'Onest', 'Inter', 'Segoe UI', sans-serif",
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-1px',
      textTransform: 'uppercase',
      lineHeight: 1.1,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#a0a0a0',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#808080',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill shape
          padding: '12px 28px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        contained: {
          background: '#ff5d00',
          color: '#000000',
          boxShadow: '0 0 20px rgba(255, 93, 0, 0.4)',
          '&:hover': {
            background: '#ff7a33',
            boxShadow: '0 0 30px rgba(255, 93, 0, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: '#333333',
          color: '#ffffff',
          '&:hover': {
            borderColor: '#ff5d00',
            color: '#ff5d00',
            backgroundColor: 'rgba(255, 93, 0, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(255, 93, 0, 0.3)',
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#0a0a0a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&.Mui-focused': {
              borderColor: '#ff5d00',
              boxShadow: '0 0 0 2px rgba(255, 93, 0, 0.2)',
              backgroundColor: 'rgba(255, 93, 0, 0.02)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#ff5d00',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.5px',
          borderRadius: 8,
          minHeight: 48,
          '&.Mui-selected': {
            color: '#ff5d00',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.03)',
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            background: 'rgba(0, 255, 157, 0.1)',
            color: '#00ff9d',
            borderColor: 'rgba(0, 255, 157, 0.2)',
          },
          '&.MuiChip-colorWarning': {
            background: 'rgba(255, 183, 0, 0.1)',
            color: '#ffb700',
            borderColor: 'rgba(255, 183, 0, 0.2)',
          },
          '&.MuiChip-colorError': {
            background: 'rgba(255, 51, 51, 0.1)',
            color: '#ff3333',
            borderColor: 'rgba(255, 51, 51, 0.2)',
          },
        },
      },
    },
  },
})

export default darkTheme
