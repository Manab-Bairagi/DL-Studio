import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Download, Edit, ArrowBack, FileOpen, Compare, Visibility } from '@mui/icons-material'
import { Node, Edge } from 'reactflow'
import VisualModelBuilder from '../components/VisualModelBuilder'
import VersionComparison from '../components/VersionComparison'
import CodePreview from '../components/CodePreview'
import ModelAnalysis from '../components/ModelAnalysis'
import { modelBuilderApi } from '../api/modelBuilder'
import apiClient from '../api/client'

interface ModelVersion {
  id: string
  version_number: number
  created_at: string
  architecture: any
  input_shape: number[]
}

const ModelViewPage = () => {
  const { modelId } = useParams<{ modelId: string }>()
  const navigate = useNavigate()
  const [model, setModel] = useState<any>(null)
  const [versions, setVersions] = useState<ModelVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [tabIndex, setTabIndex] = useState(0)
  const [compareOpen, setCompareOpen] = useState(false)
  const [codePreviewOpen, setCodePreviewOpen] = useState(false)
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState<string>('')

  useEffect(() => {
    if (modelId) {
      fetchModel()
    }
  }, [modelId])

  useEffect(() => {
    if (selectedVersionId && versions.length > 0) {
      loadVersionArchitecture()
    }
  }, [selectedVersionId, versions])

  const fetchModel = async () => {
    try {
      const response = await apiClient.get(`/models/${modelId}`)
      setModel(response.data)

      // Fetch versions
      const versionsResponse = await apiClient.get(`/models/${modelId}/versions`)
      setVersions(versionsResponse.data)
      if (versionsResponse.data.length > 0) {
        setSelectedVersionId(versionsResponse.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch model:', error)
      setError('Failed to load model')
    } finally {
      setLoading(false)
    }
  }

  const loadVersionArchitecture = () => {
    const version = versions.find((v) => v.id === selectedVersionId)
    if (version && version.architecture) {
      const { nodes: loadedNodes, edges: loadedEdges } = modelBuilderApi.deserializeArchitecture(
        version.architecture
      )
      // Ensure all nodes have their configurations visible in the panel
      const nodesWithConfig = loadedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          // Config is already loaded from deserialization
        }
      }))
      setNodes(nodesWithConfig)
      setEdges(loadedEdges)
    }
  }

  const handleStartEditing = () => {
    setEditing(true)
    setTabIndex(0)
    loadVersionArchitecture()
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
    try {
      setSaving(true)
      const inputShape = versions.find((v) => v.id === selectedVersionId)?.input_shape || [1, 3, 224, 224]

      // Save as new version
      await modelBuilderApi.saveModelVersion(modelId!, nodes, inputShape, notes)

      // Refresh versions
      setEditing(false)
      setNotes('')
      fetchModel()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save model')
    } finally {
      setSaving(false)
      setShowSaveDialog(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setNotes('')
    setValidationErrors([])
    setError('')
  }

  const handleExport = async () => {
    alert('Export functionality coming soon')
  }

  const handleShowComparison = () => {
    setCompareOpen(true)
  }

  const handleShowCodePreview = (versionId: string) => {
    setSelectedVersionForPreview(versionId)
    setCodePreviewOpen(true)
  }

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  if (!model) {
    return <Typography>Model not found</Typography>
  }

  if (editing) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', width: '100%', flexDirection: 'column' }}>
        {/* Top Info Bar */}
        <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderBottom: '1px solid #3f3f3f' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                Edit Model: {model.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modify your model architecture and save as a new version.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleSaveArchitecture}
              disabled={nodes.length === 0}
            >
              Save New Version
            </Button>
            <Button variant="outlined" onClick={handleCancel} startIcon={<ArrowBack />}>
              Cancel
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {validationErrors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Validation Errors:
              </Typography>
              {validationErrors.map((err, idx) => (
                <Typography key={idx} variant="caption" display="block">
                  • {err}
                </Typography>
              ))}
            </Alert>
          )}
        </Paper>

        {/* Visual Builder */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <VisualModelBuilder
            onSave={(newNodes, newEdges) => {
              setNodes(newNodes)
              setEdges(newEdges)
            }}
            initialNodes={nodes}
            initialEdges={edges}
          />
        </Box>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onClose={() => !saving && setShowSaveDialog(false)}>
          <DialogTitle>Save New Version</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <TextField
              fullWidth
              label="Version Notes"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe changes in this version..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => !saving && setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveModel} variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={24} /> : 'Save Version'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {model.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: {model.model_type}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={handleStartEditing}
        >
          Edit Model
        </Button>
      </Box>

      {model.description && (
        <Typography variant="body1" sx={{ mb: 3 }}>
          {model.description}
        </Typography>
      )}

      {/* Versions Tab */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Model Versions ({versions.length})
          </Typography>
          {versions.length >= 2 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Compare />}
              onClick={handleShowComparison}
            >
              Compare Versions
            </Button>
          )}
        </Box>

        {versions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No versions created yet. Click "Edit Model" to create one.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderBottom: '2px solid #3b82f6' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ffffff', background: 'rgba(59, 130, 246, 0.2)' }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ffffff', background: 'rgba(59, 130, 246, 0.2)' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ffffff', background: 'rgba(59, 130, 246, 0.2)' }}>Input Shape</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ffffff', background: 'rgba(59, 130, 246, 0.2)' }}>Layers</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ffffff', background: 'rgba(59, 130, 246, 0.2)' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version_number}</TableCell>
                    <TableCell>
                      {new Date(version.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {JSON.stringify(version.input_shape)}
                    </TableCell>
                    <TableCell>
                      {version.architecture?.layers?.length || 0}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedVersionId(version.id)
                            setTabIndex(1)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FileOpen />}
                          onClick={() => handleShowCodePreview(version.id)}
                        >
                          Code
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Version Details */}
      {selectedVersionId && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Version Details (v{versions.find((v) => v.id === selectedVersionId)?.version_number})
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2 }}>
            <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
              <Tab label="Architecture" />
              <Tab label="Analysis" />
            </Tabs>
          </Box>

          {/* Architecture View */}
          {tabIndex === 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Layers: {nodes.length > 0 ? nodes.length : 'Loading...'}
              </Typography>
              {nodes.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px solid #ddd' }}>
                  <Typography variant="caption" color="textSecondary">
                    Visual architecture view loaded. Total {nodes.length} layers configured.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Analysis View */}
          {tabIndex === 1 && nodes.length > 0 && (
            <ModelAnalysis nodes={nodes} modelName={model?.name || 'Model'} />
          )}
        </Paper>
      )}

      {/* Version Comparison Dialog */}
      <VersionComparison
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        versions={versions.map((v) => ({
          version_number: v.version_number,
          created_at: v.created_at,
          updated_at: undefined,
          notes: undefined,
          class_labels: undefined,
          segmentation_labels: undefined,
          input_shape: v.input_shape,
          output_shape: undefined,
          architecture: v.architecture,
        }))}
      />

      {/* Code Preview Dialog */}
      <CodePreview
        open={codePreviewOpen}
        onClose={() => setCodePreviewOpen(false)}
        versionId={selectedVersionForPreview}
        modelName={model.name}
      />
    </Box>
  )
}

export default ModelViewPage

