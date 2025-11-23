import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Info } from '@mui/icons-material'
import { Node } from 'reactflow'

interface LayerStats {
  name: string
  type: string
  output_shape: number[]
  params: Record<string, any>
  connections: {
    input: number | null
    output: number | null
  }
  paramCount: number
  memoryEstimate: string
}

interface ModelAnalysisProps {
  nodes: Node[]
  modelName: string
}

const ModelAnalysis: React.FC<ModelAnalysisProps> = ({ nodes }) => {
  const calculateLayerStats = (): LayerStats[] => {
    return nodes.map((node, idx) => {
      const config = node.data?.config || {}
      const paramCount = calculateParamCount(node.data?.type, config)
      const memoryEstimate = estimateMemory(paramCount)

      return {
        name: node.data?.label || `Layer ${idx + 1}`,
        type: node.data?.type || 'Unknown',
        output_shape: config.output_shape || [],
        params: config,
        connections: {
          input: idx > 0 ? idx - 1 : null,
          output: idx < nodes.length - 1 ? idx + 1 : null,
        },
        paramCount,
        memoryEstimate,
      }
    })
  }

  const calculateParamCount = (layerType: string, config: Record<string, any>): number => {
    switch (layerType) {
      case 'Conv2d': {
        // Conv2d params: input_channels * output_channels * kernel_height * kernel_width + bias
        const inCh = config.in_channels ?? 3
        const outCh = config.out_channels ?? 64
        let kernel = config.kernel_size ?? 3
        
        // Handle kernel_size as array [h, w]
        if (Array.isArray(kernel)) {
          kernel = kernel[0] * kernel[1]
        } else {
          kernel = kernel * kernel
        }
        
        const weightsParams = inCh * outCh * kernel
        const biasParams = outCh
        return weightsParams + biasParams
      }
      case 'Dense':
      case 'Linear': {
        // Linear params: input_features * output_features + bias
        const inFeatures = config.in_features ?? 128
        const outFeatures = config.out_features ?? 64
        const weightsParams = inFeatures * outFeatures
        const biasParams = outFeatures
        return weightsParams + biasParams
      }
      case 'BatchNorm2d':
      case 'BatchNorm1d': {
        // BatchNorm params: 2 * num_features (weight + bias, no running mean/var in param count)
        const features = config.num_features ?? 64
        return 2 * features
      }
      case 'Embedding': {
        // Embedding params: num_embeddings * embedding_dim
        const numEmbeddings = config.num_embeddings ?? 1000
        const embeddingDim = config.embedding_dim ?? 64
        return numEmbeddings * embeddingDim
      }
      case 'RNN':
      case 'LSTM':
      case 'GRU': {
        // RNN layers: more complex, approximate based on hidden_size
        const inputSize = config.input_size ?? 128
        const hiddenSize = config.hidden_size ?? 256
        const numLayers = config.num_layers ?? 1
        // LSTM/GRU have ~4x weights per layer, RNN has ~3x
        const multiplier = layerType === 'LSTM' ? 4 : layerType === 'GRU' ? 3 : 3
        const paramsPerLayer = (inputSize + hiddenSize + 1) * hiddenSize * multiplier
        return paramsPerLayer * numLayers
      }
      default:
        return 0
    }
  }

  const estimateMemory = (paramCount: number): string => {
    // 32-bit float = 4 bytes per parameter
    const bytes = paramCount * 4
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
  }

  const calculateActivationMemory = (): string => {
    // Estimate activation memory during forward pass
    let maxActivationBytes = 0
    
    nodes.forEach((node) => {
      const config = node.data?.config || {}
      const outputShape = config.output_shape || []
      
      if (outputShape.length > 0) {
        // Calculate total elements in output
        const elements = outputShape.reduce((a: number, b: number) => a * b, 1)
        // 32-bit float = 4 bytes
        const activationBytes = elements * 4
        maxActivationBytes = Math.max(maxActivationBytes, activationBytes)
      }
    })
    
    if (maxActivationBytes === 0) return 'Unknown'
    if (maxActivationBytes < 1024) return `${maxActivationBytes}B`
    if (maxActivationBytes < 1024 * 1024) return `${(maxActivationBytes / 1024).toFixed(1)}KB`
    return `${(maxActivationBytes / (1024 * 1024)).toFixed(2)}MB`
  }

  const layerStats = calculateLayerStats()
  const totalParams = layerStats.reduce((sum, stat) => sum + stat.paramCount, 0)
  const activationMemory = calculateActivationMemory()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Layers
              </Typography>
              <Typography variant="h5">{nodes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Parameters
              </Typography>
              <Typography variant="h5">
                {totalParams > 1000000
                  ? `${(totalParams / 1000000).toFixed(1)}M`
                  : totalParams > 1000
                  ? `${(totalParams / 1000).toFixed(1)}K`
                  : totalParams}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Model Size (Weights)
              </Typography>
              <Typography variant="h5">
                {estimateMemory(totalParams)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Peak Activation Mem
              </Typography>
              <Typography variant="h5" sx={{ fontSize: '1rem' }}>
                {activationMemory}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Layer Composition */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          📊 Layer Composition
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {nodes.map((node, idx) => {
            const layerType = node.data?.type || 'Unknown'
            const color = getLayerColor(layerType)
            return (
              <Tooltip key={idx} title={`${layerType} at position ${idx + 1}`}>
                <Chip
                  label={`${layerType.slice(0, 3)}${idx + 1}`}
                  size="small"
                  sx={{ backgroundColor: color, color: 'white' }}
                />
              </Tooltip>
            )
          })}
        </Box>
      </Paper>

      {/* Detailed Layer Analysis */}
      <Paper sx={{ p: 2, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          🔍 Detailed Layer Analysis
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Layer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Parameters</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Memory</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Config</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {layerStats.map((stat, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{stat.name}</TableCell>
                  <TableCell>
                    <Chip label={stat.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{stat.paramCount.toLocaleString()}</TableCell>
                  <TableCell>{stat.memoryEstimate}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {JSON.stringify(stat.params).slice(0, 100)}...
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                <TableCell colSpan={2}>
                  <strong>TOTAL</strong>
                </TableCell>
                <TableCell>
                  <strong>{totalParams.toLocaleString()}</strong>
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Design Insights */}
      <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
          <Info sx={{ mt: 0.5, color: '#1976d2' }} />
          <Typography variant="h6" sx={{ color: '#1976d2' }}>
            Design Insights & Recommendations
          </Typography>
        </Box>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          <li>
            <Typography variant="body2">
              <strong>Layer Count:</strong> {nodes.length} layers. Consider adding more convolutional layers for feature extraction if dealing with complex images.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Parameter Distribution:</strong> {totalParams > 1000000 ? 'Large' : 'Moderate'} model size. Suitable for GPU training.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Normalization:</strong> Add BatchNorm layers after Conv layers to stabilize training and improve convergence.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Regularization:</strong> Consider adding Dropout layers to prevent overfitting during training.
            </Typography>
          </li>
        </Box>
      </Paper>
    </Box>
  )
}

function getLayerColor(layerType: string): string {
  const colors: Record<string, string> = {
    Conv2d: '#FF6B6B',
    Dense: '#4ECDC4',
    Linear: '#45B7D1',
    MaxPool2d: '#FFA07A',
    AvgPool2d: '#FFB6C1',
    BatchNorm2d: '#98D8C8',
    ReLU: '#F7DC6F',
    Sigmoid: '#BB8FCE',
    Tanh: '#85C1E2',
    Dropout: '#F8B88B',
    Flatten: '#A9DFBF',
    AdaptiveAvgPool2d: '#D7BDE2',
  }
  return colors[layerType] || '#999999'
}

export default ModelAnalysis
