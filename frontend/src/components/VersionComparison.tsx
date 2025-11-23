import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
} from '@mui/material'
import { Close } from '@mui/icons-material'

interface VersionInfo {
  version_number: number
  created_at: string
  updated_at?: string
  notes?: string
  class_labels?: string[]
  segmentation_labels?: string[]
  input_shape: number[]
  output_shape?: number[]
  architecture: {
    layers: Array<{ type: string; params: Record<string, any> }>
  }
}

interface VersionComparisonProps {
  open: boolean
  onClose: () => void
  versions: VersionInfo[]
}

const VersionComparison: React.FC<VersionComparisonProps> = ({ open, onClose, versions }) => {
  const [selectedVersions, setSelectedVersions] = useState<number[]>([])

  useEffect(() => {
    // Auto-select last two versions for comparison
    if (versions.length >= 2) {
      setSelectedVersions([versions[versions.length - 2].version_number, versions[versions.length - 1].version_number])
    } else if (versions.length === 1) {
      setSelectedVersions([versions[0].version_number])
    }
  }, [versions, open])

  const getSelectedVersionData = () => {
    return versions.filter((v) => selectedVersions.includes(v.version_number))
  }

  const getArchitectureSummary = (version: VersionInfo) => {
    const layerCount = version.architecture.layers.length
    const layerTypes = version.architecture.layers.map((l) => l.type)
    const uniqueTypes = [...new Set(layerTypes)]
    return {
      total: layerCount,
      unique: uniqueTypes,
    }
  }

  const selectedData = getSelectedVersionData()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Version Comparison</Typography>
          <Button onClick={onClose} sx={{ minWidth: 0, p: 0 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Version Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Select versions to compare:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {versions.map((version) => (
                <Chip
                  key={version.version_number}
                  label={`v${version.version_number}`}
                  onClick={() => {
                    setSelectedVersions((prev) =>
                      prev.includes(version.version_number)
                        ? prev.filter((v) => v !== version.version_number)
                        : [...prev, version.version_number]
                    )
                  }}
                  color={selectedVersions.includes(version.version_number) ? 'primary' : 'default'}
                  variant={selectedVersions.includes(version.version_number) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          {/* Comparison Table */}
          {selectedData.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Detailed Comparison:
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Property</TableCell>
                      {selectedData.map((version) => (
                        <TableCell key={version.version_number} sx={{ fontWeight: 'bold' }}>
                          Version {version.version_number}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Created At */}
                    <TableRow>
                      <TableCell>Created</TableCell>
                      {selectedData.map((version) => (
                        <TableCell key={version.version_number}>
                          {new Date(version.created_at).toLocaleDateString()}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Input Shape */}
                    <TableRow>
                      <TableCell>Input Shape</TableCell>
                      {selectedData.map((version) => (
                        <TableCell key={version.version_number}>{JSON.stringify(version.input_shape)}</TableCell>
                      ))}
                    </TableRow>

                    {/* Output Shape */}
                    <TableRow>
                      <TableCell>Output Shape</TableCell>
                      {selectedData.map((version) => (
                        <TableCell key={version.version_number}>
                          {version.output_shape ? JSON.stringify(version.output_shape) : 'Not specified'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Layer Count */}
                    <TableRow>
                      <TableCell>Total Layers</TableCell>
                      {selectedData.map((version) => {
                        const summary = getArchitectureSummary(version)
                        return <TableCell key={version.version_number}>{summary.total}</TableCell>
                      })}
                    </TableRow>

                    {/* Layer Types */}
                    <TableRow>
                      <TableCell>Layer Types</TableCell>
                      {selectedData.map((version) => {
                        const summary = getArchitectureSummary(version)
                        return (
                          <TableCell key={version.version_number}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {summary.unique.map((type) => (
                                <Chip key={type} label={type} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                        )
                      })}
                    </TableRow>

                    {/* Class Labels */}
                    {selectedData.some((v) => v.class_labels?.length) && (
                      <TableRow>
                        <TableCell>Classes</TableCell>
                        {selectedData.map((version) => (
                          <TableCell key={version.version_number}>
                            {version.class_labels?.length ? (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {version.class_labels.map((label) => (
                                  <Chip key={label} label={label} size="small" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Not specified
                              </Typography>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}

                    {/* Segmentation Labels */}
                    {selectedData.some((v) => v.segmentation_labels?.length) && (
                      <TableRow>
                        <TableCell>Segmentation Classes</TableCell>
                        {selectedData.map((version) => (
                          <TableCell key={version.version_number}>
                            {version.segmentation_labels?.length ? (
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {version.segmentation_labels.map((label) => (
                                  <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Not specified
                              </Typography>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}

                    {/* Notes */}
                    <TableRow>
                      <TableCell>Notes</TableCell>
                      {selectedData.map((version) => (
                        <TableCell key={version.version_number}>{version.notes || '—'}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Architecture Details */}
          {selectedData.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Architecture Layers:
              </Typography>
              <Grid container spacing={2}>
                {selectedData.map((version) => (
                  <Grid item xs={12} md={6} key={version.version_number}>
                    <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Version {version.version_number}
                      </Typography>
                      <Box component="ol" sx={{ pl: 2, m: 0 }}>
                        {version.architecture.layers.map((layer, idx) => (
                          <li key={idx}>
                            <Typography variant="caption">
                              <strong>{layer.type}</strong>({Object.entries(layer.params)
                                .map(([k, v]) => `${k}=${v}`)
                                .join(', ')})
                            </Typography>
                          </li>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default VersionComparison
