/**
 * Inference API service
 * Handles model inference, image uploads, and feature visualization
 */
import apiClient from './client'

export interface LayerOutput {
  layer_name: string
  layer_type: string
  output_shape: number[]
  activation_stats: {
    min: number
    max: number
    mean: number
    std: number
    median: number
  }
  output_data: number[]
}

export interface InferenceResponse {
  version_id: string
  output: number[]
  output_shape: number[]
  predicted_class?: number
  predicted_class_label?: string
  confidence?: number
  top_k_predictions?: Array<{ class_id: number; class_label?: string; confidence: number }>
  layer_outputs: LayerOutput[]
  processing_time: number
}

export interface ModelConfig {
  architecture: Record<string, any>
  input_shape: number[]
  model_summary: string
  total_parameters: number
  trainable_parameters: number
}

export const inferenceApi = {
  /**
   * Run inference with raw input data
   */
  runInference: async (
    versionId: string,
    inputData: number[],
    inputShape?: number[]
  ): Promise<InferenceResponse> => {
    const response = await apiClient.post('/inference/run', {
      version_id: versionId,
      input_data: inputData,
      input_shape: inputShape,
    })
    return response.data
  },

  /**
   * Run inference with an uploaded image
   */
  uploadAndInfer: async (
    versionId: string,
    imageFile: File
  ): Promise<InferenceResponse> => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const response = await apiClient.post(
      `/inference/run-image?version_id=${versionId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Get model configuration and metadata
   */
  getModelConfig: async (versionId: string): Promise<ModelConfig> => {
    const response = await apiClient.get(`/inference/${versionId}/config`)
    return response.data
  },

  /**
   * Convert image file to normalized array for inference
   */
  imageToArray: async (
    file: File,
    targetShape?: { width: number; height: number }
  ): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          try {
            // Create canvas
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            // Resize if target shape provided
            if (targetShape) {
              width = targetShape.width
              height = targetShape.height
            }

            canvas.width = width
            canvas.height = height

            // Draw image
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Could not get canvas context')

            ctx.drawImage(img, 0, 0, width, height)

            // Get image data
            const imageData = ctx.getImageData(0, 0, width, height)
            const data = imageData.data

            // Normalize to [0, 1] and convert RGB to array
            const normalized: number[] = []
            for (let i = 0; i < data.length; i += 4) {
              normalized.push(data[i] / 255) // R
              normalized.push(data[i + 1] / 255) // G
              normalized.push(data[i + 2] / 255) // B
              // Skip alpha channel
            }

            resolve(normalized)
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = event.target?.result as string
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Get layer output as image (for feature map visualization)
   */
  layerOutputToImage: (
    layerOutput: LayerOutput,
    width: number = 256,
    height: number = 256
  ): string => {
    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Get activation stats for normalization
    const { min, max } = layerOutput.activation_stats
    const range = (max - min) || 1

    // Create image data
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Map layer outputs to heatmap
    const values = layerOutput.output_data
    // Sample proportionally across pixels instead of clamping to the last
    // value when the activation array is shorter than the canvas size.
    const totalPixels = width * height

    for (let i = 0; i < totalPixels; i++) {
      const ratio = i / totalPixels
      const valueIndex = Math.min(Math.floor(ratio * values.length), values.length - 1)
      let value = values[valueIndex]

      // Guard against invalid numeric values
      if (!isFinite(value) || Number.isNaN(value)) {
        value = min
      }

      // Normalize to [0, 1]
      let normalized = (value - min) / range
      if (!isFinite(normalized) || Number.isNaN(normalized)) normalized = 0
      if (normalized < 0) normalized = 0
      if (normalized > 1) normalized = 1

      // Create heat color (blue -> green -> yellow -> red)
      let r, g, b
      if (normalized < 0.25) {
        // Blue to Cyan
        r = 0
        g = Math.floor((normalized / 0.25) * 255)
        b = 255
      } else if (normalized < 0.5) {
        // Cyan to Green
        r = 0
        g = 255
        b = Math.floor(255 * (1 - (normalized - 0.25) / 0.25))
      } else if (normalized < 0.75) {
        // Green to Yellow
        r = Math.floor(((normalized - 0.5) / 0.25) * 255)
        g = 255
        b = 0
      } else {
        // Yellow to Red
        r = 255
        g = Math.floor(255 * (1 - (normalized - 0.75) / 0.25))
        b = 0
      }

      const pixelIndex = i * 4
      data[pixelIndex] = r // Red
      data[pixelIndex + 1] = g // Green
      data[pixelIndex + 2] = b // Blue
      data[pixelIndex + 3] = 255 // Alpha
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL()
  },
}
