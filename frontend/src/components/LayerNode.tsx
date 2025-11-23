import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
import { Delete, Settings } from '@mui/icons-material'

export interface LayerNodeData {
  label: string
  type: string
  config: Record<string, any>
  isBlock?: boolean
  layerNames?: string[]
  numInputs?: number
  onDelete?: (id: string) => void
  onConfigure?: (id: string) => void
}

const LayerNode: React.FC<NodeProps<LayerNodeData>> = ({ data, id, selected }) => {
  const getLayerColor = (type: string) => {
    const colors: Record<string, string> = {
      Conv2d: '#4CAF50',
      Dense: '#2196F3',
      MaxPool2d: '#FF9800',
      AvgPool2d: '#FFC107',
      BatchNorm2d: '#9C27B0',
      ReLU: '#F44336',
      Sigmoid: '#E91E63',
      Tanh: '#00BCD4',
      Dropout: '#795548',
      Flatten: '#607D8B',
      AdaptiveAvgPool2d: '#8BC34A',
      Softmax: '#00897B',
      LogSoftmax: '#00695C',
      LeakyReLU: '#D32F2F',
      GELU: '#EF6C00',
      SELU: '#1565C0',
      ELU: '#00838F',
      PReLU: '#6A1B9A',
      Softplus: '#455A64',
      ConvBNReLU: '#388E3C',
      ConvBNLeakyReLU: '#00695C',
      ResidualBlock: '#004D73',
    }
    return colors[type] || '#999'
  }

  const getLayerIcon = (type: string) => {
    const icons: Record<string, string> = {
      Conv2d: '🔲',
      Dense: '◼',
      MaxPool2d: '▼',
      AvgPool2d: '▼',
      BatchNorm2d: '⚙',
      ReLU: '∧',
      Sigmoid: 'S',
      Tanh: 'T',
      Dropout: 'D',
      Flatten: '━',
      AdaptiveAvgPool2d: '▼',
      Softmax: 'SM',
      LogSoftmax: 'LS',
      LeakyReLU: '∧∨',
      GELU: 'G',
      SELU: 'SE',
      ELU: 'E',
      PReLU: 'P',
      Softplus: 'SP',
      ConvBNReLU: '█',
      ConvBNLeakyReLU: '█∨',
      ResidualBlock: '⊕',
    }
    return icons[type] || '●'
  }

  const isBlockType = data.isBlock || false
  const numInputs = data.numInputs || 1
  const inputHandles = Array.from({ length: numInputs }, (_, i) => i)

  return (
    <div>
      {/* Multiple Input Handles on Left */}
      {inputHandles.map((inputIndex) => {
        const topOffset = numInputs === 1 ? 50 : ((inputIndex + 1) / (numInputs + 1)) * 100
        return (
          <React.Fragment key={`input-${inputIndex}`}>
            <Handle 
              type="target" 
              position={Position.Left}
              id={`input-${inputIndex}`}
              style={{ 
                background: '#4CAF50', 
                width: '8px', 
                height: '8px', 
                top: `${topOffset}%`,
                transform: 'translateY(-50%)',
              }}
            />
            
            {/* Input Label */}
            {numInputs > 1 && (
              <Box 
                sx={{
                  position: 'absolute',
                  left: '-40px',
                  top: `${topOffset}%`,
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  color: '#666',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
              >
                in{inputIndex + 1}
              </Box>
            )}
          </React.Fragment>
        )
      })}

      {/* Main Node */}
      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          backgroundColor: getLayerColor(data.type),
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          minWidth: isBlockType ? '160px' : '120px',
          maxWidth: '160px',
          textAlign: 'center',
          border: selected ? '3px solid #FFD700' : 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
          <Typography variant="h6" sx={{ mr: 0.5, fontSize: '16px' }}>
            {getLayerIcon(data.type)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '12px' }}>
            {data.type}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 0.5,
          }}
        >
          {data.label}
        </Typography>

        {/* Show sub-layers for blocks */}
        {isBlockType && data.layerNames && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              display: 'block',
              mb: 0.5,
              opacity: 0.9,
              borderTop: '1px solid rgba(255,255,255,0.3)',
              pt: 0.5,
              mt: 0.5,
            }}
          >
            {data.layerNames.join(' → ')}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {data.onConfigure && (
            <Tooltip title="Configure">
              <IconButton
                size="small"
                onClick={() => data.onConfigure?.(id)}
                sx={{
                  color: 'white',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Settings sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
          )}
          {data.onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => data.onDelete?.(id)}
                sx={{
                  color: 'white',
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Delete sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Output Handle on Right */}
      <Handle 
        type="source" 
        position={Position.Right}
        id="output"
        style={{ background: '#FF5722', width: '8px', height: '8px', top: '50%' }}
      />
      
      {/* Output Label */}
      <Box 
        sx={{
          position: 'absolute',
          right: '-35px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '11px',
          color: '#666',
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
        }}
      >
        out
      </Box>
    </div>
  )
}

export default LayerNode
