import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material'
import { Upload, PlayArrow, Refresh } from '@mui/icons-material'
import { keyframes } from '@mui/material/styles'
import apiClient from '../api/client'
import { inferenceApi, InferenceResponse, ModelConfig } from '../api/inference'
import FeatureMapVisualizer from '../components/FeatureMapVisualizer'
import LayerVisualization from '../components/LayerVisualization'
import LayerProcessingVisualizer from '../components/LayerProcessingVisualizer'
import NetworkDataFlowVisualizer from '../components/NetworkDataFlowVisualizer'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatisticsTooltip, LAYER_STATS_INFO } from '../components/StatisticsTooltip'

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`



interface Model {
  id: string
  name: string
  description?: string
  model_type: string
  created_at: string
}

interface ModelVersion {
  id: string
  version_number: number
}

const InferencePage = () => {
  const [models, setModels] = useState<Model[]>([])
  const [versions, setVersions] = useState<ModelVersion[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [inferenceResult, setInferenceResult] = useState<InferenceResponse | null>(null)
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null)
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)

  // Load models on mount
  useEffect(() => {
    fetchModels()
  }, [])

  // Load versions when model is selected
  useEffect(() => {
    if (selectedModel) {
      fetchVersions(selectedModel)
    }
  }, [selectedModel])

  const fetchModels = async () => {
    try {
      const response = await apiClient.get('/models')
      setModels(response.data)
    } catch (err: any) {
      setError('Failed to load models. Please try again.')
    }
  }

  const fetchVersions = async (modelId: string) => {
    try {
      const response = await apiClient.get(`/models/${modelId}/versions`)
      setVersions(response.data)
      if (response.data.length > 0) {
        setSelectedVersion(response.data[0].id)
      }
    } catch (err: any) {
      setError('Failed to load model versions. Please try again.')
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRunInference = async () => {
    if (!selectedVersion) {
      setError('Please select a model version')
      return
    }

    if (!imageFile) {
      setError('Please upload an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First get model config
      const config = await inferenceApi.getModelConfig(selectedVersion)
      setModelConfig(config)

      // Run inference
      const result = await inferenceApi.uploadAndInfer(selectedVersion, imageFile)
      setInferenceResult(result)
      setTabIndex(0)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Inference failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, animation: `${slideDown} 0.5s ease` }}>
      {/* Header */}
      <Box sx={{ mb: 4, animation: `${slideDown} 0.5s ease` }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Inference & Visualization
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Upload images and run inference to visualize model predictions and layer activations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Controls Panel */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              animation: `${fadeInUp} 0.5s ease`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Model & Version Selection */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#9ca3af' }}>Select Model</InputLabel>
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    label="Select Model"
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316' },
                      '.MuiSvgIcon-root': { color: '#9ca3af' },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#1a1a1a',
                          border: '1px solid #333',
                          color: '#fff',
                          '& .MuiMenuItem-root': {
                            '&:hover': { bgcolor: '#333' },
                            '&.Mui-selected': { bgcolor: 'rgba(249, 115, 22, 0.2)' },
                          },
                        },
                      },
                    }}
                  >
                    {models.length === 0 ? (
                      <MenuItem disabled>No models available</MenuItem>
                    ) : (
                      models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!selectedModel}>
                  <InputLabel sx={{ color: '#9ca3af' }}>Select Version</InputLabel>
                  <Select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    label="Select Version"
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f97316' },
                      '.MuiSvgIcon-root': { color: '#9ca3af' },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#1a1a1a',
                          border: '1px solid #333',
                          color: '#fff',
                          '& .MuiMenuItem-root': {
                            '&:hover': { bgcolor: '#333' },
                            '&.Mui-selected': { bgcolor: 'rgba(249, 115, 22, 0.2)' },
                          },
                        },
                      },
                    }}
                  >
                    {versions.map((version) => (
                      <MenuItem key={version.id} value={version.id}>
                        Version {version.version_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2, borderColor: '#333' }} />

            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#e5e7eb' }}>
                📸 Upload Image
              </Typography>

              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-input"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-input">
                <Tooltip title="Upload an image for inference">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    sx={{
                      color: '#f97316',
                      borderColor: '#f97316',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(249, 115, 22, 0.1)',
                        borderColor: '#ea580c',
                      },
                    }}
                  >
                    Upload Image
                  </Button>
                </Tooltip>
              </label>

              {imageFile && (
                <Typography variant="body2" sx={{ mt: 2, color: '#10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✓ {imageFile.name}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2, borderColor: '#333' }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Tooltip title="Run inference on uploaded image">
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                  onClick={handleRunInference}
                  disabled={loading || !selectedVersion || !imageFile}
                  sx={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover:not(:disabled)': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(249, 115, 22, 0.5)',
                    },
                    '&:disabled': {
                      background: '#333',
                      color: '#666',
                    },
                  }}
                >
                  {loading ? 'Running...' : 'Run Inference'}
                </Button>
              </Tooltip>

              {inferenceResult && (
                <Tooltip title="Clear results">
                  <IconButton
                    onClick={() => {
                      setInferenceResult(null)
                      setTabIndex(0)
                    }}
                    sx={{
                      color: '#9ca3af',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#ef4444',
                        borderColor: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Error Display */}
            {error && (
              <ErrorState
                title="Error"
                message={error}
                onRetry={() => setError('')}
                sx={{ mt: 3 }}
              />
            )}
          </Paper>
        </Grid>

        {/* Image Preview */}
        {imagePreview && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                animation: `${fadeInUp} 0.5s ease 0.1s both`,
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#e5e7eb' }}>
                  Input Image
                </Typography>
                <Box
                  component="img"
                  src={imagePreview}
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '2px solid #f97316',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Model Config */}
        {modelConfig && (
          <Grid item xs={12} sm={imagePreview ? 6 : 12} md={imagePreview ? 8 : 12}>
            <Card
              sx={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                animation: `${fadeInUp} 0.5s ease 0.1s both`,
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#e5e7eb' }}>
                  Model Configuration
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow sx={{ '&:hover': { background: 'rgba(249, 115, 22, 0.05)' } }}>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid #333' }}>Input Shape</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 600, borderBottom: '1px solid #333' }}>
                          {modelConfig.input_shape.join(' × ')}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { background: 'rgba(249, 115, 22, 0.05)' } }}>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid #333' }}>Total Parameters</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 600, borderBottom: '1px solid #333' }}>
                          {modelConfig.total_parameters.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { background: 'rgba(249, 115, 22, 0.05)' } }}>
                        <TableCell sx={{ color: '#9ca3af', fontWeight: 500, borderBottom: 'none' }}>Trainable Parameters</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 600, borderBottom: 'none' }}>
                          {modelConfig.trainable_parameters.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Results Summary */}
        {inferenceResult && (
          <>
            <Grid item xs={12}>
              <Card
                sx={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '16px',
                  animation: `${fadeInUp} 0.5s ease 0.2s both`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      Inference Results
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        ✓ Success
                      </Box>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid #3b82f6',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                          Processing Time
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                          {(inferenceResult.processing_time * 1000).toFixed(2)} ms
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid #8b5cf6',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                          Output Shape
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                          {inferenceResult.output_shape.join(' × ')}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(249, 115, 22, 0.1)',
                          border: '1px solid #f97316',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                          Total Layers
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#f97316', fontWeight: 700 }}>
                          {inferenceResult.layer_outputs.length}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid #10b981',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                          },
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                          Status
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                          ✓ Success
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Visualization Tabs */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '16px',
                  animation: `${fadeInUp} 0.5s ease 0.3s both`,
                }}
              >
                <Tabs
                  value={tabIndex}
                  onChange={(_, newValue) => setTabIndex(newValue)}
                  sx={{
                    borderBottom: '1px solid #333',
                    '& .MuiTab-root': {
                      color: '#9ca3af',
                      '&.Mui-selected': {
                        color: '#f97316',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#f97316',
                    },
                  }}
                >
                  <Tab label="🌊 Data Flow" />
                  <Tab label="🔍 Layer Analysis" />
                  <Tab label="📊 Processing Flow" />
                  <Tab label="🗺️ Feature Maps" />
                  <Tab label="📈 Statistics" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                  {/* Network Data Flow Tab */}
                  {tabIndex === 0 && (
                    <Box sx={{ animation: `${fadeInUp} 0.3s ease` }}>
                      <NetworkDataFlowVisualizer
                        layerOutputs={inferenceResult.layer_outputs}
                        inputImage={imagePreview}
                      />
                    </Box>
                  )}

                  {/* Layer Analysis Tab */}
                  {tabIndex === 1 && (
                    <Box sx={{ animation: `${fadeInUp} 0.3s ease` }}>
                      <LayerVisualization
                        layerOutputs={inferenceResult.layer_outputs}
                        selectedLayerIndex={selectedLayerIndex}
                        onLayerSelect={setSelectedLayerIndex}
                      />
                    </Box>
                  )}

                  {/* Processing Flow Tab */}
                  {tabIndex === 2 && (
                    <Box sx={{ animation: `${fadeInUp} 0.3s ease` }}>
                      <LayerProcessingVisualizer
                        layerOutputs={inferenceResult.layer_outputs}
                        inputImage={imagePreview}
                      />
                    </Box>
                  )}

                  {/* Feature Maps Tab */}
                  {tabIndex === 3 && (
                    <Box sx={{ animation: `${fadeInUp} 0.3s ease` }}>
                      <FeatureMapVisualizer
                        layerOutputs={inferenceResult.layer_outputs}
                        selectedIndex={selectedLayerIndex}
                        onSelectLayer={setSelectedLayerIndex}
                      />
                    </Box>
                  )}

                  {/* Statistics Tab */}
                  {tabIndex === 4 && (
                    <Box sx={{ animation: `${fadeInUp} 0.3s ease` }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderBottom: '2px solid #f97316' }}>
                              <TableCell sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>Layer</TableCell>
                              <TableCell sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>Type</TableCell>
                              <TableCell sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>Output Shape</TableCell>
                              <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>
                                Min
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>
                                Max
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>
                                Mean
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)' }}>
                                Std
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {inferenceResult.layer_outputs.map((layer, idx) => (
                              <TableRow key={idx} sx={{ '&:hover': { background: 'rgba(249, 115, 22, 0.05)' } }}>
                                <TableCell sx={{ color: '#e5e7eb', borderBottom: '1px solid #333' }}>{layer.layer_name}</TableCell>
                                <TableCell sx={{ color: '#e5e7eb', borderBottom: '1px solid #333' }}>{layer.layer_type}</TableCell>
                                <TableCell sx={{ color: '#e5e7eb', borderBottom: '1px solid #333' }}>{layer.output_shape.join(' × ')}</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                                  <StatisticsTooltip
                                    statistics={[{
                                      ...LAYER_STATS_INFO.min,
                                      value: layer.activation_stats.min.toFixed(4)
                                    }]}
                                    children={
                                      <span style={{ color: '#9ca3af', cursor: 'help' }}>
                                        {layer.activation_stats.min.toFixed(4)}
                                      </span>
                                    }
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                                  <StatisticsTooltip
                                    statistics={[{
                                      ...LAYER_STATS_INFO.max,
                                      value: layer.activation_stats.max.toFixed(4)
                                    }]}
                                    children={
                                      <span style={{ color: '#9ca3af', cursor: 'help' }}>
                                        {layer.activation_stats.max.toFixed(4)}
                                      </span>
                                    }
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                                  <StatisticsTooltip
                                    statistics={[{
                                      ...LAYER_STATS_INFO.mean,
                                      value: layer.activation_stats.mean.toFixed(4)
                                    }]}
                                    children={
                                      <span style={{ color: '#9ca3af', cursor: 'help' }}>
                                        {layer.activation_stats.mean.toFixed(4)}
                                      </span>
                                    }
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid #333' }}>
                                  <StatisticsTooltip
                                    statistics={[{
                                      ...LAYER_STATS_INFO.std,
                                      value: layer.activation_stats.std.toFixed(4)
                                    }]}
                                    children={
                                      <span style={{ color: '#9ca3af', cursor: 'help' }}>
                                        {layer.activation_stats.std.toFixed(4)}
                                      </span>
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {loading && (
          <Grid item xs={12}>
            <LoadingState message="Running inference and analyzing layers..." size="large" />
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

export default InferencePage
