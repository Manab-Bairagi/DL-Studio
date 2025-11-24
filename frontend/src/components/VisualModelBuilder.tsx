import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow'
import { Box, Toolbar, Button, Tooltip, IconButton } from '@mui/material'
import { Delete, Undo, Redo, Save, ChevronLeft, ChevronRight } from '@mui/icons-material'
import LayerNode from './LayerNode'
import LayerPalette from './LayerPalette'
import LayerConfigPanel from './LayerConfigPanel'
import { layers } from '../utils/layerTypes'
import { calculateOutputShape } from '../utils/layerAutoConfig'
import 'reactflow/dist/style.css'

interface VisualModelBuilderProps {
  onSave: (nodes: Node[], edges: Edge[]) => void
  initialNodes?: Node[]
  initialEdges?: Edge[]
  initialInputShape?: number[]
}

const nodeTypes: NodeTypes = {
  layer: LayerNode,
}

const VisualModelBuilder: React.FC<VisualModelBuilderProps> = ({ 
  onSave, 
  initialNodes = [], 
  initialEdges = [], 
  initialInputShape = [1, 3, 224, 224],
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [paletteVisible, setPaletteVisible] = useState(true)
  const [layerCounter, setLayerCounter] = useState(() => {
    // Calculate next layer counter from existing nodes
    if (initialNodes.length === 0) return 0
    const maxId = Math.max(
      ...initialNodes.map(n => {
        const match = n.id.match(/layer_(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
    )
    return maxId + 1
  })
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [historyStep, setHistoryStep] = useState(-1)

  // Auto-save effect
  React.useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('builder_autosave', JSON.stringify({ nodes, edges }))
    }
  }, [nodes, edges])

  // Load auto-save on mount if no initial nodes
  React.useEffect(() => {
    if (initialNodes.length === 0) {
      const saved = localStorage.getItem('builder_autosave')
      if (saved) {
        try {
          const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved)
          setNodes(savedNodes)
          setEdges(savedEdges)
        } catch (e) {
          console.error('Failed to load auto-save', e)
        }
      }
    }
  }, [])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  /**
   * Calculate the output shape of layers connected to this node's inputs
   * For multi-input layers, returns array of shapes or concatenated shape
   */
  const getInputLayerOutputShapes = useCallback(
    (nodeId: string): number[] | undefined => {
      // Find all edges that connect to this node
      const incomingEdges = edges.filter((e) => e.target === nodeId)
      
      if (incomingEdges.length === 0) return initialInputShape

      // If single input, calculate normally
      if (incomingEdges.length === 1) {
        const incomingEdge = incomingEdges[0]
        const sourceNode = nodes.find((n) => n.id === incomingEdge.source)
        if (!sourceNode) return initialInputShape

        const layerType = sourceNode.data?.type
        const config = sourceNode.data?.config

        if (!layerType || !config) return initialInputShape

        const previousShape = getInputLayerOutputShapes(sourceNode.id)
        if (!previousShape) return initialInputShape

        return calculateOutputShape(previousShape, layerType, config)
      }

      // Multiple inputs: concatenate channel dimension
      let concatenatedChannels = 0
      const baseShape = [...initialInputShape]
      let height = baseShape[2] || 1
      let width = baseShape[3] || 1

      incomingEdges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        if (sourceNode) {
          const layerType = sourceNode.data?.type
          const config = sourceNode.data?.config

          if (layerType && config) {
            const previousShape = getInputLayerOutputShapes(sourceNode.id)
            if (previousShape) {
              const outputShape = calculateOutputShape(previousShape, layerType, config)
              if (outputShape.length >= 2) {
                concatenatedChannels += outputShape[1] || 1
                if (outputShape.length === 4) {
                  height = outputShape[2]
                  width = outputShape[3]
                }
              }
            }
          }
        }
      })

      return [baseShape[0], concatenatedChannels, height, width]
    },
    [nodes, edges, initialInputShape]
  )

  /**
   * Calculate the output shape of the previous layer in the chain
   * @deprecated Use getInputLayerOutputShapes instead
   */
  const getPreviousLayerOutputShape = useCallback(
    (nodeId: string): number[] | undefined => {
      return getInputLayerOutputShapes(nodeId)
    },
    [getInputLayerOutputShapes]
  )

  const pushToHistory = useCallback(() => {
    setHistory((h) => {
      const newHistory = h.slice(0, historyStep + 1)
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      })
      return newHistory
    })
    setHistoryStep((h) => h + 1)
  }, [nodes, edges, historyStep])

  // Ensure callbacks are set on all nodes (especially loaded ones)
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDelete: n.data.onDelete || handleNodeDelete,
          onConfigure: n.data.onConfigure || handleNodeConfigure,
        },
      }))
    )
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds))
    // Schedule push to history to happen after state updates
    setTimeout(() => pushToHistory(), 0)
  }, [pushToHistory])

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
    pushToHistory()
  }, [pushToHistory])

  const handleNodeConfigure = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    setConfigOpen(true)
  }, [])

  const handleDragStart = (event: React.DragEvent, layerType: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/reactflow', layerType)
  }

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()

    const type = event.dataTransfer.getData('application/reactflow')
    if (!type) return

    const layerDef = layers[type as keyof typeof layers]
    if (!layerDef) return

    const bounds = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top

    const newNode: Node = {
      id: `layer_${layerCounter}`,
      type: 'layer',
      position: { x, y },
      data: {
        label: `${type} ${layerCounter + 1}`,
        type,
        config: { ...layerDef.defaultParams, numInputs: 1 },
        numInputs: 1,
        isBlock: ['ConvBNReLU', 'ConvBNLeakyReLU', 'ResidualBlock'].includes(type),
        layerNames: type === 'ConvBNReLU' 
          ? ['Conv2d', 'BatchNorm', 'ReLU']
          : type === 'ConvBNLeakyReLU'
          ? ['Conv2d', 'BatchNorm', 'LeakyReLU']
          : type === 'ResidualBlock'
          ? ['Conv2d', 'BatchNorm', 'ReLU', 'Skip']
          : undefined,
        onDelete: handleNodeDelete,
        onConfigure: handleNodeConfigure,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setLayerCounter((c) => c + 1)
    pushToHistory()
  }, [layerCounter, handleNodeDelete, handleNodeConfigure, pushToHistory])



  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1
      const { nodes: prevNodes, edges: prevEdges } = history[prevStep]
      setNodes(JSON.parse(JSON.stringify(prevNodes)))
      setEdges(JSON.parse(JSON.stringify(prevEdges)))
      setHistoryStep(prevStep)
      setSelectedNodeId(null)
    }
  }, [history, historyStep, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1
      const { nodes: nextNodes, edges: nextEdges } = history[nextStep]
      setNodes(JSON.parse(JSON.stringify(nextNodes)))
      setEdges(JSON.parse(JSON.stringify(nextEdges)))
      setHistoryStep(nextStep)
      setSelectedNodeId(null)
    }
  }, [history, historyStep, setNodes, setEdges])

  // Handle edge changes including deletion with undo/redo
  const handleEdgesChangeWithUndo = useCallback((changes: any) => {
    changes.forEach((change: any) => {
      if (change.type === 'remove') {
        // Edge deletion - push to history
        setEdges((eds) => eds.filter((e) => e.id !== change.id))
        setTimeout(() => pushToHistory(), 0)
      }
    })
    onEdgesChange(changes)
  }, [onEdgesChange, pushToHistory])

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      handleNodeDelete(selectedNodeId)
    }
  }, [selectedNodeId, handleNodeDelete])

  const handleConfigSave = useCallback(
    (config: Record<string, any>) => {
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === selectedNode.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    config: config,
                    label: config.label || n.data.label,
                    numInputs: config.numInputs || 1,
                  },
                }
              : n
          )
        )
        pushToHistory()
      }
      setConfigOpen(false)
    },
    [selectedNode, setNodes, pushToHistory]
  )

  const handleSave = useCallback(() => {
    onSave(nodes, edges)
  }, [nodes, edges, onSave])

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
      {/* Layer Palette */}
      <Box 
        sx={{ 
          width: paletteVisible ? '180px' : '0px', 
          borderRight: paletteVisible ? '1px solid #2a2a2a' : 'none', 
          background: '#1a1a1a',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <LayerPalette onDragStart={handleDragStart} />
      </Box>
      
      {/* Collapse/Expand Button */}
      <IconButton
        onClick={() => setPaletteVisible(!paletteVisible)}
        sx={{
          position: 'absolute',
          left: paletteVisible ? '170px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          bgcolor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '0 8px 8px 0',
          transition: 'left 0.3s ease',
          '&:hover': { bgcolor: '#262626' },
        }}
      >
        {paletteVisible ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      {/* Main Builder Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Toolbar
          sx={{
            gap: 1,
            borderBottom: '1px solid #2a2a2a',
            backgroundColor: '#1a1a1a',
            minHeight: '48px !important',
            px: 2,
          }}
        >
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <Button
                size="small"
                variant="text"
                onClick={handleUndo}
                disabled={historyStep <= 0}
                sx={{ color: '#aaa', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' } }}
              >
                <Undo fontSize="small" sx={{ mr: 0.5 }} /> Undo
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <Button
                size="small"
                variant="text"
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                sx={{ color: '#aaa', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' } }}
              >
                <Redo fontSize="small" sx={{ mr: 0.5 }} /> Redo
              </Button>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Delete selected layer">
            <span>
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={handleDeleteSelected}
                disabled={!selectedNodeId}
                startIcon={<Delete />}
                sx={{ '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
              >
                Delete
              </Button>
            </span>
          </Tooltip>

          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            sx={{
              background: '#3b82f6',
              boxShadow: 'none',
              '&:hover': { background: '#2563eb', boxShadow: 'none' },
            }}
          >
            Save Architecture
          </Button>
        </Toolbar>

        {/* React Flow Canvas */}
        <Box sx={{ flex: 1, background: '#0f0f0f' }}>
          <ReactFlow
            nodes={nodes.map((n) => ({
              ...n,
              selected: n.id === selectedNodeId,
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={handleEdgesChangeWithUndo}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onSelectionChange={(selection) => {
              setSelectedNodeId(selection.nodes.length > 0 ? selection.nodes[0].id : null)
            }}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#2a2a2a" gap={20} />
            <Controls style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
            <MiniMap style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} nodeColor="#3b82f6" maskColor="rgba(0,0,0,0.6)" />
          </ReactFlow>
        </Box>
      </Box>

      <LayerConfigPanel
        node={selectedNode || null}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSave={handleConfigSave}
        previousLayerOutputShape={selectedNode ? getPreviousLayerOutputShape(selectedNode.id) : undefined}
      />
    </Box>
  )
}

export default VisualModelBuilder
