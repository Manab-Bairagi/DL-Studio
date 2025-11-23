import React from 'react'
import { Box, Button, Typography, Alert, SxProps, Theme } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'
import { keyframes } from '@mui/material/styles'

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  fullScreen?: boolean
  sx?: SxProps<Theme>
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Oops! Something went wrong',
  message = 'An error occurred. Please try again.',
  error,
  onRetry,
  action,
  fullScreen = false,
  sx,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: fullScreen ? 0 : 3,
        minHeight: fullScreen ? '100vh' : 'auto',
        width: '100%',
        background: fullScreen
          ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%)'
          : 'transparent',
        animation: `${slideUp} 0.4s ease`,
        ...sx,
      }}
    >
      <Box
        sx={{
          fontSize: '3rem',
          color: '#ef4444',
          animation: `${shake} 0.5s ease`,
          mb: 1,
        }}
      >
        <ErrorOutline sx={{ fontSize: '3rem' }} />
      </Box>

      <Typography 
        variant="h5" 
        sx={{
          color: '#ffffff',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>

      <Typography 
        variant="body1" 
        sx={{
          color: '#e0e0e0',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        {message}
      </Typography>

      {errorMessage && (
        <Alert 
          severity="error"
          sx={{
            maxWidth: '400px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRetry}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(59, 130, 246, 0.6)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Try Again
          </Button>
        )}

        {action && (
          <Button
            variant="outlined"
            onClick={action.onClick}
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default ErrorState
