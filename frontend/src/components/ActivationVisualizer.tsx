import React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Grid,
} from '@mui/material'
import { LayerOutput } from '../api/inference'

interface ActivationVisualizerProps {
  layerOutputs: LayerOutput[]
}

const ActivationVisualizer: React.FC<ActivationVisualizerProps> = ({ layerOutputs }) => {
  // Find global min/max for normalization
  const globalMin = Math.min(...layerOutputs.map((l) => l.activation_stats.min))
  const globalMax = Math.max(...layerOutputs.map((l) => l.activation_stats.max))
  const globalRange = globalMax - globalMin || 1

  const getActivationColor = (mean: number) => {
    // Normalize mean to [0, 1]
    const normalized = (mean - globalMin) / globalRange

    if (normalized < 0.33) return '#ff6b6b' // Red for low activation
    if (normalized < 0.66) return '#ffd93d' // Yellow for medium
    return '#6bcf7f' // Green for high
  }

  const getActivationBarColor = (value: number) => {
    // Heatmap color
    const normalized = (value - globalMin) / globalRange
    let r, g, b

    if (normalized < 0.25) {
      r = 0
      g = Math.floor((normalized / 0.25) * 255)
      b = 255
    } else if (normalized < 0.5) {
      r = 0
      g = 255
      b = Math.floor(255 * (1 - (normalized - 0.25) / 0.25))
    } else if (normalized < 0.75) {
      r = Math.floor(((normalized - 0.5) / 0.25) * 255)
      g = 255
      b = 0
    } else {
      r = 255
      g = Math.floor(255 * (1 - (normalized - 0.75) / 0.25))
      b = 0
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" gutterBottom>
              Global Activation Statistics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Global Min
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {globalMin.toFixed(4)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Global Max
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {globalMax.toFixed(4)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Range
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {globalRange.toFixed(4)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Total Layers
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {layerOutputs.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Layer Activation Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Layer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Min</TableCell>
                  <TableCell align="right">Max</TableCell>
                  <TableCell align="right">Mean</TableCell>
                  <TableCell align="right">Std</TableCell>
                  <TableCell>Activation Bar</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {layerOutputs.map((layer, idx) => {
                  const stats = layer.activation_stats
                  const normMean = (stats.mean - globalMin) / globalRange
                  const color = getActivationColor(stats.mean)

                  // Check for dead neurons (all zeros or very low activation)
                  const isDead = stats.mean < 0.01 && stats.std < 0.01
                  const isSaturated = stats.min > 0.9 || stats.max < 0.1

                  return (
                    <TableRow
                      key={idx}
                      sx={{
                        backgroundColor: isDead ? '#ffebee' : isSaturated ? '#fff3e0' : 'transparent',
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {layer.layer_name}
                      </TableCell>
                      <TableCell>{layer.layer_type}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {stats.min.toFixed(4)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {stats.max.toFixed(4)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color }}>
                        <strong>{stats.mean.toFixed(4)}</strong>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {stats.std.toFixed(4)}
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={normMean * 100}
                            sx={{
                              flex: 1,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getActivationBarColor(stats.mean),
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {isDead ? (
                          <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                            ⚠ Dead
                          </Typography>
                        ) : isSaturated ? (
                          <Typography variant="caption" sx={{ color: '#f57c00' }}>
                            ⚠ Saturated
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#388e3c' }}>
                            ✓ Normal
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Legend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" gutterBottom>
              Status Indicators
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#388e3c', borderRadius: '50%' }} />
                <Typography variant="caption">Normal - Neurons firing with healthy activation</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#f57c00', borderRadius: '50%' }} />
                <Typography variant="caption">Saturated - Activation values stuck at extremes</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#d32f2f', borderRadius: '50%' }} />
                <Typography variant="caption">Dead - Neurons with near-zero activation</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ActivationVisualizer
