import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material'
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
}

const NetworkDataFlowVisualizer: React.FC<NetworkDataFlowVisualizerProps> = ({
  layerOutputs,
  inputImage,
}) => {
  const [isAnimating, setIsAnimating] = useState(true)
  const [canvasWidth] = useState(1200)
  const [canvasHeight] = useState(600)
  const [nodes, setNodes] = useState<LayerNode[]>([])

  // Calculate layout on mount and when layers change
  useEffect(() => {
    calculateLayout()
  }, [layerOutputs])

  const calculateLayout = () => {
    if (layerOutputs.length === 0) return

    const margin = 80
    const nodeWidth = 60
    const nodeHeight = 60
    const spacing = (canvasWidth - 2 * margin) / (layerOutputs.length + 1)
    const centerY = canvasHeight / 2

    const layoutNodes: LayerNode[] = layerOutputs.map((layer, idx) => ({
      id: `layer-${idx}`,
      name: layer.layer_name,
      type: layer.layer_type,
      outputShape: layer.output_shape,
      index: idx,
      x: margin + (idx + 1) * spacing - nodeWidth / 2,
      y: centerY - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    }))

    setNodes(layoutNodes)
  }

  const getLayerColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      Conv2d: '#2196F3',
      Linear: '#4CAF50',
      Dense: '#4CAF50',
      BatchNorm2d: '#FF9800',
      BatchNorm1d: '#FF9800',
      ReLU: '#9C27B0',
      Activation: '#9C27B0',
      Pooling: '#F44336',
      MaxPool2d: '#F44336',
      AvgPool2d: '#F44336',
      Flatten: '#00BCD4',
      Dropout: '#795548',
      Input: '#607D8B',
      Output: '#4CAF50',
    }
    return colorMap[type] || '#9E9E9E'
  }

  const drawNetwork = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw input
    if (inputImage) {
      const inputX = 30
      const inputY = canvasHeight / 2 - 30
      ctx.fillStyle = '#607D8B'
      ctx.fillRect(inputX, inputY, 60, 60)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Input', inputX + 30, inputY + 35)
    }

    // Draw connections with animation
    nodes.forEach((node, idx) => {
      if (idx > 0) {
        const fromNode = nodes[idx - 1]
        const toNode = node

        // Draw connection line
        ctx.strokeStyle = '#BDBDBD'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(fromNode.x + fromNode.width, fromNode.y + fromNode.height / 2)
        ctx.lineTo(toNode.x, toNode.y + toNode.height / 2)
        ctx.stroke()

        // Draw animated data flow circles
        if (isAnimating) {
          const now = Date.now()
          const duration = 2000 // 2 seconds per flow
          const progress = (now % duration) / duration

          const circleX =
            fromNode.x + fromNode.width + (toNode.x - (fromNode.x + fromNode.width)) * progress
          const circleY = fromNode.y + fromNode.height / 2

          // Draw flowing circle
          ctx.fillStyle = '#FF5722'
          ctx.beginPath()
          ctx.arc(circleX, circleY, 4, 0, Math.PI * 2)
          ctx.fill()

          // Add glow effect
          ctx.shadowColor = '#FF5722'
          ctx.shadowBlur = 10
          ctx.strokeStyle = 'rgba(255, 87, 34, 0.5)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(circleX, circleY, 6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }
    })

    // Draw layer nodes
    nodes.forEach((node) => {
      const color = getLayerColor(node.type)

      // Draw node rectangle
      ctx.fillStyle = color
      ctx.fillRect(node.x, node.y, node.width, node.height)

      // Draw border
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.strokeRect(node.x, node.y, node.width, node.height)

      // Draw text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Layer number
      ctx.fillText(`L${node.index + 1}`, node.x + node.width / 2, node.y + node.height / 3)

      // Layer type abbreviation
      const typeAbbr = node.type.substring(0, 4).toUpperCase()
      ctx.font = '9px Arial'
      ctx.fillText(typeAbbr, node.x + node.width / 2, node.y + (2 * node.height) / 3)
    })

    // Draw output
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1]
      const outputX = lastNode.x + lastNode.width + 80
      const outputY = canvasHeight / 2 - 30

      // Draw connection to output
      ctx.strokeStyle = '#BDBDBD'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(lastNode.x + lastNode.width, lastNode.y + lastNode.height / 2)
      ctx.lineTo(outputX, outputY + 30)
      ctx.stroke()

      // Draw animated flow to output
      if (isAnimating) {
        const now = Date.now()
        const duration = 2000
        const progress = (now % duration) / duration

        const circleX = lastNode.x + lastNode.width + (outputX - (lastNode.x + lastNode.width)) * progress
        const circleY = lastNode.y + lastNode.height / 2 + (outputY + 30 - (lastNode.y + lastNode.height / 2)) * progress

        ctx.fillStyle = '#FF5722'
        ctx.beginPath()
        ctx.arc(circleX, circleY, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowColor = '#FF5722'
        ctx.shadowBlur = 10
        ctx.strokeStyle = 'rgba(255, 87, 34, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(circleX, circleY, 6, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Draw output node
      ctx.fillStyle = '#4CAF50'
      ctx.fillRect(outputX, outputY, 60, 60)
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.strokeRect(outputX, outputY, 60, 60)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Output', outputX + 30, outputY + 30)
    }

    // Request next frame if animating
    if (isAnimating) {
      requestAnimationFrame(() => drawNetwork(canvas))
    }
  }

  const canvasRef = React.useCallback((canvas: HTMLCanvasElement | null) => {
    drawNetwork(canvas)
  }, [nodes, isAnimating, canvasWidth, canvasHeight])

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              🔄 Network Data Flow Animation
            </Typography>
            <Button
              variant={isAnimating ? 'contained' : 'outlined'}
              onClick={() => setIsAnimating(!isAnimating)}
              size="small"
            >
              {isAnimating ? 'Pause' : 'Play'}
            </Button>
          </Box>

          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
            Watch how data flows through each layer of your neural network. Orange circles represent data flowing from input to output.
          </Typography>

          {/* Canvas */}
          <Box
            sx={{
              backgroundColor: '#fafafa',
              border: '2px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'auto',
              mb: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Box>

          {/* Legend */}
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Layer Type Legend
            </Typography>
            <Grid container spacing={2}>
              {[
                { type: 'Conv2d', color: '#2196F3' },
                { type: 'Linear', color: '#4CAF50' },
                { type: 'BatchNorm', color: '#FF9800' },
                { type: 'Activation', color: '#9C27B0' },
                { type: 'Pooling', color: '#F44336' },
                { type: 'Other', color: '#9E9E9E' },
              ].map((item) => (
                <Grid item xs={6} sm={4} md={2} key={item.type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: item.color,
                        borderRadius: 0.5,
                      }}
                    />
                    <Typography variant="caption">{item.type}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Layer Details */}
          <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Layer Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nodes.map((node) => (
                <Box
                  key={node.id}
                  sx={{
                    p: 1,
                    backgroundColor: 'white',
                    borderLeft: `4px solid ${getLayerColor(node.type)}`,
                    borderRadius: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Layer {node.index + 1}: {node.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {node.type} • Output: {node.outputShape.join(' × ')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  )
}

export default NetworkDataFlowVisualizer
