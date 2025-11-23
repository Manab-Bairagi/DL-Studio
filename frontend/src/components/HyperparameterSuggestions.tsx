import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import { Lightbulb, CheckCircle, Info } from '@mui/icons-material'
import { Node, Edge } from 'reactflow'
import apiClient from '../api/client'

interface HyperparameterSuggestion {
  parameter: string
  currentValue: string | number
  suggestedValue: string | number
  reason: string
  impact: 'high' | 'medium' | 'low'
  category: 'learning' | 'regularization' | 'architecture' | 'optimization'
}

interface HyperparameterRecommendation {
  learningRate: number
  batchSize: number
  optimizer: string
  epochs: number
  dropout: number
  l2Regularization: number
  reason: string
}

interface HyperparameterSuggestionsProps {
  nodes: Node[]
  edges: Edge[]
  datasetStats?: any
  trainingMetrics?: any[]
}

const HyperparameterSuggestions: React.FC<HyperparameterSuggestionsProps> = ({
  nodes,
  edges,
  datasetStats,
  trainingMetrics,
}) => {
  const [suggestions, setSuggestions] = useState<HyperparameterSuggestion[]>([])
  const [recommendation, setRecommendation] = useState<HyperparameterRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analyzingAspect, setAnalyzingAspect] = useState<string | null>(null)
  const [analysisText, setAnalysisText] = useState<string>('')

  useEffect(() => {
    if (nodes.length > 0) {
      generateSuggestions()
    }
  }, [nodes.length, datasetStats])

  const generateSuggestions = async () => {
    setLoading(true)
    setAnalyzingAspect('architecture')

    try {
      const response = await apiClient.post('/optimize/suggestions', {
        architecture: { nodes, edges },
        dataset_stats: datasetStats || {},
        training_metrics: trainingMetrics || []
      })

      const { suggestions: apiSuggestions, analysis } = response.data

      if (apiSuggestions) {
        // Map API response (snake_case) to frontend interface (camelCase)
        const mappedSuggestions = apiSuggestions.map((s: any) => ({
          parameter: s.parameter,
          currentValue: s.current_value,
          suggestedValue: s.suggested_value,
          reason: s.reason,
          impact: s.impact.toLowerCase(),
          category: s.category.toLowerCase()
        }))

        setSuggestions(mappedSuggestions)
        setAnalysisText(analysis)
        
        // Generate recommendation summary from API suggestions
        const rec = generateRecommendation(mappedSuggestions)
        setRecommendation(rec)
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      // Fallback to client-side analysis if API fails
      const modelSuggestions = analyzeArchitecture()
      setSuggestions(modelSuggestions)
      const rec = generateRecommendation(modelSuggestions)
      setRecommendation(rec)
    } finally {
      setLoading(false)
      setAnalyzingAspect(null)
    }
  }

  const analyzeArchitecture = (): HyperparameterSuggestion[] => {
    const sug: HyperparameterSuggestion[] = []
    const numLayers = nodes.length
    const convLayers = nodes.filter((n) => n.data?.type === 'Conv2d').length
    const denseElements = nodes.filter((n) => n.data?.type === 'Dense' || n.data?.type === 'Linear').length

    // Depth analysis
    if (numLayers > 50) {
      sug.push({
        parameter: 'Model Depth',
        currentValue: `${numLayers} layers`,
        suggestedValue: '30-50 layers',
        reason: 'Very deep models need careful initialization and learning rates',
        impact: 'high',
        category: 'architecture',
      })
    }

    // Conv layer density
    if (convLayers > 20) {
      sug.push({
        parameter: 'Convolutional Layers',
        currentValue: `${convLayers} Conv2d`,
        suggestedValue: 'Add BatchNorm between layers',
        reason: 'Many conv layers benefit from batch normalization for stability',
        impact: 'high',
        category: 'architecture',
      })
    }

    // Dense layers
    if (denseElements > 5) {
      sug.push({
        parameter: 'Fully Connected Layers',
        currentValue: `${denseElements} Dense`,
        suggestedValue: 'Add Dropout regularization',
        reason: 'Multiple dense layers are prone to overfitting',
        impact: 'medium',
        category: 'regularization',
      })
    }

    // Learning rate suggestions
    if (numLayers > 30) {
      sug.push({
        parameter: 'Learning Rate',
        currentValue: '0.001',
        suggestedValue: '0.0001-0.0005',
        reason: 'Deeper models require smaller learning rates for stability',
        impact: 'high',
        category: 'learning',
      })
    } else if (numLayers < 10) {
      sug.push({
        parameter: 'Learning Rate',
        currentValue: '0.001',
        suggestedValue: '0.001-0.01',
        reason: 'Smaller models can handle higher learning rates',
        impact: 'high',
        category: 'learning',
      })
    }

    // Batch size
    if (numLayers > 20) {
      sug.push({
        parameter: 'Batch Size',
        currentValue: '32',
        suggestedValue: '64-128',
        reason: 'Larger models benefit from bigger batch sizes',
        impact: 'medium',
        category: 'optimization',
      })
    }

    // Optimizer
    if (numLayers > 30) {
      sug.push({
        parameter: 'Optimizer',
        currentValue: 'SGD',
        suggestedValue: 'Adam or AdamW',
        reason: 'Deep networks train better with adaptive learning rate optimizers',
        impact: 'high',
        category: 'optimization',
      })
    }

    // Regularization
    if (denseElements > 3) {
      sug.push({
        parameter: 'Dropout Rate',
        currentValue: '0.5',
        suggestedValue: '0.3-0.5',
        reason: 'Adjust dropout based on model complexity and dataset size',
        impact: 'medium',
        category: 'regularization',
      })
    }

    // Epochs
    sug.push({
      parameter: 'Epochs',
      currentValue: '50',
      suggestedValue: `${Math.max(50, numLayers * 5)}`,
      reason: 'Deeper models may need more epochs to converge',
      impact: 'low',
      category: 'optimization',
    })

    return sug
  }

  const generateRecommendation = (_sug: HyperparameterSuggestion[]): HyperparameterRecommendation => {
    const numLayers = nodes.length
    const hasDropout = nodes.some((n) => n.data?.type === 'Dropout')
    const hasBatchNorm = nodes.some((n) => n.data?.type === 'BatchNorm2d')

    let lr = 0.001
    let batchSize = 32
    let epochs = Math.max(50, numLayers * 5)
    let optimizer = 'adam'
    let dropout = 0.5
    let l2Reg = 0.0001

    // Adjust based on model depth
    if (numLayers > 50) {
      lr = 0.0001
      optimizer = 'adamw'
    } else if (numLayers > 30) {
      lr = 0.0005
    } else if (numLayers < 10) {
      lr = 0.01
    }

    // Batch size based on depth
    if (numLayers > 20) {
      batchSize = 128
    } else if (numLayers > 15) {
      batchSize = 64
    }

    // Dropout adjustment
    if (hasBatchNorm) {
      dropout = 0.3
    } else if (!hasDropout) {
      dropout = 0.2
    }

    // L2 regularization
    if (nodes.some((n) => n.data?.type === 'Dense' || n.data?.type === 'Linear')) {
      l2Reg = 0.0001
    }

    const reasons = [
      `Model complexity: ${numLayers} layers`,
      hasBatchNorm && 'BatchNorm detected - reducing dropout',
      optimizer === 'adamw' && 'Deep model - using AdamW',
      `Recommended ${epochs} epochs for convergence`,
    ]
      .filter(Boolean)
      .join(', ')

    return {
      learningRate: lr,
      batchSize,
      optimizer,
      epochs,
      dropout,
      l2Regularization: l2Reg,
      reason: reasons,
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#F44336'
      case 'medium':
        return '#FF9800'
      case 'low':
        return '#4CAF50'
      default:
        return '#999'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      learning: '📚',
      regularization: '🛡️',
      architecture: '🏗️',
      optimization: '⚡',
    }
    return icons[category] || '•'
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Lightbulb sx={{ color: '#FFC107' }} />
            <Typography variant="h6">
              AI Hyperparameter Recommendations
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            Intelligent suggestions based on your model architecture and best practices
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
              <CircularProgress size={24} />
              <Typography variant="body2">
                Analyzing {analyzingAspect}...
              </Typography>
            </Box>
          )}

          {!loading && recommendation && (
            <>
              {/* Main Recommendation */}
              <Paper sx={{ p: 2.5, backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircle sx={{ color: '#4CAF50', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Recommended Hyperparameters
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 1.5 }}>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Learning Rate
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {recommendation.learningRate}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Batch Size
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {recommendation.batchSize}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Optimizer
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {recommendation.optimizer.toUpperCase()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Epochs
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {recommendation.epochs}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" sx={{ color: '#1B5E20', fontStyle: 'italic' }}>
                      💡 {recommendation.reason}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* AI Analysis Text */}
              {analysisText && (
                <Paper sx={{ p: 2, backgroundColor: '#E3F2FD', borderLeft: '4px solid #2196F3', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1565C0' }}>
                    🤖 AI Analysis
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0D47A1' }}>
                    {analysisText}
                  </Typography>
                </Paper>
              )}

              {/* Detailed Suggestions */}
              {suggestions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowDetails(!showDetails)}
                    sx={{ mb: 1.5 }}
                  >
                    {showDetails ? '▼' : '▶'} Detailed Suggestions ({suggestions.length})
                  </Button>

                  {showDetails && (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Parameter</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Current</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Suggested</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Impact</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {suggestions.map((s, idx) => (
                            <TableRow key={idx} hover sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } }}>
                              <TableCell sx={{ color: '#e0e0e0' }}>{getCategoryIcon(s.category)}</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#e0e0e0' }}>{s.parameter}</TableCell>
                              <TableCell sx={{ color: '#bdbdbd' }}>{s.currentValue}</TableCell>
                              <TableCell sx={{ color: '#2196F3', fontWeight: 'bold' }}>{s.suggestedValue}</TableCell>
                              <TableCell sx={{ fontSize: '0.85rem', color: '#e0e0e0' }}>{s.reason}</TableCell>
                              <TableCell>
                                <Chip
                                  label={s.impact.toUpperCase()}
                                  size="small"
                                  sx={{
                                    backgroundColor: getImpactColor(s.impact),
                                    color: 'white',
                                    fontWeight: 'bold',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* Model Analysis Summary */}
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  📈 Model Analysis
                </Typography>
                <List dense sx={{ '& .MuiListItem-root': { py: 0.5 } }}>
                  <ListItem>
                    <ListItemText
                      primary="Model Depth"
                      secondary={`${nodes.length} layers - ${nodes.length < 10 ? 'Shallow' : nodes.length < 30 ? 'Medium' : 'Deep'} architecture`}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Conv Layers"
                      secondary={`${nodes.filter((n) => n.data?.type === 'Conv2d').length} convolutional layers detected`}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Dense Layers"
                      secondary={`${nodes.filter((n) => n.data?.type === 'Dense' || n.data?.type === 'Linear').length} fully connected layers detected`}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Regularization"
                      secondary={`${nodes.some((n) => n.data?.type === 'Dropout') ? 'Dropout present' : 'Consider adding Dropout'}`}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={generateSuggestions}>
                  Regenerate
                </Button>
              </Box>
            </>
          )}

          {!loading && !recommendation && (
            <Alert severity="info">
              <Info sx={{ mr: 1, display: 'inline' }} />
              Add layers to your model to get AI-powered hyperparameter recommendations
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default HyperparameterSuggestions
