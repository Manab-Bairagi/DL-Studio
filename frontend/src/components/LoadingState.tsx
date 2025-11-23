import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`

interface LoadingStateProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false 
}) => {
  const sizeMap = { small: 30, medium: 50, large: 70 }

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
      }}
    >
      <CircularProgress 
        size={sizeMap[size]}
        sx={{
          color: 'url(#gradient)',
          animation: `${pulse} 2s infinite`,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography 
        variant="body1" 
        sx={{
          color: '#e0e0e0',
          animation: `${pulse} 2s infinite 0.5s`,
          fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.1rem' : '0.95rem',
        }}
      >
        {message}
      </Typography>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  )
}

export default LoadingState
