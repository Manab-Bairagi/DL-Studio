import apiClient from './client'
import { Node, Edge } from 'reactflow'

export interface ModelArchitecture {
  layers: Array<{
    id: string
    type: string
    config: Record<string, any>
  }>
  edges: Array<{
    source: string
    target: string
  }>
}

export interface SaveModelVersionRequest {
  architecture: {
    layers?: Array<{
      type: string
      params: Record<string, any>
    }>
    nodes?: Node[]
    edges?: Edge[]
  }
  custom_loss?: string
  input_shape: number[]
  output_shape?: number[]
  notes?: string
  class_labels?: string[]
  segmentation_labels?: string[]
  layer_auto_config?: boolean
}

export const modelBuilderApi = {
  // Create a new model
  createModel: async (
    name: string,
    description: string,
    modelType: string
  ): Promise<string> => {
    const response = await apiClient.post('/models', {
      name,
      description,
      model_type: modelType,
    })
    return response.data.id
  },

  // Save a model version from the builder
  saveModelVersion: async (
    modelId: string,
    nodes: Node[],
    edges: Edge[],
    inputShape: number[],
    notes?: string,
    classLabels?: string[],
    segmentationLabels?: string[],
    layerAutoConfig?: boolean
  ): Promise<any> => {
    // Convert React Flow nodes to layer format
    const layers = nodes.map((node) => ({
      type: node.data.type,
      params: node.data.config || {},
    }))

    const payload: SaveModelVersionRequest = {
      architecture: { 
        layers,
        nodes,
        edges
      },
      input_shape: inputShape,
      notes: notes,
      class_labels: classLabels,
      segmentation_labels: segmentationLabels,
      layer_auto_config: layerAutoConfig,
    }

    const response = await apiClient.post(
      `/models/${modelId}/versions`,
      payload
    )
    return response.data
  },

  // Validate architecture
  validateArchitecture: async (
    nodes: Node[],
    edges: Edge[]
  ): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = []

    // Check if there are any nodes
    if (nodes.length === 0) {
      errors.push('Model must have at least one layer')
    }

    // Check for disconnected components
    const nodeIds = new Set(nodes.map((n) => n.id))

    // Check that all edge connections point to valid nodes
    edges.forEach((edge: Edge) => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Invalid source node: ${edge.source}`)
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Invalid target node: ${edge.target}`)
      }
    })

    // Validate layer parameters
    nodes.forEach((node) => {
      const config = node.data?.config || {}
      const type = node.data?.type

      // Validate Conv2d
      if (type === 'Conv2d') {
        if (config.in_channels <= 0) errors.push(`${node.id}: in_channels must be > 0`)
        if (config.out_channels <= 0) errors.push(`${node.id}: out_channels must be > 0`)
        if (config.kernel_size <= 0) errors.push(`${node.id}: kernel_size must be > 0`)
      }

      // Validate Dense/Linear
      if (type === 'Dense' || type === 'Linear') {
        if (config.in_features <= 0) errors.push(`${node.id}: in_features must be > 0`)
        if (config.out_features <= 0) errors.push(`${node.id}: out_features must be > 0`)
      }

      // Validate Dropout
      if (type === 'Dropout') {
        if (config.p < 0 || config.p > 1) {
          errors.push(`${node.id}: dropout probability must be between 0 and 1`)
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  // Get model architecture
  getModelArchitecture: async (modelId: string, versionId: string): Promise<any> => {
    const response = await apiClient.get(`/models/${modelId}/versions/${versionId}`)
    return response.data
  },

  // Deserialize architecture to React Flow nodes and edges
  deserializeArchitecture: (architecture: any): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    if (!architecture || !architecture.layers) {
      return { nodes, edges }
    }

    // Create a node for each layer
    architecture.layers.forEach((layer: any, index: number) => {
      const nodeId = `layer_${index}`
      nodes.push({
        id: nodeId,
        type: 'layer',
        position: { x: index * 200, y: 50 },
        data: {
          label: `${layer.type} ${index + 1}`,
          type: layer.type,
          config: layer.params || {},
          isBlock: ['ConvBNReLU', 'ConvBNLeakyReLU', 'ResidualBlock'].includes(layer.type),
          layerNames: 
            layer.type === 'ConvBNReLU' 
              ? ['Conv2d', 'BatchNorm', 'ReLU']
              : layer.type === 'ConvBNLeakyReLU'
              ? ['Conv2d', 'BatchNorm', 'LeakyReLU']
              : layer.type === 'ResidualBlock'
              ? ['Conv2d', 'BatchNorm', 'ReLU', 'Skip']
              : undefined,
        },
      })
    })

    // Create edges between consecutive layers
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge_${i}`,
        source: `layer_${i}`,
        target: `layer_${i + 1}`,
      })
    }

    if (architecture.nodes && architecture.edges) {
      return { nodes: architecture.nodes, edges: architecture.edges }
    }

    return { nodes, edges }
  },
}
