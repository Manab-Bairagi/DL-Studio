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
import { Add, Delete, Visibility, Create, GetApp } from '@mui/icons-material'
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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          animation: `${slideInLeft} 0.5s ease`,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            My Models
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            Manage and organize your AI models
          </Typography>
        </Box>
        <Tooltip title="Create a new model">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/builder')}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(59, 130, 246, 0.6)',
              },
            }}
          >
            New Model
          </Button>
        </Tooltip>
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

      {/* Empty State */}
      {models.length === 0 ? (
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #3f3f3f',
            borderRadius: '12px',
            animation: `${fadeInUp} 0.5s ease`,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#3b82f6',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
            },
          }}
        >
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#e5e7eb', mb: 1, fontWeight: 600 }}>
              No models yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
              Create your first model to get started!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/builder')}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(16, 185, 129, 0.6)',
                },
              }}
            >
              Create Your First Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {models.map((model, index) => (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  border: '1px solid #3f3f3f',
                  borderRadius: '12px',
                  animation: `${fadeInUp} 0.5s ease`,
                  animationDelay: `${index * 0.1}s`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: '#3b82f6',
                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: '#ffffff',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {model.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {model.model_type}
                    </Box>
                  </Box>
                  {model.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#d1d5db',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {model.description}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#6b7280',
                      mt: 2,
                    }}
                  >
                    Created: {new Date(model.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ pt: 0, gap: 1 }}>
                  <Tooltip title="View model">
                    <IconButton
                      onClick={() => navigate(`/model/${model.id}`)}
                      size="small"
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
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit model">
                    <IconButton
                      onClick={() => navigate(`/builder/${model.id}`)}
                      size="small"
                      sx={{
                        color: '#8b5cf6',
                        border: '1px solid #3f3f3f',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(139, 92, 246, 0.1)',
                          borderColor: '#8b5cf6',
                        },
                      }}
                    >
                      <Create fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete model">
                    <IconButton
                      onClick={() => handleDeleteClick(model.id)}
                      size="small"
                      sx={{
                        color: '#ef4444',
                        border: '1px solid #3f3f3f',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderColor: '#ef4444',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', fontWeight: 700 }}>
          Delete Model
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', pt: 3 }}>
          <Typography sx={{ color: '#e5e7eb' }}>
            Are you sure you want to delete this model? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
              },
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

