import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Add, Delete, Visibility } from '@mui/icons-material'
import { keyframes } from '@mui/material/styles'
import apiClient from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'

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

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

interface Model {
  id: string
  name: string
  description: string | null
  model_type: string
  owner_id: string
  created_at: string
  updated_at: string | null
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.get('/models')
      setModels(response.data)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setError('Failed to load models. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (modelId: string) => {
    setModelToDelete(modelId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return

    try {
      setDeleting(true)
      await apiClient.delete(`/models/${modelToDelete}`)
      setModels(models.filter((m) => m.id !== modelToDelete))
      setDeleteDialogOpen(false)
      setModelToDelete(null)
    } catch (error) {
      console.error('Failed to delete model:', error)
      setError('Failed to delete model. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading your models..." />
  }

  if (error && models.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Models"
        message={error}
        onRetry={fetchModels}
      />
    )
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 5,
          animation: `${slideInLeft} 0.5s ease`,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#fff',
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#888' }}>
            Manage your deep learning models
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && models.length > 0 && (
        <ErrorState
          title="Error Loading New Models"
          message={error}
          onRetry={fetchModels}
          sx={{ mb: 3 }}
        />
      )}

      {/* Bento Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
          animation: `${fadeInUp} 0.5s ease`,
        }}
      >
        {/* Create New Model Card (First Bento Box) */}
        <Card
          onClick={() => navigate('/builder')}
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            height: '100%',
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: '#3b82f6',
              transform: 'translateY(-4px)',
            },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Add sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            New Model
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Start from scratch
          </Typography>
        </Card>

        {/* Model Cards */}
        {models.map((model, index) => (
          <Card
            key={model.id}
            sx={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '28px',
              height: '100%',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `${fadeInUp} 0.5s ease`,
              animationDelay: `${index * 0.05}s`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                borderColor: '#333',
                '& .action-buttons': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            {/* Card Header / Preview Area */}
            <Box
              sx={{
                p: 3,
                flex: 1,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: '100px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {model.model_type}
                </Box>
                <Typography variant="caption" sx={{ color: '#555', fontFamily: 'monospace' }}>
                  v1.0
                </Typography>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.2,
                }}
              >
                {model.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#888',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.6,
                }}
              >
                {model.description || 'No description provided.'}
              </Typography>
            </Box>

            {/* Card Footer */}
            <Box
              sx={{
                p: 3,
                pt: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #222',
                mt: 'auto',
                background: '#1a1a1a',
              }}
            >
              <Typography variant="caption" sx={{ color: '#444' }}>
                {new Date(model.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>

              <Box
                className="action-buttons"
                sx={{
                  display: 'flex',
                  gap: 1,
                  opacity: 0.6,
                  transform: 'translateY(4px)',
                  transition: 'all 0.3s ease',
                }}
              >
                <IconButton
                  onClick={() => navigate(`/model/${model.id}`)}
                  size="small"
                  sx={{
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: '#3b82f6' },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(model.id)}
                  size="small"
                  sx={{
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': { background: '#ef4444' },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '24px',
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>Delete Model</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#aaa' }}>
            Are you sure you want to delete this model? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: '#888', '&:hover': { color: '#fff' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DashboardPage

