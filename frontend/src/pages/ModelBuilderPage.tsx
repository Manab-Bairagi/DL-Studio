import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Save, Close, ArrowBack, Info } from '@mui/icons-material'
import { Node, Edge } from 'reactflow'
import { keyframes } from '@mui/material/styles'
import ModelBuilderContainer from '../components/ModelBuilderContainer'
import { modelBuilderApi } from '../api/modelBuilder'
import { ErrorState } from '../components/ErrorState'

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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const ModelBuilderPage = () => {
  const navigate = useNavigate()
  const { modelId } = useParams<{ modelId?: string }>()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [modelType, setModelType] = useState('classification')
  const [inputShape, setInputShape] = useState('1,3,224,224')
  const [notes, setNotes] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [numBands, setNumBands] = useState<number>(1)
  const [bandFiles, setBandFiles] = useState<File[]>([])
  const [classLabels, setClassLabels] = useState<string>('')
  const [classLabelsArray, setClassLabelsArray] = useState<string[]>([])
  const [segmentationLabels, setSegmentationLabels] = useState<string>('')
  const [segmentationLabelsArray, setSegmentationLabelsArray] = useState<string[]>([])
  const [layerAutoConfig, setLayerAutoConfig] = useState<boolean>(true)
  const [showInfo, setShowInfo] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBandSelect = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newBands = [...bandFiles]
      newBands[index] = file
      setBandFiles(newBands)
    }
  }

  const handleSaveArchitecture = async () => {
    setError('')
    setValidationErrors([])

    // Validate architecture
    const validation = await modelBuilderApi.validateArchitecture(nodes, edges)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    setShowSaveDialog(true)
  }

  const handleSaveModel = async () => {
    if (!name.trim()) {
      setError('Please enter a model name')
      return
    }

    try {
      setSaving(true)
      const inputShapeArray = inputShape
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n))

      if (modelId) {
        // Save as new version for existing model
        await modelBuilderApi.saveModelVersion(
          modelId,
          nodes,
          edges,
          inputShapeArray,
          notes,
          classLabelsArray.length > 0 ? classLabelsArray : undefined,
          segmentationLabelsArray.length > 0 ? segmentationLabelsArray : undefined,
          layerAutoConfig
        )
        
        // Clear auto-save
        localStorage.removeItem('builder_autosave')

        navigate(`/model/${modelId}`)
      } else {
        // Create new model first
        const newModelId = await modelBuilderApi.createModel(
          name,
          description,
          modelType
        )

        // Then save the architecture version
        await modelBuilderApi.saveModelVersion(
          newModelId,
          nodes,
          edges,
          inputShapeArray,
          notes,
          classLabelsArray.length > 0 ? classLabelsArray : undefined,
          segmentationLabelsArray.length > 0 ? segmentationLabelsArray : undefined,
          layerAutoConfig
        )

        // Clear auto-save
        localStorage.removeItem('builder_autosave')
        
        navigate(`/`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save model')
    } finally {
      setSaving(false)
      setShowSaveDialog(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%', flexDirection: 'column', background: '#0f0f0f' }}>
      {/* Enhanced Top Info Bar */}
      <Paper
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderBottom: '1px solid #3f3f3f',
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: `${slideDown} 0.4s ease`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 'fit-content' }}>
            <Tooltip title="Go back to dashboard">
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: '#9ca3af',
                  border: '1px solid #3f3f3f',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#3b82f6',
                    borderColor: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {modelId ? 'Edit Model Version' : 'Create New Model'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Build your architecture by adding and connecting layers
              </Typography>
            </Box>
          </Box>

          {/* Middle Section - Image Preview */}
          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              sx={{
                height: 64,
                width: 'auto',
                borderRadius: '8px',
                border: '2px solid #3b82f6',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                animation: `${fadeIn} 0.3s ease`,
              }}
            />
          )}

          {/* Right Section - Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Tooltip title="Model information">
              <IconButton
                onClick={() => setShowInfo(true)}
                sx={{
                  color: '#3b82f6',
                  border: '1px solid #3f3f3f',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                  },
                }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save and configure model">
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveArchitecture}
                disabled={nodes.length === 0}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                  },
                }}
              >
                Save
              </Button>
            </Tooltip>


          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <ErrorState
            title="Error"
            message={error}
            onRetry={() => setError('')}
            sx={{ mt: 2 }}
          />
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card
            sx={{
              mt: 2,
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid #f97316',
              borderRadius: '8px',
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f97316', mb: 1 }}>
                Validation Issues:
              </Typography>
              {validationErrors.map((err, idx) => (
                <Typography key={idx} variant="caption" display="block" sx={{ color: '#fca5a5', mb: 0.5 }}>
                  • {err}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Visual Builder Container with Undo/Redo */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ModelBuilderContainer
          onSave={(newNodes, newEdges) => {
            setNodes(newNodes)
            setEdges(newEdges)
          }}
          initialNodes={nodes}
          initialEdges={edges}
          initialInputShape={inputShape.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))}
          outputConfig={{
            classes: classLabelsArray,
            segmentationClasses: segmentationLabelsArray
          }}
          onOutputConfigChange={(config) => {
            setClassLabelsArray(config.classes)
            setClassLabels(config.classes.join(','))
            setSegmentationLabelsArray(config.segmentationClasses)
            setSegmentationLabels(config.segmentationClasses.join(','))
          }}
        />
      </Box>

      {/* Enhanced Save Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Save Model Configuration
            </Typography>
            <IconButton onClick={() => setShowSaveDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!modelId && (
              <>
                <TextField
                  fullWidth
                  label="Model Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel>Model Type</InputLabel>
                  <Select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    label="Model Type"
                  >
                    <MenuItem value="classification">Classification</MenuItem>
                    <MenuItem value="segmentation">Segmentation</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 1, borderColor: '#3f3f3f' }} />
              </>
            )}

            <TextField
              fullWidth
              label="Input Shape (comma-separated)"
              value={inputShape}
              onChange={(e) => setInputShape(e.target.value)}
              placeholder="1,3,224,224"
              helperText="Format: batch,channels,height,width"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />

            {modelType === 'classification' && (
              <TextField
                fullWidth
                label="Class Labels (comma-separated)"
                value={classLabels}
                onChange={(e) => {
                  setClassLabels(e.target.value)
                  setClassLabelsArray(e.target.value.split(',').map((label) => label.trim()).filter((label) => label.length > 0))
                }}
                placeholder="e.g., cat,dog,bird"
                helperText="Optional: Class names for predictions"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            )}

            {modelType === 'segmentation' && (
              <TextField
                fullWidth
                label="Segmentation Labels (comma-separated)"
                value={segmentationLabels}
                onChange={(e) => {
                  setSegmentationLabels(e.target.value)
                  setSegmentationLabelsArray(e.target.value.split(',').map((label) => label.trim()).filter((label) => label.length > 0))
                }}
                placeholder="e.g., person,car,building"
                helperText="Optional: Class names for segmentation masks"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={layerAutoConfig}
                  onChange={(e) => setLayerAutoConfig(e.target.checked)}
                />
              }
              label="Auto-adjust layer configurations when connecting"
              sx={{ mt: 1 }}
            />

            <TextField
              fullWidth
              label="Version Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', p: 2, gap: 1 }}>
          <Button onClick={() => setShowSaveDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveModel}
            variant="contained"
            disabled={saving || (!modelId && !name.trim())}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
              },
            }}
          >
            {saving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {saving ? 'Saving...' : 'Save Model'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfo} onClose={() => setShowInfo(false)} maxWidth="sm">
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          Builder Information
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', pt: 2 }}>
          <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3b82f6', mb: 0.5 }}>
                Total Layers: {nodes.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8b5cf6', mb: 0.5 }}>
                Connections: {edges.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f97316', mb: 0.5 }}>
                Input Shape: {inputShape}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 1 }}>
                💡 Tip: Drag layers from the palette on the right to add them to your model. Connect layers by clicking the connection point and dragging to another layer.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', p: 2 }}>
          <Button onClick={() => setShowInfo(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModelBuilderPage

