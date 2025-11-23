import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { keyframes } from '@mui/material/styles'
import DatasetVisualizer from '../components/DatasetVisualizer'
import HyperparameterSuggestions from '../components/HyperparameterSuggestions'
import TrainingSimulator from '../components/TrainingSimulator'
import { LoadingState } from '../components/LoadingState'
import apiClient from '../api/client'
import { modelBuilderApi } from '../api/modelBuilder'

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
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



const ModelOptimizationPage = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [modelLoading, setModelLoading] = useState(true)
  const [selectedNodes, setSelectedNodes] = useState<any[]>([])
  const [selectedEdges, setSelectedEdges] = useState<any[]>([])
  const [datasetStats, setDatasetStats] = useState<any>(null)
  const [trainingMetrics, setTrainingMetrics] = useState<any[]>([])
  // Fetch user's models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await apiClient.get('/models')
        const data = response.data
        const modelsList = Array.isArray(data) ? data : (data.models || [])
        setModels(modelsList)
        if (modelsList.length > 0) {
          // Trigger selection of first model to fetch its versions
          handleModelChange(modelsList[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setModelLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Handle model selection change
  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId)
    setModelLoading(true)
    
    try {
      const response = await apiClient.get(`/models/${modelId}/versions`)
      const versions = response.data
      
      if (versions && versions.length > 0) {
        // Sort by version number descending to get latest
        const sortedVersions = versions.sort((a: any, b: any) => b.version_number - a.version_number)
        const latestVersion = sortedVersions[0]
        
        const { nodes, edges } = modelBuilderApi.deserializeArchitecture(latestVersion.architecture)
        setSelectedNodes(nodes)
        setSelectedEdges(edges)
      } else {
        setSelectedNodes([])
        setSelectedEdges([])
      }
    } catch (error) {
      console.error('Failed to fetch model versions:', error)
      setSelectedNodes([])
      setSelectedEdges([])
    } finally {
      setModelLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }



  const handleDatasetLoad = (stats: any) => {
    console.log('Dataset loaded:', stats)
    setDatasetStats(stats)
  }

  const handleTrainingUpdate = (metrics: any[]) => {
    setTrainingMetrics(metrics)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f0f' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderBottom: '1px solid #3f3f3f',
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: `${slideDown} 0.4s ease`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Return to builder">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/builder')}
              variant="text"
              sx={{
                color: '#9ca3af',
                '&:hover': {
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              Back
            </Button>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              🚀 Model Optimization Suite
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Analyze datasets, get hyperparameter suggestions, and simulate training
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#3f3f3f' }} />

        {/* Model Selector */}
        <Paper
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
            border: '1px solid #3f3f3f',
            borderRadius: '8px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, minWidth: '120px', color: '#e5e7eb' }}
            >
              📦 Select Model:
            </Typography>
            {modelLoading ? (
              <LoadingState message="Loading models..." size="small" />
            ) : models.length > 0 ? (
              <>
                <TextField
                  select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  size="small"
                  sx={{
                    minWidth: '250px',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name} ({selectedNodes?.length || 0} layers)
                    </MenuItem>
                  ))}
                </TextField>
                <Card
                  sx={{
                    flex: 1,
                    minWidth: '250px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#10b981', fontWeight: 600 }}
                    >
                      ✅ Model Selected: {selectedNodes.length} layers • {selectedEdges.length} connections
                    </Typography>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                  border: '1px solid #f97316',
                  borderRadius: '8px',
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ color: '#f97316', fontWeight: 600 }}>
                    ⚠️ No models found.
                    <Button
                      size="small"
                      onClick={() => navigate('/builder')}
                      sx={{ ml: 1, color: '#f97316' }}
                    >
                      Create one first
                    </Button>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Paper>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Tabs */}
        <Paper
          sx={{
            borderBottom: '1px solid #3f3f3f',
            borderRadius: 0,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="optimization tools"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                color: '#9ca3af',
                '&.Mui-selected': {
                  color: '#3b82f6',
                },
              },
            }}
          >
            <Tab label="📊 Dataset Visualizer" id="optimization-tab-0" />
            <Tab label="⚡ Training Simulator" id="optimization-tab-1" />
            <Tab label="🧠 Hyperparameter Tuning" id="optimization-tab-2" />
          </Tabs>
        </Paper>

        {/* Info Alert */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
            }}
          >
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                💡 Optimize your model: Analyze your dataset, get intelligent hyperparameter recommendations,
                and simulate training to test architecture performance.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3, animation: `${fadeInUp} 0.3s ease` }}>
          {tabValue === 0 && <DatasetVisualizer onDatasetLoad={handleDatasetLoad} />}
          {tabValue === 1 && (
            <TrainingSimulator
              nodes={selectedNodes}
              edges={selectedEdges}
              datasetStats={datasetStats}
              onTrainingUpdate={handleTrainingUpdate}
            />
          )}
          {tabValue === 2 && (
            <HyperparameterSuggestions
              nodes={selectedNodes}
              edges={selectedEdges}
              datasetStats={datasetStats}
              trainingMetrics={trainingMetrics}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ModelOptimizationPage
