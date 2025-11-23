import React from 'react'
import { Box, Paper, Typography, Chip, Divider } from '@mui/material'
import { layers as layerTypes } from '../utils/layerTypes'

interface LayerPaletteProps {
  onDragStart: (e: React.DragEvent, layerType: string) => void
}

const LayerPalette: React.FC<LayerPaletteProps> = ({ onDragStart }) => {
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
      sx={{
        padding: 2,
        backgroundColor: '#f5f5f5',
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid #ddd',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Layer Palette
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#666' }}>
        Drag layers to the canvas to add them to your model
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Multi-Input Info */}
      <Box sx={{ p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1, mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
          🔀 Hybrid Architectures
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: '#1565C0' }}>
          Any layer can accept multiple inputs! Configure in the layer settings to create advanced models like:
          <br />• Inception modules
          <br />• ResNets with skip connections
          <br />• Multi-branch architectures
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {Object.entries(categories).map(([category, layerNames]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
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
                    '&:active': {
                      cursor: 'grabbing',
                    },
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transform: 'scale(1.05)',
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
