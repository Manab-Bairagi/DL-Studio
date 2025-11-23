import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Slider,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material'
import { Info, PlayArrow } from '@mui/icons-material'

interface LayerData {
  layer_name: string
  layer_type: string
  output_shape: number[]
  activation_stats: {
    min: number
    max: number
    mean: number
    std: number
    median: number
  }
  dead_neurons?: number
  saturated_neurons?: number
}

interface LayerVisualizationProps {
  layerOutputs: LayerData[]
  selectedLayerIndex: number
  onLayerSelect: (index: number) => void
}

const LayerVisualization: React.FC<LayerVisualizationProps> = ({
  layerOutputs,
  selectedLayerIndex,
  onLayerSelect,
}) => {
  if (layerOutputs.length === 0) {
    return (
      <Alert severity="info">
        Run inference with an image to visualize layer outputs
      </Alert>
    )
  }

  const selectedLayer = layerOutputs[selectedLayerIndex] || layerOutputs[0]
  const stats = selectedLayer.activation_stats

  const getHealthColor = (percentage: number) => {
    if (percentage > 70) return '#4caf50' // Green
    if (percentage > 50) return '#ff9800' // Orange
    return '#f44336' // Red
  }

  const deadNeuronPercentage = selectedLayer.dead_neurons || 0
  const saturatedNeuronPercentage = selectedLayer.saturated_neurons || 0
  const healthPercentage = 100 - (deadNeuronPercentage + saturatedNeuronPercentage) / 2

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Layer Selection */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
          📍 Select Layer to Analyze:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto', pb: 1 }}>
          {layerOutputs.map((layer, idx) => (
            <Chip
              key={idx}
              label={`${idx + 1}. ${layer.layer_type}`}
              onClick={() => onLayerSelect(idx)}
              color={selectedLayerIndex === idx ? 'primary' : 'default'}
              variant={selectedLayerIndex === idx ? 'filled' : 'outlined'}
              clickable
            />
          ))}
        </Box>
      </Paper>

      {/* Layer Info Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Layer Type
              </Typography>
              <Typography variant="h6">{selectedLayer.layer_type}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Output Shape
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                {JSON.stringify(selectedLayer.output_shape)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Layer Health
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ color: getHealthColor(healthPercentage) }}>
                  {Math.round(healthPercentage)}%
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={healthPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getHealthColor(healthPercentage),
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Parameters Status
              </Typography>
              <Typography variant="body2">
                💀 Dead: {deadNeuronPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2">
                🔥 Saturated: {saturatedNeuronPercentage.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activation Statistics */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          📊 Activation Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Minimum
              </Typography>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                {stats.min.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Maximum
              </Typography>
              <Typography variant="h6" sx={{ color: '#d32f2f' }}>
                {stats.max.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Mean
              </Typography>
              <Typography variant="h6" sx={{ color: '#388e3c' }}>
                {stats.mean.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Std Dev
              </Typography>
              <Typography variant="h6" sx={{ color: '#f57c00' }}>
                {stats.std.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Median
              </Typography>
              <Typography variant="h6" sx={{ color: '#7b1fa2' }}>
                {stats.median.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Analysis Tips */}
      <Paper sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Info sx={{ mt: 0.5, color: '#6a1b9a' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 'bold', mb: 1 }}>
              🎓 Learning Insights
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>
                <Typography variant="caption">
                  <strong>Activation Range:</strong> Check if activations are within reasonable bounds. Values too close to 0 or 1 indicate potential issues.
                </Typography>
              </li>
              <li>
                <Typography variant="caption">
                  <strong>Dead Neurons:</strong> {deadNeuronPercentage > 0 ? 'Found dead neurons - consider adjusting learning rate or initialization.' : 'No dead neurons detected.'}
                </Typography>
              </li>
              <li>
                <Typography variant="caption">
                  <strong>Saturation:</strong> {saturatedNeuronPercentage > 0 ? 'Neurons are saturating - this can slow down training.' : 'Neurons are not saturated.'}
                </Typography>
              </li>
              <li>
                <Typography variant="caption">
                  <strong>Standard Deviation:</strong> High variance ({stats.std.toFixed(4)}) suggests strong signal flow through this layer.
                </Typography>
              </li>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default LayerVisualization
