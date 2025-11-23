import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Paper,
  Grid,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import { PlayArrow, Pause, Refresh } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Node, Edge } from 'reactflow'
import apiClient from '../api/client'

interface TrainingMetrics {
  epoch: number
  trainLoss: number
  valLoss: number
  trainAcc: number
  valAcc: number
}

interface TrainingSimulatorProps {
  nodes: Node[]
  edges: Edge[]
  inputShape?: number[]
  datasetStats?: {
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
  onTrainingUpdate?: (metrics: TrainingMetrics[]) => void
}

const TrainingSimulator: React.FC<TrainingSimulatorProps> = ({ nodes, edges, datasetStats, onTrainingUpdate }) => {
  const [isTraining, setIsTraining] = useState(false)
  const [epochs, setEpochs] = useState(50)
  const [batchSize, setBatchSize] = useState(32)
  const [learningRate, setLearningRate] = useState(0.001)
  const [optimizer, setOptimizer] = useState('adam')
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [trainingSpeed, setTrainingSpeed] = useState(500) // ms per epoch

  // Simulate training
  useEffect(() => {
    if (!isTraining) return

    const startSimulation = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/optimize/simulate/train', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            architecture: { nodes, edges },
            dataset_stats: datasetStats,
            training_config: {
              epochs,
              batch_size: batchSize,
              learning_rate: learningRate,
              optimizer
            }
          })
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsTraining(false)
                break
              }
              try {
                const metric = JSON.parse(data)
                setMetrics(prev => {
                  const newMetrics = [...prev, metric]
                  if (onTrainingUpdate) {
                    onTrainingUpdate(newMetrics)
                  }
                  return newMetrics
                })
                setCurrentEpoch(metric.epoch)
              } catch (e) {
                console.error('Error parsing metric:', e)
              }
            }
          }
        }
      } catch (error) {
        console.error('Simulation failed:', error)
        setIsTraining(false)
      }
    }

    startSimulation()

    return () => {
      // Cleanup if needed
    }
  }, [isTraining, nodes, edges, datasetStats, epochs, batchSize, learningRate, optimizer])



  const handleStart = () => {
    if (currentEpoch === 0) {
      setMetrics([])
    }
    setIsTraining(true)
  }

  const handleReset = () => {
    setIsTraining(false)
    setCurrentEpoch(0)
    setMetrics([])
  }

  const estimatedTime = ((epochs - currentEpoch) * trainingSpeed) / 1000
  
  // Calculate samples per epoch
  const samplesPerEpoch = datasetStats ? datasetStats.totalSamples : 5000
  const stepsPerEpoch = Math.ceil(samplesPerEpoch / batchSize)
  const totalSteps = epochs * stepsPerEpoch
  
  const [syntheticDataInfo, setSyntheticDataInfo] = useState<any>(null)

  useEffect(() => {
    const fetchSyntheticDataInfo = async () => {
      if (!datasetStats) return

      try {
        const response = await apiClient.post('/optimize/simulate/batch', {
          architecture: { nodes, edges },
          dataset_stats: datasetStats,
          training_config: {
            epochs,
            batch_size: batchSize,
            learning_rate: learningRate,
            optimizer
          }
        })
        setSyntheticDataInfo(response.data)
      } catch (error) {
        console.error('Failed to fetch synthetic data info:', error)
      }
    }

    fetchSyntheticDataInfo()
  }, [datasetStats, batchSize, nodes.length, edges.length])

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚡ Training Simulator
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            Simulate training without actual data to estimate convergence and test architectures
          </Typography>

          {/* Dataset Info */}
          {datasetStats ? (
            <Card sx={{ mb: 3, backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#0369a1' }}>
                  ✅ Dataset Loaded: {datasetStats.totalSamples.toLocaleString()} samples
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">Image Size:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{datasetStats.imageSize.join('×')}px</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">Channels:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{datasetStats.channels}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">Noise Level:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{datasetStats.noiseLevel || 'None'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="textSecondary">Augmentation:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{datasetStats.augmentation ? '✓ Yes' : '✗ No'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning" sx={{ mb: 3 }}>
              ⚠️ <strong>No dataset attached.</strong> Generate a dataset in Tab 1 (Dataset Visualizer) to use real-world statistics in the simulation.
            </Alert>
          )}

          {/* Controls */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Epochs"
                value={epochs}
                onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isTraining}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Batch Size"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isTraining}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isTraining}>
                <InputLabel>Optimizer</InputLabel>
                <Select value={optimizer} label="Optimizer" onChange={(e) => setOptimizer(e.target.value)}>
                  <MenuItem value="adam">Adam</MenuItem>
                  <MenuItem value="sgd">SGD</MenuItem>
                  <MenuItem value="rmsprop">RMSprop</MenuItem>
                  <MenuItem value="adagrad">Adagrad</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                <Typography variant="caption" sx={{ whiteSpace: 'nowrap', flex: 1 }}>
                  LR: {learningRate.toFixed(4)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Learning Rate Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Learning Rate
            </Typography>
            <Slider
              value={Math.log10(learningRate)}
              onChange={(_, newValue) => setLearningRate(10 ** (newValue as number))}
              min={-5}
              max={-1}
              step={0.1}
              marks={[
                { value: -5, label: '0.00001' },
                { value: -3, label: '0.001' },
                { value: -1, label: '0.1' },
              ]}
              disabled={isTraining}
            />
          </Box>

          {/* Speed Control */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Simulation Speed: {trainingSpeed}ms/epoch
            </Typography>
            <Slider
              value={trainingSpeed}
              onChange={(_, newValue) => setTrainingSpeed(newValue as number)}
              min={100}
              max={2000}
              step={100}
              disabled={isTraining}
            />
          </Box>

          {/* Progress */}
          {metrics.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Progress: Epoch {currentEpoch} / {epochs}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Est. time: {estimatedTime.toFixed(1)}s
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={(currentEpoch / epochs) * 100} sx={{ height: 8 }} />
              
              {/* Detailed Training Info */}
              <Grid container spacing={1.5} sx={{ mt: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
                    <Typography variant="caption" color="textSecondary">Current Epoch</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>{currentEpoch}/{epochs}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' }}>
                    <Typography variant="caption" color="textSecondary">Steps/Epoch</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>{stepsPerEpoch}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316' }}>
                    <Typography variant="caption" color="textSecondary">Train Loss</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f97316' }}>
                      {metrics.length > 0 ? metrics[metrics.length - 1].trainLoss.toFixed(4) : '—'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7' }}>
                    <Typography variant="caption" color="textSecondary">Train Acc</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7' }}>
                      {metrics.length > 0 ? (metrics[metrics.length - 1].trainAcc * 100).toFixed(1) : '—'}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={isTraining ? <Pause /> : <PlayArrow />}
              onClick={isTraining ? () => setIsTraining(false) : handleStart}
            >
              {isTraining ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleReset} disabled={isTraining}>
              Reset
            </Button>
          </Box>

          {/* Training Status */}
          {metrics.length === 0 && !isTraining && (
            <Alert severity="info">
              💡 Configure training parameters and click Start to simulate training
            </Alert>
          )}

          {/* Charts */}
          {metrics.length > 0 && (
            <>
              {/* Loss Chart */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Training & Validation Loss
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => value.toFixed(4)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="trainLoss"
                        stroke="#2196F3"
                        dot={false}
                        isAnimationActive={false}
                        name="Train Loss"
                      />
                      <Line
                        type="monotone"
                        dataKey="valLoss"
                        stroke="#FF9800"
                        dot={false}
                        isAnimationActive={false}
                        name="Val Loss"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              {/* Accuracy Chart */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Training & Validation Accuracy
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip formatter={(value: any) => value.toFixed(4)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="trainAcc"
                        stroke="#4CAF50"
                        dot={false}
                        isAnimationActive={false}
                        name="Train Acc"
                      />
                      <Line
                        type="monotone"
                        dataKey="valAcc"
                        stroke="#F44336"
                        dot={false}
                        isAnimationActive={false}
                        name="Val Acc"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              {/* Statistics */}
              {metrics.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Final Train Loss
                        </Typography>
                        <Typography variant="h6">{metrics[metrics.length - 1].trainLoss.toFixed(4)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Final Val Loss
                        </Typography>
                        <Typography variant="h6">{metrics[metrics.length - 1].valLoss.toFixed(4)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Final Train Acc
                        </Typography>
                        <Typography variant="h6">{(metrics[metrics.length - 1].trainAcc * 100).toFixed(1)}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Final Val Acc
                        </Typography>
                        <Typography variant="h6">{(metrics[metrics.length - 1].valAcc * 100).toFixed(1)}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}
              
              {/* Synthetic Data Display */}
              {syntheticDataInfo && (
                <>
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      📊 Current Batch Information
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1, color: '#6b7280' }}>
                              Batch Configuration
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2">
                                🎯 Batch Size: <strong>{batchSize}</strong>
                              </Typography>
                              <Typography variant="body2">
                                📐 Image Size: <strong>{syntheticDataInfo.imageSize.join('×')}px</strong>
                              </Typography>
                              <Typography variant="body2">
                                🎨 Channels: <strong>{syntheticDataInfo.channels}</strong>
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1, color: '#6b7280' }}>
                              Class Distribution
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {syntheticDataInfo.classes.map((cls: any, idx: number) => (
                                <Typography key={idx} variant="body2">
                                  <span style={{ color: ['#3b82f6', '#22c55e', '#f97316'][idx % 3] }}>●</span> {cls.className}: <strong>{cls.samplesInBatch}</strong> ({cls.percentage}%)
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1, color: '#6b7280' }}>
                              Data Augmentation
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {syntheticDataInfo.augmentationTypes.length > 0 ? (
                                syntheticDataInfo.augmentationTypes.map((aug: string, idx: number) => (
                                  <Typography key={idx} variant="body2">
                                    ✨ {aug}
                                  </Typography>
                                ))
                              ) : (
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                  — No augmentation
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>

                  {/* Data Pipeline Visualization */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      🔄 Training Pipeline
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Paper sx={{ px: 2, py: 1, backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }}>
                          Dataset {datasetStats?.totalSamples.toLocaleString()}
                        </Paper>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>→</Typography>
                        <Paper sx={{ px: 2, py: 1, backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
                          Shuffle
                        </Paper>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>→</Typography>
                        <Paper sx={{ px: 2, py: 1, backgroundColor: '#fed7aa', color: '#92400e', fontWeight: 600 }}>
                          Augment
                        </Paper>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>→</Typography>
                        <Paper sx={{ px: 2, py: 1, backgroundColor: '#e9d5ff', color: '#6b21a8', fontWeight: 600 }}>
                          Batch {batchSize}
                        </Paper>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>→</Typography>
                        <Paper sx={{ px: 2, py: 1, backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                          Model
                        </Paper>
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        Total steps per epoch: <strong>{stepsPerEpoch}</strong> | Total training steps: <strong>{totalSteps}</strong>
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default TrainingSimulator
