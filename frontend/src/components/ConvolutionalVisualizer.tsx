import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Paper,
  Grid,
  ButtonGroup,
} from '@mui/material'
import { PlayArrow, Pause } from '@mui/icons-material'
import { LayerOutput } from '../api/inference'

interface ConvolutionalVisualizerProps {
  layerOutputs: LayerOutput[]
  inputImage?: string
}

const ConvolutionalVisualizer: React.FC<ConvolutionalVisualizerProps> = ({
  layerOutputs,
  inputImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedLayer, setSelectedLayer] = useState(0)
  const [selectedChannel, setSelectedChannel] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [kernelVisualization, setKernelVisualization] = useState<string>('')

  const currentLayer = layerOutputs[selectedLayer]
  const outputShape = currentLayer?.output_shape || []

  // Filter for convolutional layers
  const convLayers = layerOutputs.filter((l) =>
    ['Conv2d', 'Conv1d', 'ConvBNReLU', 'ConvBNLeakyReLU'].includes(l.layer_type)
  )

  // Generate kernel stride visualization
  useEffect(() => {
    if (!canvasRef.current || !currentLayer) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = 500
    const height = 400
    canvas.width = width
    canvas.height = height

    // Get layer dimensions
    const [, , inputH, inputW] = outputShape.length >= 4 ? outputShape : [1, 1, 32, 32]
    const kernelSize = 3 // Typical kernel size
    const stride = 1

    // Draw input grid
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    // Calculate cell size for visualization
    const cellSize = Math.min(
      (width * 0.8) / (inputW || 32),
      (height * 0.8) / (inputH || 32)
    )

    // Draw grid background
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= Math.min(inputW || 32, 10); i++) {
      ctx.beginPath()
      ctx.moveTo(40 + i * cellSize, 40)
      ctx.lineTo(40 + i * cellSize, 40 + Math.min(inputH || 32, 10) * cellSize)
      ctx.stroke()
    }

    for (let i = 0; i <= Math.min(inputH || 32, 10); i++) {
      ctx.beginPath()
      ctx.moveTo(40, 40 + i * cellSize)
      ctx.lineTo(40 + Math.min(inputW || 32, 10) * cellSize, 40 + i * cellSize)
      ctx.stroke()
    }

    // Draw kernel position based on animation progress
    const maxKernelPositions = Math.max(
      (Math.min(inputW || 32, 10) - kernelSize) / stride + 1,
      1
    )
    const kernelPos = Math.floor(
      animationProgress * maxKernelPositions
    )
    const row = Math.floor(kernelPos / 10)
    const col = kernelPos % 10

    // Draw kernel (red box showing where convolution is happening)
    ctx.strokeStyle = '#FF5722'
    ctx.lineWidth = 2
    const kernelX = 40 + col * cellSize
    const kernelY = 40 + row * cellSize
    ctx.strokeRect(kernelX, kernelY, kernelSize * cellSize, kernelSize * cellSize)

    // Draw animated movement indicators
    ctx.fillStyle = 'rgba(255, 87, 34, 0.2)'
    ctx.fillRect(kernelX, kernelY, kernelSize * cellSize, kernelSize * cellSize)

    // Add labels
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.fillText('Input Feature Map', 50, 25)
    ctx.fillText('Kernel Position', kernelX + 10, kernelY - 5)

    // Draw output activation
    const outputStartX = width - 150
    const outputStartY = 40
    const outputCellSize = 8

    ctx.fillStyle = '#f0f0f0'
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    const outputW = Math.min((outputShape[3] as number) || 10, 15)
    const outputH = Math.min((outputShape[2] as number) || 10, 15)

    for (let i = 0; i < outputW; i++) {
      for (let j = 0; j < outputH; j++) {
        const x = outputStartX + i * outputCellSize
        const y = outputStartY + j * outputCellSize

        // Highlight the output cell corresponding to kernel position
        if (Math.floor(i) === col && Math.floor(j) === row) {
          ctx.fillStyle = '#FF5722'
        } else {
          ctx.fillStyle = '#e0e0e0'
        }

        ctx.fillRect(x, y, outputCellSize - 1, outputCellSize - 1)
        ctx.strokeRect(x, y, outputCellSize - 1, outputCellSize - 1)
      }
    }

    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.fillText('Output Activation', outputStartX - 20, outputStartY - 5)

    // Draw arrow showing data flow
    const arrowStartX = 40 + Math.min(inputW || 32, 10) * cellSize + 20
    const arrowStartY = 40 + (Math.min(inputH || 32, 10) * cellSize) / 2
    const arrowEndX = outputStartX - 10
    const arrowEndY = arrowStartY

    ctx.strokeStyle = '#2196F3'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(arrowStartX, arrowStartY)
    ctx.lineTo(arrowEndX, arrowEndY)
    ctx.stroke()

    // Arrow head
    const headlen = 15
    const angle = 0
    ctx.beginPath()
    ctx.moveTo(arrowEndX, arrowEndY)
    ctx.lineTo(arrowEndX - headlen * Math.cos(angle - Math.PI / 6), arrowEndY - headlen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(arrowEndX - headlen * Math.cos(angle + Math.PI / 6), arrowEndY - headlen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = '#2196F3'
    ctx.fill()

    ctx.fillStyle = '#666'
    ctx.font = '11px Arial'
    ctx.fillText('Convolution', arrowStartX + 10, arrowStartY - 10)
  }, [canvasRef, currentLayer, outputShape, animationProgress])

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return

    const timer = setTimeout(() => {
      setAnimationProgress((prev) => (prev >= 1 ? 0 : prev + 0.05))
    }, 100)

    return () => clearTimeout(timer)
  }, [isAnimating, animationProgress])

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* Main visualization */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Convolutional Kernel Processing
              </Typography>

              {currentLayer && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Layer: {currentLayer.layer_name} ({currentLayer.layer_type}) | Output:{' '}
                  {currentLayer.output_shape.join(' × ')}
                </Typography>
              )}

              <Box
                sx={{
                  backgroundColor: '#fafafa',
                  borderRadius: 1,
                  padding: 2,
                  border: '1px solid #ddd',
                  mb: 2,
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => setIsAnimating(!isAnimating)}
                    startIcon={isAnimating ? <Pause /> : <PlayArrow />}
                  >
                    {isAnimating ? 'Pause' : 'Play'}
                  </Button>
                  <Button onClick={() => setAnimationProgress(0)}>Reset</Button>
                </ButtonGroup>

                <Box sx={{ flex: 1 }}>
                  <Slider
                    value={animationProgress}
                    onChange={(e, val) => setAnimationProgress(val as number)}
                    min={0}
                    max={1}
                    step={0.01}
                    marks={[
                      { value: 0, label: 'Start' },
                      { value: 1, label: 'End' },
                    ]}
                  />
                </Box>
              </Box>

              {/* Description */}
              <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e3f2fd' }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>How it works:</strong> The red box shows the convolution kernel moving
                  across the input feature map. Each position processes a local region and produces
                  one value in the output (highlighted in the output grid). The kernel moves with a
                  specific stride and produces feature maps for the next layer.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Layer selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Convolutional Layers
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {convLayers.length > 0 ? (
                  convLayers.map((layer, idx) => {
                    const originalIdx = layerOutputs.indexOf(layer)
                    return (
                      <Button
                        key={idx}
                        variant={selectedLayer === originalIdx ? 'contained' : 'outlined'}
                        onClick={() => {
                          setSelectedLayer(originalIdx)
                          setAnimationProgress(0)
                        }}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          p: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {layer.layer_name}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {layer.layer_type}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {layer.output_shape.join(' × ')}
                          </Typography>
                        </Box>
                      </Button>
                    )
                  })
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No convolutional layers found
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Layer Info
              </Typography>

              {currentLayer && (
                <Box>
                  <Typography variant="caption" display="block" color="textSecondary">
                    <strong>Name:</strong> {currentLayer.layer_name}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    <strong>Type:</strong> {currentLayer.layer_type}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    <strong>Output:</strong> {currentLayer.output_shape.join(' × ')}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    <strong>Min:</strong> {currentLayer.activation_stats.min.toFixed(4)}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    <strong>Max:</strong> {currentLayer.activation_stats.max.toFixed(4)}
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary">
                    <strong>Mean:</strong> {currentLayer.activation_stats.mean.toFixed(4)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ConvolutionalVisualizer
