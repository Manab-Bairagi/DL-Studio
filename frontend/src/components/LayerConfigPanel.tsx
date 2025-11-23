import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Chip,
} from '@mui/material'
import { Close, AutoFixHigh } from '@mui/icons-material'
import { Node } from 'reactflow'
import { layers } from '../utils/layerTypes'
import { suggestLayerConfig, calculateOutputShape, getConfigChangeDescription } from '../utils/layerAutoConfig'

interface LayerConfigPanelProps {
  node: Node | null
  open: boolean
  onClose: () => void
  onSave: (config: Record<string, any>) => void
  previousLayerOutputShape?: number[]
}

const LayerConfigPanel: React.FC<LayerConfigPanelProps> = ({
  node,
  open,
  onClose,
  onSave,
  previousLayerOutputShape,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(node?.data?.config || {})
  const [suggestedConfig, setSuggestedConfig] = useState<Record<string, any> | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)

  // Update config when node changes
  useEffect(() => {
    if (node?.data?.config) {
      setConfig({ ...node.data.config })
      setShowSuggestion(false)
      setSuggestedConfig(null)

      // Generate suggestion if previous layer output shape is provided
      if (previousLayerOutputShape) {
        const layerType = node.data?.type
        const suggested = suggestLayerConfig(layerType, previousLayerOutputShape, {
          ...node.data.config,
        })

        // Check if there are actual changes
        const hasChanges = JSON.stringify(suggested) !== JSON.stringify(node.data.config)
        if (hasChanges) {
          setSuggestedConfig(suggested)
          setShowSuggestion(true)
        }
      }
    }
  }, [node, previousLayerOutputShape])

  if (!node) return null

  const layerType = node.data?.type
  const layerDef = layers[layerType as keyof typeof layers]

  if (!layerDef) return null

  const handleConfigChange = (key: string, value: any) => {
    setConfig({
      ...config,
      [key]: value,
    })
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const handleApplySuggestion = () => {
    if (suggestedConfig) {
      setConfig(suggestedConfig)
      setShowSuggestion(false)
    }
  }

  const changes = suggestedConfig ? getConfigChangeDescription(node?.data?.type, config, suggestedConfig) : []

  const handleArrayChange = (key: string, index: number, value: any) => {
    const arr = Array.isArray(config[key]) ? [...config[key]] : []
    arr[index] = parseInt(value)
    setConfig({
      ...config,
      [key]: arr,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{layerType} Configuration</Typography>
          <Button onClick={onClose} sx={{ minWidth: 0, p: 0 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Auto-config Suggestion */}
          {showSuggestion && suggestedConfig && (
            <Alert severity="info">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    💡 Auto-Configuration Suggested
                  </Typography>
                  <Stack spacing={0.5} sx={{ mb: 1 }}>
                    {changes.map((change, idx) => (
                      <Typography key={idx} variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {change}
                      </Typography>
                    ))}
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<AutoFixHigh />}
                      onClick={handleApplySuggestion}
                    >
                      Apply
                    </Button>
                    <Button size="small" onClick={() => setShowSuggestion(false)}>
                      Dismiss
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Alert>
          )}
          <TextField
            fullWidth
            label="Layer Label"
            value={config.label || node.data?.label || layerType}
            onChange={(e) => handleConfigChange('label', e.target.value)}
            size="small"
          />

          {/* Multi-Input Configuration */}
          <FormControl fullWidth size="small">
            <InputLabel>Number of Inputs</InputLabel>
            <Select
              value={config.numInputs || node.data?.numInputs || 1}
              label="Number of Inputs"
              onChange={(e) => handleConfigChange('numInputs', e.target.value)}
            >
              <MenuItem value={1}>Single Input (Sequential)</MenuItem>
              <MenuItem value={2}>2 Inputs (Dual Branch)</MenuItem>
              <MenuItem value={3}>3 Inputs (Multi-Branch)</MenuItem>
              <MenuItem value={4}>4 Inputs (Hybrid)</MenuItem>
            </Select>
          </FormControl>

          {config.numInputs && config.numInputs > 1 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              💡 This layer accepts {config.numInputs} inputs. You can connect multiple layers to this node for hybrid architectures.
            </Alert>
          )}

          {layerDef.paramFields.map((field) => {
            if (field.type === 'array') {
              const arr = config[field.name] || field.defaultValue || []
              return (
                <Box key={field.name}>
                  <Typography variant="subtitle2">{field.label}</Typography>
                  <Grid container spacing={1}>
                    {arr.map((value: any, idx: number) => (
                      <Grid item xs={6} key={idx}>
                        <TextField
                          fullWidth
                          type="number"
                          size="small"
                          value={value}
                          onChange={(e) => handleArrayChange(field.name, idx, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )
            } else if (field.type === 'select') {
              return (
                <FormControl fullWidth key={field.name} size="small">
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={config[field.name] || field.defaultValue || ''}
                    label={field.label}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                  >
                    {field.options?.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            } else {
              return (
                <TextField
                  key={field.name}
                  fullWidth
                  label={field.label}
                  type={field.type}
                  value={config[field.name] !== undefined ? config[field.name] : field.defaultValue || ''}
                  onChange={(e) => handleConfigChange(field.name, e.target.value)}
                  size="small"
                  inputProps={{
                    step: field.type === 'number' ? 'any' : undefined,
                  }}
                />
              )
            }
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LayerConfigPanel
