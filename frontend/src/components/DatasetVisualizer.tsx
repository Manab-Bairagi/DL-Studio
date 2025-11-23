import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DatasetStats {
  totalSamples: number
  imageSize: [number, number]
  channels: number
  classDistribution: Record<string, number>
  meanPixelValue: number
  stdPixelValue: number
  minPixelValue: number
  maxPixelValue: number
  noiseLevel?: 'none' | 'low' | 'medium' | 'high'
  augmentation?: boolean
}

interface DatasetVisualizerProps {
  onDatasetLoad?: (stats: DatasetStats) => void
}

const DatasetVisualizer: React.FC<DatasetVisualizerProps> = ({ onDatasetLoad }) => {
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [numSamples, setNumSamples] = useState(1000)
  const [imageWidth, setImageWidth] = useState(224)
  const [imageHeight, setImageHeight] = useState(224)
  const [channels] = useState(3)
  const [numClasses, setNumClasses] = useState(10)
  const [noiseLevel, setNoiseLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none')
  const [augmentation, setAugmentation] = useState(false)

  const handleGenerateDataset = async () => {
    setError('')
    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const classDistribution: Record<string, number> = {}
      const samplesPerClass = Math.floor(numSamples / numClasses)
      const remainder = numSamples % numClasses

      for (let i = 0; i < numClasses; i++) {
        const className = `Class ${i}`
        classDistribution[className] = samplesPerClass + (i < remainder ? 1 : 0)
      }

      const meanPixelValue = 127.5 + (Math.random() - 0.5) * 20
      const stdPixelValue = 50 + (Math.random() - 0.5) * 10
      const minPixelValue = meanPixelValue - stdPixelValue * 3
      const maxPixelValue = Math.min(255, meanPixelValue + stdPixelValue * 3)

      const stats: DatasetStats = {
        totalSamples: numSamples,
        imageSize: [imageWidth, imageHeight],
        channels,
        classDistribution,
        meanPixelValue: Math.round(meanPixelValue),
        stdPixelValue: Math.round(stdPixelValue),
        minPixelValue: Math.max(0, Math.round(minPixelValue)),
        maxPixelValue: Math.min(255, Math.round(maxPixelValue)),
        noiseLevel,
        augmentation,
      }

      setDatasetStats(stats)
      if (onDatasetLoad) {
        onDatasetLoad(stats)
      }
    } catch (err: any) {
      setError('Failed to analyze dataset')
    } finally {
      setLoading(false)
    }
  }

  const classDistributionData = datasetStats
    ? Object.entries(datasetStats.classDistribution).map(([name, count]) => ({
        name,
        samples: count,
      }))
    : []

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Dataset Visualization
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            Configure and generate synthetic datasets with noise and augmentation
          </Typography>

          {!datasetStats && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Samples"
                    value={numSamples}
                    onChange={(e) => setNumSamples(Math.max(1, parseInt(e.target.value) || 1))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Image Width"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Image Height"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Num Classes"
                    value={numClasses}
                    onChange={(e) => setNumClasses(Math.max(1, parseInt(e.target.value) || 1))}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    select
                    fullWidth
                    label="Noise Level"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(e.target.value as any)}
                    size="small"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Data Augmentation"
                    value={augmentation ? 'yes' : 'no'}
                    onChange={(e) => setAugmentation(e.target.value === 'yes')}
                    size="small"
                  >
                    <MenuItem value="no">No Augmentation</MenuItem>
                    <MenuItem value="yes">With Augmentation (Rotation, Flip, Scale)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={handleGenerateDataset} disabled={loading}>
                  {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Generate Dataset Stats'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Alert severity="info">
                💡 Generate synthetic dataset with configurable noise and augmentation options
              </Alert>
            </>
          )}

          {datasetStats && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, backgroundColor: '#E3F2FD' }}>
                    <Typography variant="caption" color="textSecondary">
                      Total Samples
                    </Typography>
                    <Typography variant="h6">{datasetStats.totalSamples.toLocaleString()}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, backgroundColor: '#F3E5F5' }}>
                    <Typography variant="caption" color="textSecondary">
                      Image Size
                    </Typography>
                    <Typography variant="h6">{datasetStats.imageSize.join('x')}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, backgroundColor: '#E8F5E9' }}>
                    <Typography variant="caption" color="textSecondary">
                      Noise Level
                    </Typography>
                    <Typography variant="h6">{datasetStats.noiseLevel || 'None'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
                    <Typography variant="caption" color="textSecondary">
                      Augmentation
                    </Typography>
                    <Typography variant="h6">{datasetStats.augmentation ? 'Yes' : 'No'}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Class Distribution
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="samples" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                ✅ Dataset generated! This synthetic data will be used in the Training Simulator (Tab 3) to evaluate your model's performance.
              </Alert>

              <Button variant="outlined" onClick={() => setDatasetStats(null)}>
                Generate New Dataset
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default DatasetVisualizer
