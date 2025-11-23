import React, { useCallback, useState } from 'react'
import { Node, Edge } from 'reactflow'
import {
  Box,
  Toolbar,
  Button,
  Tooltip,
  IconButton,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Undo,
  Redo,
  Save,
  Refresh,
  Info,
} from '@mui/icons-material'
import VisualModelBuilder from './VisualModelBuilder'
import { useUndoRedo } from '../hooks/useUndoRedo'
import { keyframes } from '@mui/material/styles'

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

interface ModelBuilderContainerProps {
  onSave: (nodes: Node[], edges: Edge[]) => void
  initialNodes?: Node[]
  initialEdges?: Edge[]
  initialInputShape?: number[]
  outputConfig?: {
    classes: string[]
    segmentationClasses: string[]
  }
  onOutputConfigChange?: (config: { classes: string[]; segmentationClasses: string[] }) => void
}

export const ModelBuilderContainer: React.FC<ModelBuilderContainerProps> = ({
  onSave,
  initialNodes = [],
  initialEdges = [],
  initialInputShape = [1, 3, 224, 224],
  outputConfig,
  onOutputConfigChange,
}) => {
  const [infoOpen, setInfoOpen] = useState(false)
  const [lastSavedState, setLastSavedState] = useState({ nodes: initialNodes, edges: initialEdges })
  
  const initialState = { nodes: initialNodes, edges: initialEdges }
  const { state, setState, undo, redo, reset, canUndo, canRedo } = useUndoRedo(initialState)

  const handleModelChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setState({ nodes, edges })
  }, [setState])

  const handleSave = useCallback(() => {
    onSave(state.nodes, state.edges)
    setLastSavedState({ ...state })
  }, [state, onSave])

  const handleReset = useCallback(() => {
    reset(initialState)
  }, [reset, initialState])

  const isSaved = JSON.stringify(state) === JSON.stringify(lastSavedState)
  const isEmpty = state.nodes.length === 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Enhanced Toolbar */}
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderBottom: '1px solid #3f3f3f',
          borderRadius: '8px 8px 0 0',
          mb: 1,
          gap: 1,
          animation: `${slideDown} 0.4s ease`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '12px 16px',
          minHeight: 'auto',
        }}
      >
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', flex: 1, minWidth: 'fit-content' }}>
          Visual Model Builder
        </Typography>

        <Divider orientation="vertical" sx={{ height: 28, borderColor: '#3f3f3f', mx: 1 }} />

        {/* Undo/Redo */}
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton
              size="small"
              onClick={undo}
              disabled={!canUndo}
              sx={{
                color: canUndo ? '#3b82f6' : '#757575',
                border: '1px solid #3f3f3f',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderColor: '#3b82f6',
                },
              }}
            >
              <Undo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo (Ctrl+Y)">
          <span>
            <IconButton
              size="small"
              onClick={redo}
              disabled={!canRedo}
              sx={{
                color: canRedo ? '#8b5cf6' : '#757575',
                border: '1px solid #3f3f3f',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: '#8b5cf6',
                },
              }}
            >
              <Redo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" sx={{ height: 28, borderColor: '#3f3f3f', mx: 1 }} />

        {/* Reset Button */}
        <Tooltip title="Reset to initial state">
          <IconButton
            size="small"
            onClick={handleReset}
            disabled={isEmpty}
            sx={{
              color: isEmpty ? '#757575' : '#f97316',
              border: '1px solid #3f3f3f',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                background: 'rgba(249, 115, 22, 0.1)',
                borderColor: '#f97316',
              },
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ height: 28, borderColor: '#3f3f3f', mx: 1 }} />

        {/* Info Button */}
        <Tooltip title="Model information">
          <IconButton
            size="small"
            onClick={() => setInfoOpen(true)}
            sx={{
              color: '#3b82f6',
              border: '1px solid #3f3f3f',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
              },
            }}
          >
            <Info fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ height: 28, borderColor: '#3f3f3f', mx: 1 }} />

        {/* Save Button */}
        <Tooltip title={isSaved ? 'All changes saved' : 'Save model'}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{
              background: isSaved
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: `0 4px 12px ${isSaved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${isSaved ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
              },
            }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </Tooltip>

        {/* Status Indicator */}
        {!isSaved && (
          <Typography variant="caption" sx={{ color: '#f97316', ml: 1, fontWeight: 500 }}>
            Unsaved changes
          </Typography>
        )}
      </Toolbar>

      {/* Builder Canvas */}
      <Box sx={{ flex: 1, borderRadius: '0 0 8px 8px', overflow: 'hidden', border: '1px solid #3f3f3f', background: '#0f0f0f' }}>
        <VisualModelBuilder
          onSave={handleModelChange}
          initialNodes={state.nodes}
          initialEdges={state.edges}
          initialInputShape={initialInputShape}
          outputConfig={outputConfig}
          onOutputConfigChange={onOutputConfigChange}
        />
      </Box>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm">
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          Model Information
        </DialogTitle>
        <DialogContent sx={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', pt: 2 }}>
          <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3b82f6', mb: 0.5 }}>
                Total Layers: {state.nodes.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#8b5cf6', mb: 0.5 }}>
                Connections: {state.edges.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10b981', mb: 0.5 }}>
                Undo Steps: {canUndo ? 'Available' : 'None'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f97316', mb: 0.5 }}>
                Redo Steps: {canRedo ? 'Available' : 'None'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', p: 2 }}>
          <Button onClick={() => setInfoOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModelBuilderContainer
