import React, { useEffect, useRef } from 'react'
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Grid } from '@mui/material'
import { LayerOutput } from '../api/inference'

interface FeatureMapVisualizerProps {
  layerOutputs: LayerOutput[]
  selectedIndex: number
  onSelectLayer: (index: number) => void
}

const FeatureMapVisualizer: React.FC<FeatureMapVisualizerProps> = ({
  layerOutputs,
  selectedIndex,
  onSelectLayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (selectedIndex < layerOutputs.length) {
      drawFeatureMap(layerOutputs[selectedIndex])
    }
  }, [selectedIndex, layerOutputs])

  const drawFeatureMap = (layerOutput: LayerOutput) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 256
    const height = 256
    canvas.width = width
    canvas.height = height

    // Get activation stats for normalization
    const { min, max } = layerOutput.activation_stats
    const range = (max - min) || 1

    // Create image data
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Map layer outputs to heatmap
    const values = layerOutput.output_data
    // Sample values proportionally across pixels so we don't clamp many pixels
    // to the last value when values.length < width*height.
    const totalPixels = width * height

    for (let i = 0; i < totalPixels; i++) {
      const ratio = i / totalPixels
      const valueIndex = Math.min(Math.floor(ratio * values.length), values.length - 1)
      let value = values[valueIndex]

      // Guard against invalid numeric values
      if (!isFinite(value) || Number.isNaN(value)) {
        value = min
      }

      // Normalize to [0, 1]
      let normalized = (value - min) / range
      // Clamp to safe bounds
      if (!isFinite(normalized) || Number.isNaN(normalized)) normalized = 0
      if (normalized < 0) normalized = 0
      if (normalized > 1) normalized = 1

      // Create hot color map (blue -> green -> yellow -> red)
      let r, g, b
      if (normalized < 0.25) {
        // Blue to Cyan
        r = 0
        g = Math.floor((normalized / 0.25) * 255)
        b = 255
      } else if (normalized < 0.5) {
        // Cyan to Green
        r = 0
        g = 255
        b = Math.floor(255 * (1 - (normalized - 0.25) / 0.25))
      } else if (normalized < 0.75) {
        // Green to Yellow
        r = Math.floor(((normalized - 0.5) / 0.25) * 255)
        g = 255
        b = 0
      } else {
        // Yellow to Red
        r = 255
        g = Math.floor(255 * (1 - (normalized - 0.75) / 0.25))
        b = 0
      }

      const pixelIndex = i * 4
      data[pixelIndex] = r // Red
      data[pixelIndex + 1] = g // Green
      data[pixelIndex + 2] = b // Blue
      data[pixelIndex + 3] = 255 // Alpha
    }

    ctx.putImageData(imageData, 0, 0)
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Layer</InputLabel>
        <Select
          value={selectedIndex}
          onChange={(e) => onSelectLayer(e.target.value as number)}
          label="Select Layer"
        >
          {layerOutputs.map((layer, idx) => (
            <MenuItem key={idx} value={idx}>
              {layer.layer_name} ({layer.layer_type})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedIndex < layerOutputs.length && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Layer Information
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Layer Name
                  </Typography>
                  <Typography variant="body2">
                    {layerOutputs[selectedIndex]?.layer_name}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Output Shape
                  </Typography>
                  <Typography variant="body2">
                    {layerOutputs[selectedIndex]?.output_shape.join(' × ')}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Activation Statistics
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Min:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {layerOutputs[selectedIndex]?.activation_stats.min.toFixed(4)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Max:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {layerOutputs[selectedIndex]?.activation_stats.max.toFixed(4)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Mean:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {layerOutputs[selectedIndex]?.activation_stats.mean.toFixed(4)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Std Dev:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {layerOutputs[selectedIndex]?.activation_stats.std.toFixed(4)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Median:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {layerOutputs[selectedIndex]?.activation_stats.median.toFixed(4)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Color Scale Legend */}
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Color Scale
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    height: 20,
                    background:
                      'linear-gradient(to right, blue, cyan, green, yellow, red)',
                    borderRadius: 1,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption">Low</Typography>
                  <Typography variant="caption">High</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default FeatureMapVisualizer
