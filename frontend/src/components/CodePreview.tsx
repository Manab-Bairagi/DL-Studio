import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material'
import { Close, Download, ContentCopy } from '@mui/icons-material'
import Editor from '@monaco-editor/react'
import apiClient from '../api/client'

interface CodePreviewProps {
  open: boolean
  onClose: () => void
  versionId: string
  modelName: string
}

const CodePreview: React.FC<CodePreviewProps> = ({ open, onClose, versionId, modelName }) => {
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && versionId) {
      fetchCode()
    }
  }, [open, versionId])

  const fetchCode = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(`/export/${versionId}/code`)
      setCode(response.data.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      const response = await apiClient.get(`/export/${versionId}/python`, {
        responseType: 'blob',
      })

      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${modelName}_model.py`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { height: '90vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <div>PyTorch Model Code Preview</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>{modelName}</div>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {code && (
              <>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton size="small" onClick={handleCopy}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as .py file">
                  <IconButton size="small" onClick={handleDownload}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Button onClick={onClose} sx={{ minWidth: 0, p: 0 }}>
              <Close />
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : code ? (
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 12,
              lineNumbers: 'on',
              glyphMargin: false,
            }}
          />
        ) : (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">No code available for this version</Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CodePreview
