import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material'
import { PlayArrow, Pause, NavigateNext, NavigateBefore } from '@mui/icons-material'
import { LayerOutput } from '../api/inference'

interface LayerProcessingVisualizerProps {
  layerOutputs: LayerOutput[]
  inputImage?: string
}

const LayerProcessingVisualizer: React.FC<LayerProcessingVisualizerProps> = ({
  layerOutputs,
  inputImage,
}) => {
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000) // milliseconds per layer
  const [zoomLevel, setZoomLevel] = useState(1) // 1x to 8x zoom

  // Get current layer
  const currentLayer = layerOutputs[currentLayerIndex]

  // Auto-play effect
  React.useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      setCurrentLayerIndex((prev) =>
        prev < layerOutputs.length - 1 ? prev + 1 : 0
      )
    }, speed)

    return () => clearTimeout(timer)
  }, [isPlaying, currentLayerIndex, layerOutputs.length, speed])

  // Generate feature map visualization
  const generateFeatureMapImage = (
    layer: LayerOutput,
    maxWidth: number = 300,
    zoom: number = 1
  ): string => {
    const outputShape = layer.output_shape
    if (outputShape.length < 2) return ''

    // For convolutional layers: [batch, channels, height, width]
    // For fully connected: [batch, features]
    let height = outputShape[outputShape.length - 2] || 1
    let width = outputShape[outputShape.length - 1] || 1

    // Ensure minimum dimensions
    height = Math.max(1, height)
    width = Math.max(1, width)

    // Apply zoom to maxWidth
    const zoomedMaxWidth = maxWidth * zoom

    // Limit visualization size with minimum bounds
    const scale = Math.min(zoomedMaxWidth / Math.max(width, height), 2 * zoom)
    const displayWidth = Math.max(1, Math.floor(width * scale))
    const displayHeight = Math.max(1, Math.floor(height * scale))

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = displayWidth
    canvas.height = displayHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Get output data and normalize
    const data = layer.output_data
    if (data.length === 0) {
      ctx.fillStyle = '#cccccc'
      ctx.fillRect(0, 0, displayWidth, displayHeight)
      return canvas.toDataURL()
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Simple heatmap visualization
    const imageData = ctx.createImageData(displayWidth, displayHeight)
    const pixelData = imageData.data

    for (let i = 0; i < displayWidth * displayHeight; i++) {
      const value = (data[i % data.length] - min) / range
      const hue = value * 240 // Blue to Red
      const rgb = hslToRgb(hue, 100, 50)

      pixelData[i * 4 + 0] = rgb.r
      pixelData[i * 4 + 1] = rgb.g
      pixelData[i * 4 + 2] = rgb.b
      pixelData[i * 4 + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL()
  }

  // HSL to RGB conversion
  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): { r: number; g: number; b: number } => {
    s = s / 100
    l = l / 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0,
      g = 0,
      b = 0

    if (h >= 0 && h < 60) {
      r = c
      g = x
      b = 0
    } else if (h >= 60 && h < 120) {
      r = x
      g = c
      b = 0
    } else if (h >= 120 && h < 180) {
      r = 0
      g = c
      b = x
    } else if (h >= 180 && h < 240) {
      r = 0
      g = x
      b = c
    } else if (h >= 240 && h < 300) {
      r = x
      g = 0
      b = c
    } else if (h >= 300 && h < 360) {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  const featureMapImage = currentLayer
    ? generateFeatureMapImage(currentLayer, 300, zoomLevel)
    : ''

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main visualization area - Full width */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Large layer visualization */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Layer Processing Visualization
              </Typography>

              {/* Layer title and info */}
              {currentLayer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {currentLayer.layer_name} ({currentLayer.layer_type})
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Output Shape: {currentLayer.output_shape.join(' × ')}
                  </Typography>
                </Box>
              )}

              {/* Zoom Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Zoom: {zoomLevel.toFixed(1)}x
                </Typography>
                <Slider
                  value={zoomLevel}
                  onChange={(_, newValue) => setZoomLevel(newValue as number)}
                  min={1}
                  max={8}
                  step={0.5}
                  sx={{ flex: 1, maxWidth: 300 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setZoomLevel(1)}
                >
                  Reset
                </Button>
              </Box>

              {/* Large visualization canvas */}
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  padding: 2,
                  textAlign: 'center',
                  minHeight: 500,
                  maxHeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  position: 'relative',
                  overflow: 'auto',
                }}
              >
                {featureMapImage ? (
                  <Box
                    component="img"
                    src={featureMapImage}
                    sx={{
                      borderRadius: 1,
                      border: '2px solid #2196F3',
                      imageRendering: 'pixelated',
                      width: zoomLevel >= 3 ? '100%' : 'auto',
                      height: zoomLevel >= 3 ? 'auto' : '480px',
                    }}
                  />
                ) : (
                  <Typography color="textSecondary">
                    No visualization available for this layer
                  </Typography>
                )}
              </Box>

              {/* Statistics */}
              {currentLayer && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Activation Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">
                          Min Value
                        </Typography>
                        <Typography variant="h6">
                          {currentLayer.activation_stats.min.toFixed(4)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">
                          Max Value
                        </Typography>
                        <Typography variant="h6">
                          {currentLayer.activation_stats.max.toFixed(4)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">
                          Mean
                        </Typography>
                        <Typography variant="h6">
                          {currentLayer.activation_stats.mean.toFixed(4)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary">
                          Std Dev
                        </Typography>
                        <Typography variant="h6">
                          {currentLayer.activation_stats.std.toFixed(4)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Side panel with input image and layer list */}
        <Grid item xs={12} md={3}>
          {/* Input image with kernel overlay */}
          {inputImage && currentLayerIndex === 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Input Image
                </Typography>
                <Box
                  component="img"
                  src={inputImage}
                  sx={{
                    width: '100%',
                    maxHeight: 250,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '2px solid #FF9800',
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Original input image for the model
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Layer path */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Layer Pipeline ({layerOutputs.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, maxHeight: 400, overflowY: 'auto' }}>
                {layerOutputs.map((layer, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentLayerIndex(idx)}
                    sx={{
                      p: 1.2,
                      backgroundColor:
                        idx === currentLayerIndex ? '#2196F3' : '#f5f5f5',
                      color: idx === currentLayerIndex ? 'white' : 'inherit',
                      border:
                        idx === currentLayerIndex
                          ? '2px solid #1565C0'
                          : '1px solid #ddd',
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: idx === currentLayerIndex ? '#1976D2' : '#e3f2fd',
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {idx + 1}. {layer.layer_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontSize: '0.75rem', opacity: 0.8 }}
                    >
                      {layer.layer_type}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                    >
                      {layer.output_shape.join(' × ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Playback controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCurrentLayerIndex(Math.max(0, currentLayerIndex - 1))}
            disabled={currentLayerIndex === 0}
            startIcon={<NavigateBefore />}
          >
            Previous
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => setIsPlaying(!isPlaying)}
            startIcon={isPlaying ? <Pause /> : <PlayArrow />}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              setCurrentLayerIndex(
                Math.min(layerOutputs.length - 1, currentLayerIndex + 1)
              )
            }
            disabled={currentLayerIndex === layerOutputs.length - 1}
            startIcon={<NavigateNext />}
          >
            Next
          </Button>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Layer {currentLayerIndex + 1} of {layerOutputs.length}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((currentLayerIndex + 1) / layerOutputs.length) * 100}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
            Speed: {(2000 / speed).toFixed(1)}x
          </Typography>
          <Slider
            value={speed}
            onChange={(_, newValue) => setSpeed(newValue as number)}
            min={200}
            max={2000}
            step={100}
            sx={{ maxWidth: 200 }}
          />
        </Box>
      </Paper>

      {/* Detailed layer information table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Layers Summary
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>#</TableCell>
                  <TableCell>Layer Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Output Shape</TableCell>
                  <TableCell align="right">Min</TableCell>
                  <TableCell align="right">Max</TableCell>
                  <TableCell align="right">Mean</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {layerOutputs.map((layer, idx) => (
                  <TableRow
                    key={idx}
                    onClick={() => setCurrentLayerIndex(idx)}
                    sx={{
                      backgroundColor:
                        idx === currentLayerIndex
                          ? 'rgba(33, 150, 243, 0.1)'
                          : 'inherit',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.05)',
                      },
                    }}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{layer.layer_name}</TableCell>
                    <TableCell>{layer.layer_type}</TableCell>
                    <TableCell>{layer.output_shape.join(' × ')}</TableCell>
                    <TableCell align="right">
                      {layer.activation_stats.min.toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {layer.activation_stats.max.toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {layer.activation_stats.mean.toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LayerProcessingVisualizer
