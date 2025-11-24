import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material'
import { PlayArrow, Pause, Refresh, ZoomIn, ZoomOut } from '@mui/icons-material'
import { LayerOutput } from '../api/inference'
import './NetworkDataFlowVisualizer.css'

interface NetworkDataFlowVisualizerProps {
  layerOutputs: LayerOutput[]
  inputImage?: string
}

interface LayerNode {
  id: string
  name: string
  type: string
  outputShape: number[]
  index: number
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  progress: number
  color: string
}

const NetworkDataFlowVisualizer: React.FC<NetworkDataFlowVisualizerProps> = ({
  layerOutputs,
  inputImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<LayerNode | null>(null)
  const [scale, setScale] = useState(1)
  const [nodes, setNodes] = useState<LayerNode[]>([])
  const particlesRef = useRef<Particle[]>([])
  
  // Constants
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 600
  const NODE_WIDTH = 60
  const NODE_HEIGHT = 60

  const getLayerColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      Conv2d: '#3b82f6', // Blue
      Linear: '#10b981', // Green
      Dense: '#10b981',
      BatchNorm2d: '#f59e0b', // Amber
      BatchNorm1d: '#f59e0b',
      ReLU: '#8b5cf6', // Purple
      Activation: '#8b5cf6',
      Pooling: '#ef4444', // Red
      MaxPool2d: '#ef4444',
      AvgPool2d: '#ef4444',
      Flatten: '#06b6d4', // Cyan
      Dropout: '#78716c', // Stone
      Input: '#64748b', // Slate
      Output: '#10b981', // Green
    }
    return colorMap[type] || '#9ca3af'
  }

  // Initialize nodes
  useEffect(() => {
    if (layerOutputs.length === 0) return

    const margin = 100
    const availableWidth = CANVAS_WIDTH - 2 * margin
    const spacing = availableWidth / (layerOutputs.length + 1)
    const centerY = CANVAS_HEIGHT / 2

    const newNodes: LayerNode[] = layerOutputs.map((layer, idx) => ({
      id: `layer-${idx}`,
      name: layer.layer_name,
      type: layer.layer_type,
      outputShape: layer.output_shape,
      index: idx,
      x: margin + (idx + 1) * spacing - NODE_WIDTH / 2,
      y: centerY - NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      color: getLayerColor(layer.layer_type),
    }))

    setNodes(newNodes)
  }, [layerOutputs])

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0f0f0f'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Apply zoom
      ctx.save()
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.scale(scale, scale)
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2)

      // Draw Input Node
      const inputX = 50
      const inputY = CANVAS_HEIGHT / 2 - 30
      drawNode(ctx, {
        id: 'input',
        name: 'Input',
        type: 'Input',
        outputShape: [],
        index: -1,
        x: inputX,
        y: inputY,
        width: 60,
        height: 60,
        color: '#64748b'
      }, hoveredNode?.id === 'input')

      // Draw Output Node
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1]
        const outputX = lastNode.x + lastNode.width + 80
        const outputY = CANVAS_HEIGHT / 2 - 30
        drawNode(ctx, {
          id: 'output',
          name: 'Output',
          type: 'Output',
          outputShape: [],
          index: -2,
          x: outputX,
          y: outputY,
          width: 60,
          height: 60,
          color: '#10b981'
        }, hoveredNode?.id === 'output')

        // Draw connection to output
        drawConnection(ctx, lastNode, { x: outputX, y: outputY, width: 60, height: 60 } as any)
      }

      // Draw Connections
      nodes.forEach((node, idx) => {
        if (idx > 0) {
          drawConnection(ctx, nodes[idx - 1], node)
        } else {
          // Connect input to first node
          drawConnection(ctx, { x: inputX, y: inputY, width: 60, height: 60 } as any, node)
        }
      })

      // Draw Nodes
      nodes.forEach(node => {
        drawNode(ctx, node, hoveredNode?.id === node.id)
      })

      // Manage and Draw Particles
      if (isAnimating) {
        updateParticles()
        drawParticles(ctx)
      }

      ctx.restore()

      // Draw Tooltip (not affected by scale for readability, but position needs calculation)
      if (hoveredNode) {
        drawTooltip(ctx, hoveredNode)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [nodes, isAnimating, hoveredNode, scale])

  const drawNode = (ctx: CanvasRenderingContext2D, node: LayerNode, isHovered: boolean) => {
    // Glow effect if hovered
    if (isHovered) {
      ctx.shadowColor = node.color
      ctx.shadowBlur = 20
    } else {
      ctx.shadowBlur = 0
    }

    // Node Body
    ctx.fillStyle = node.color
    ctx.beginPath()
    ctx.roundRect(node.x, node.y, node.width, node.height, 8)
    ctx.fill()

    // Border
    ctx.strokeStyle = isHovered ? '#fff' : '#1a1a1a'
    ctx.lineWidth = isHovered ? 2 : 1
    ctx.stroke()

    // Reset shadow
    ctx.shadowBlur = 0

    // Text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px Inter, Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Layer Type Abbreviation
    const abbr = node.type.substring(0, 4).toUpperCase()
    ctx.fillText(abbr, node.x + node.width / 2, node.y + node.height / 2)
    
    // Index badge
    if (node.index >= 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.beginPath()
      ctx.arc(node.x + node.width - 10, node.y + 10, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '8px Inter, Arial'
      ctx.fillText(`${node.index + 1}`, node.x + node.width - 10, node.y + 10)
    }
  }

  const drawConnection = (ctx: CanvasRenderingContext2D, from: LayerNode, to: LayerNode) => {
    const startX = from.x + from.width
    const startY = from.y + from.height / 2
    const endX = to.x
    const endY = to.y + to.height / 2

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    
    // Curved line
    const cp1x = startX + (endX - startX) / 2
    const cp1y = startY
    const cp2x = startX + (endX - startX) / 2
    const cp2y = endY
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
    ctx.stroke()

    // Add particles if animating
    if (isAnimating && Math.random() < 0.05) {
      particlesRef.current.push({
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        speed: 0.01 + Math.random() * 0.01,
        progress: 0,
        color: from.color || '#f97316'
      })
    }
  }

  const updateParticles = () => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i]
      p.progress += p.speed
      if (p.progress >= 1) {
        particlesRef.current.splice(i, 1)
      }
    }
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(p => {
      const startX = p.x
      const startY = p.y
      const endX = p.targetX
      const endY = p.targetY
      
      const cp1x = startX + (endX - startX) / 2
      const cp1y = startY
      const cp2x = startX + (endX - startX) / 2
      const cp2y = endY

      // Calculate position on bezier curve
      const t = p.progress
      const cx = Math.pow(1-t, 3)*startX + 3*Math.pow(1-t, 2)*t*cp1x + 3*(1-t)*Math.pow(t, 2)*cp2x + Math.pow(t, 3)*endX
      const cy = Math.pow(1-t, 3)*startY + 3*Math.pow(1-t, 2)*t*cp1y + 3*(1-t)*Math.pow(t, 2)*cp2y + Math.pow(t, 3)*endY

      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  }

  const drawTooltip = (ctx: CanvasRenderingContext2D, node: LayerNode) => {
    const tx = (node.x + node.width/2 - CANVAS_WIDTH/2) * scale + CANVAS_WIDTH/2
    const ty = (node.y - 10 - CANVAS_HEIGHT/2) * scale + CANVAS_HEIGHT/2

    const text = `${node.name} (${node.type})`
    const subtext = node.outputShape.length ? `Output: ${node.outputShape.join('×')}` : ''
    
    ctx.font = '12px Inter, Arial'
    const metrics = ctx.measureText(text)
    const width = Math.max(metrics.width, ctx.measureText(subtext).width) + 20
    const height = subtext ? 40 : 25
    
    const x = tx - width / 2
    const y = ty - height - 10

    // Tooltip bg
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)'
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 4)
    ctx.fill()
    ctx.stroke()

    // Text
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(text, tx, y + 6)
    if (subtext) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px Inter, Arial'
      ctx.fillText(subtext, tx, y + 22)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width)
    const mouseY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)

    // Convert mouse pos to world space
    const worldX = (mouseX - CANVAS_WIDTH/2) / scale + CANVAS_WIDTH/2
    const worldY = (mouseY - CANVAS_HEIGHT/2) / scale + CANVAS_HEIGHT/2

    // Check collision
    const hovered = nodes.find(node => 
      worldX >= node.x && worldX <= node.x + node.width &&
      worldY >= node.y && worldY <= node.y + node.height
    )

    // Also check input/output
    if (!hovered) {
      const inputX = 50
      const inputY = CANVAS_HEIGHT / 2 - 30
      if (worldX >= inputX && worldX <= inputX + 60 && worldY >= inputY && worldY <= inputY + 60) {
        setHoveredNode({
          id: 'input',
          name: 'Input',
          type: 'Input',
          outputShape: [],
          index: -1,
          x: inputX,
          y: inputY,
          width: 60,
          height: 60,
          color: '#64748b'
        })
        return
      }
      
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1]
        const outputX = lastNode.x + lastNode.width + 80
        const outputY = CANVAS_HEIGHT / 2 - 30
        if (worldX >= outputX && worldX <= outputX + 60 && worldY >= outputY && worldY <= outputY + 60) {
          setHoveredNode({
            id: 'output',
            name: 'Output',
            type: 'Output',
            outputShape: [],
            index: -2,
            x: outputX,
            y: outputY,
            width: 60,
            height: 60,
            color: '#10b981'
          })
          return
        }
      }
    }

    setHoveredNode(hovered || null)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                🔄 Network Flow
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={isAnimating ? "Pause Animation" : "Play Animation"}>
                  <IconButton 
                    onClick={() => setIsAnimating(!isAnimating)}
                    sx={{ color: isAnimating ? '#f97316' : '#9ca3af', bgcolor: 'rgba(255,255,255,0.05)' }}
                    size="small"
                  >
                    {isAnimating ? <Pause /> : <PlayArrow />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset View">
                  <IconButton 
                    onClick={() => setScale(1)}
                    sx={{ color: '#9ca3af', bgcolor: 'rgba(255,255,255,0.05)' }}
                    size="small"
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
               <IconButton onClick={() => setScale(s => Math.max(0.5, s - 0.1))} size="small" sx={{ color: '#9ca3af' }}>
                 <ZoomOut />
               </IconButton>
               <Typography variant="caption" sx={{ color: '#666', alignSelf: 'center', minWidth: 40, textAlign: 'center' }}>
                 {Math.round(scale * 100)}%
               </Typography>
               <IconButton onClick={() => setScale(s => Math.min(2, s + 0.1))} size="small" sx={{ color: '#9ca3af' }}>
                 <ZoomIn />
               </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#0f0f0f',
              border: '1px solid #333',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              mb: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                cursor: hoveredNode ? 'pointer' : 'default',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredNode(null)}
            />
          </Box>

          {/* Legend */}
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#e5e7eb' }}>
              Layer Type Legend
            </Typography>
            <Grid container spacing={2}>
              {[
                { type: 'Conv2d', color: '#3b82f6' },
                { type: 'Linear', color: '#10b981' },
                { type: 'BatchNorm', color: '#f59e0b' },
                { type: 'Activation', color: '#8b5cf6' },
                { type: 'Pooling', color: '#ef4444' },
                { type: 'Flatten', color: '#06b6d4' },
              ].map((item) => (
                <Grid item xs={6} sm={4} md={2} key={item.type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 8px ${item.color}40`
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>{item.type}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NetworkDataFlowVisualizer
