import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  Save,
  Warning,
  CloudUpload,
} from '@mui/icons-material'
import { ModelBuilderContainer } from '../components/ModelBuilderContainer'
import { Node, Edge } from 'reactflow'
import apiClient from '../api/client'
import { useNavigate } from 'react-router-dom'
import { keyframes } from '@mui/material/styles'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  sx?: any
}

const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Error', message, error, onRetry, sx }) => (
  <Paper
    sx={{
      p: 3,
      bgcolor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      color: '#ef4444',
      ...sx,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Warning color="error" />
      <Typography variant="h6" color="error">
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ mb: 2, color: '#fca5a5' }}>
      {message || (error instanceof Error ? error.message : String(error))}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="error" size="small" onClick={onRetry}>
        Retry
      </Button>
    )}
  </Paper>
)

const ModelBuilderPage: React.FC = () => {
  const navigate = useNavigate()
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
  const [builderKey, setBuilderKey] = useState(0)

  // Parse input shape string to array
  const parsedInputShape = React.useMemo(() => {
    try {
      return inputShape.split(',').map((s) => parseInt(s.trim()))
    } catch (e) {
      return [1, 3, 224, 224]
    }
  }, [inputShape])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateModel = () => {
    const errors: string[] = []
    if (!name.trim()) errors.push('Model name is required')
    if (nodes.length === 0) errors.push('Model must have at least one layer')
    
    // Check connectivity
    const connectedNodes = new Set<string>()
    edges.forEach(e => {
      connectedNodes.add(e.source)
      connectedNodes.add(e.target)
    })
    
    if (nodes.length > 1 && connectedNodes.size < nodes.length) {
      // This is a simple check, a full graph traversal would be better
      // errors.push('All layers must be connected')
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSave = async () => {
    if (!validateModel()) return

    setSaving(true)
    setError('')

    try {
      // Prepare model data
      const modelData = {
        name,
        description,
        type: modelType,
        input_shape: parsedInputShape,
        architecture: {
          nodes,
          edges,
        },
        config: {
          auto_config: true
        },
        notes
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('model_data', JSON.stringify(modelData))
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      // Call API
      await apiClient.post('/models', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setShowSaveDialog(false)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.response?.data?.detail || 'Failed to save model')
    } finally {
      setSaving(false)
    }
  }

  const handleNewModel = () => {
    // Reset all state
    setName('')
    setDescription('')
    setModelType('classification')
    setInputShape('1,3,224,224')
    setNotes('')
    setNodes([])
    setEdges([])
    setImageFile(null)
    setImagePreview('')
    setError('')
    setValidationErrors([])
    // Clear localStorage autosave
    localStorage.removeItem('builder_autosave')
    // Increment the key to force re-initialization of the builder
    setBuilderKey(prev => prev + 1)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#0f0f0f' }}>
      {/* Top Info Bar - Compact Style */}
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1,
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              placeholder="Untitled Model"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '1.1rem', fontWeight: 600, color: '#fff' }
              }}
            />
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', height: '32px' }} />

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              size="small"
              sx={{ 
                width: 130,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#555' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#aaa', fontSize: '0.85rem' },
                '& .MuiSelect-icon': { color: '#aaa' },
              }}
            >
              <MenuItem value="classification">Classification</MenuItem>
              <MenuItem value="detection">Detection</MenuItem>
              <MenuItem value="segmentation">Segmentation</MenuItem>
            </TextField>

            <TextField
              value={inputShape}
              onChange={(e) => setInputShape(e.target.value)}
              size="small"
              placeholder="1,3,224,224"
              sx={{ 
                width: 140,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#555' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#aaa', fontSize: '0.85rem' },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Main Builder Area */}
      <Box sx={{ flex: 1, px: 2, pb: 2, pt: 1, overflow: 'hidden' }}>
        <ModelBuilderContainer
          key={builderKey}
          onSave={(n, e) => {
            setNodes(n)
            setEdges(e)
            setShowSaveDialog(true)
          }}
          onNew={handleNewModel}
          initialNodes={nodes}
          initialEdges={edges}
          initialInputShape={parsedInputShape}
        />
      </Box>

      {/* Save Dialog */}
      <Dialog 
        open={showSaveDialog} 
        onClose={() => setShowSaveDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid #333',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Save Model</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#aaa' }}>Model Preview Image</Typography>
              <Box
                sx={{
                  border: '2px dashed #333',
                  borderRadius: '12px',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.05)' },
                }}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 48, color: '#555', mb: 1 }} />
                    <Typography color="textSecondary">Click to upload preview</Typography>
                  </>
                )}
                <input
                  type="file"
                  id="image-upload"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#aaa' }}>Notes</Typography>
              <TextField
                fullWidth
                multiline
                rows={7}
                placeholder="Add implementation notes, performance targets, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  }
                }}
              />
            </Grid>
          </Grid>

          {validationErrors.length > 0 && (
            <Box sx={{ mt: 3 }}>
              {validationErrors.map((err, i) => (
                <Alert severity="error" key={i} sx={{ mb: 1, borderRadius: '8px' }}>{err}</Alert>
              ))}
            </Box>
          )}

          {error && (
            <ErrorState
              message={error}
              onRetry={() => setError('')}
              sx={{ mt: 3 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button onClick={() => setShowSaveDialog(false)} sx={{ color: '#aaa' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {saving ? 'Saving...' : 'Save Model'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModelBuilderPage
