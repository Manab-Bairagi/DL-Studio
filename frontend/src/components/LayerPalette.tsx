import React, { useState } from 'react'
import { Box, Paper, Typography, Chip, Divider, Collapse, IconButton } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { layers as layerTypes } from '../utils/layerTypes'

interface LayerPaletteProps {
  onDragStart: (e: React.DragEvent, layerType: string) => void
}

const LayerPalette: React.FC<LayerPaletteProps> = ({ onDragStart }) => {
  const [infoExpanded, setInfoExpanded] = useState(false)
  
  const categories = {
    'Convolutional': ['Conv2d'],
    'Pooling': ['MaxPool2d', 'AvgPool2d', 'AdaptiveAvgPool2d'],
    'Normalization': ['BatchNorm2d'],
    'Activation': ['ReLU', 'LeakyReLU', 'Sigmoid', 'Tanh', 'GELU', 'Softmax', 'ELU', 'SELU', 'PReLU', 'Softplus', 'LogSoftmax'],
    'Fully Connected': ['Dense', 'Linear'],
    'Regularization': ['Dropout'],
    'Reshaping': ['Flatten'],
    'Block Templates': ['ConvBNReLU', 'ConvBNLeakyReLU', 'ResidualBlock'],
  }

  const getLayerColor = (type: string) => {
    const colors: Record<string, string> = {
      Conv2d: '#4CAF50',
      Dense: '#2196F3',
      Linear: '#2196F3',
      MaxPool2d: '#FF9800',
      AvgPool2d: '#FFC107',
      BatchNorm2d: '#9C27B0',
      ReLU: '#F44336',
      Sigmoid: '#E91E63',
      Tanh: '#00BCD4',
      Dropout: '#795548',
      Flatten: '#607D8B',
      AdaptiveAvgPool2d: '#8BC34A',
    }
    return colors[type] || '#999'
  }

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 2,
        backgroundColor: 'transparent',
        height: '100%',
        overflowY: 'auto',
        color: '#fff',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1a1a1a',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#333',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#444',
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
        Layer Palette
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: '#9ca3af' }}>
        Drag layers to the canvas
      </Typography>
      <Divider sx={{ mb: 1.5, borderColor: '#333' }} />

      {/* Collapsible Multi-Input Info */}
      <Box sx={{ mb: 1.5 }}>
        <Box 
          onClick={() => setInfoExpanded(!infoExpanded)}
          sx={{ 
            p: 1, 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: 1, 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' }
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '0.75rem' }}>
            🔀 Hybrid Architectures
          </Typography>
          <IconButton size="small" sx={{ color: '#60a5fa', p: 0 }}>
            {infoExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        <Collapse in={infoExpanded}>
          <Box sx={{ p: 1, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '0 0 4px 4px' }}>
            <Typography variant="caption" sx={{ display: 'block', color: '#93c5fd', fontSize: '0.7rem', lineHeight: 1.4 }}>
              Any layer can accept multiple inputs! Configure in layer settings to create:
              <br />• Inception modules
              <br />• ResNets with skip connections
              <br />• Multi-branch architectures
            </Typography>
          </Box>
        </Collapse>
      </Box>
      <Divider sx={{ mb: 1.5, borderColor: '#333' }} />

      {Object.entries(categories).map(([category, layerNames]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#e5e7eb' }}>
            {category}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {layerNames.map((layerType) => {
              const layerConfig = layerTypes[layerType as keyof typeof layerTypes]
              return (
                <Chip
                  key={layerType}
                  label={layerType}
                  onDragStart={(e) => onDragStart(e as any, layerType)}
                  draggable
                  sx={{
                    backgroundColor: getLayerColor(layerType),
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'grab',
                    justifyContent: 'flex-start',
                    pl: 1,
                    '&:active': {
                      cursor: 'grabbing',
                    },
                    '&:hover': {
                      boxShadow: '0 0 10px rgba(255,255,255,0.2)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                  title={`${layerConfig.description}`}
                />
              )
            })}
          </Box>
        </Box>
      ))}
    </Paper>
  )
}

export default LayerPalette
