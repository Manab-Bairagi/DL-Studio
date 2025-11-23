/**
 * Layer Auto-Configuration Calculator
 * Automatically adjusts layer parameters when layers are connected
 */

export interface LayerConfig {
  in_channels?: number
  out_channels?: number
  in_features?: number
  out_features?: number
  kernel_size?: number
  stride?: number
  padding?: number
  [key: string]: any
}

export interface LayerInfo {
  type: string
  config: LayerConfig
}

/**
 * Calculates output shape after a layer operation
 */
export function calculateOutputShape(
  inputShape: number[],
  layerType: string,
  config: LayerConfig
): number[] {
  const [batch, channels, height, width] = inputShape

  switch (layerType) {
    case 'Conv2d': {
      const stride = config.stride || 1
      const padding = config.padding || 0
      const dilation = config.dilation || 1
      const kernelSize = config.kernel_size || 3

      const outHeight = Math.floor(
        (height + 2 * padding - dilation * (kernelSize - 1) - 1) / stride + 1
      )
      const outWidth = Math.floor(
        (width + 2 * padding - dilation * (kernelSize - 1) - 1) / stride + 1
      )
      const outChannels = config.out_channels || channels

      return [batch, outChannels, outHeight, outWidth]
    }

    case 'MaxPool2d':
    case 'AvgPool2d': {
      const stride = config.stride || config.kernel_size || 2
      const kernelSize = config.kernel_size || 2

      const outHeight = Math.floor((height - kernelSize) / stride + 1)
      const outWidth = Math.floor((width - kernelSize) / stride + 1)

      return [batch, channels, outHeight, outWidth]
    }

    case 'AdaptiveAvgPool2d': {
      const [outH, outW] = config.output_size || [1, 1]
      return [batch, channels, outH, outW]
    }

    case 'BatchNorm2d':
    case 'ReLU':
    case 'Sigmoid':
    case 'Tanh':
    case 'Dropout':
      return inputShape

    case 'Flatten': {
      const flatSize = channels * height * width
      return [batch, flatSize]
    }

    case 'Dense':
    case 'Linear': {
      return [batch, config.out_features || 64]
    }

    default:
      return inputShape
  }
}

/**
 * Suggests configuration for a layer based on previous layer output
 */
export function suggestLayerConfig(
  layerType: string,
  previousOutputShape: number[],
  currentConfig: LayerConfig
): LayerConfig {
  const suggestedConfig = { ...currentConfig }

  // Extract previous layer dimensions
  const [batch, prevChannels, prevHeight, prevWidth] = previousOutputShape

  switch (layerType) {
    case 'Conv2d': {
      // Set input channels to match previous output channels
      if (!suggestedConfig.in_channels || suggestedConfig.in_channels !== prevChannels) {
        suggestedConfig.in_channels = prevChannels
      }
      // Keep other params as is or use defaults
      suggestedConfig.out_channels = suggestedConfig.out_channels || 64
      suggestedConfig.kernel_size = suggestedConfig.kernel_size || 3
      suggestedConfig.stride = suggestedConfig.stride || 1
      suggestedConfig.padding = suggestedConfig.padding || 1
      break
    }

    case 'BatchNorm2d': {
      // Batch norm needs to match the number of channels
      if (!suggestedConfig.num_features || suggestedConfig.num_features !== prevChannels) {
        suggestedConfig.num_features = prevChannels
      }
      break
    }

    case 'Dense':
    case 'Linear': {
      // Flatten input and calculate input features
      const flatSize = prevChannels * prevHeight * prevWidth
      if (!suggestedConfig.in_features || suggestedConfig.in_features !== flatSize) {
        suggestedConfig.in_features = flatSize
      }
      suggestedConfig.out_features = suggestedConfig.out_features || 128
      break
    }

    case 'MaxPool2d':
    case 'AvgPool2d':
    case 'AdaptiveAvgPool2d':
    case 'ReLU':
    case 'Sigmoid':
    case 'Tanh':
    case 'Dropout':
    case 'Flatten':
      // These layers don't need channel adjustment
      break

    default:
      break
  }

  return suggestedConfig
}

/**
 * Get human-readable change description
 */
export function getConfigChangeDescription(
  layerType: string,
  oldConfig: LayerConfig,
  newConfig: LayerConfig
): string[] {
  const changes: string[] = []

  const keys = new Set([...Object.keys(oldConfig), ...Object.keys(newConfig)])

  keys.forEach((key) => {
    const oldVal = oldConfig[key]
    const newVal = newConfig[key]

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      if (newVal !== undefined) {
        changes.push(`${key}: ${oldVal ?? 'undefined'} → ${newVal}`)
      }
    }
  })

  return changes
}

/**
 * Validate if layer configuration is compatible with input shape
 */
export function validateLayerConfig(
  layerType: string,
  config: LayerConfig,
  inputShape: number[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // All layers need 4D input (batch, channels, height, width) or 2D (batch, features)
  if (inputShape.length === 4) {
    const [, channels] = inputShape

    if (layerType === 'Conv2d' && config.in_channels && config.in_channels !== channels) {
      errors.push(
        `Conv2d in_channels (${config.in_channels}) doesn't match input channels (${channels})`
      )
    }

    if (layerType === 'BatchNorm2d' && config.num_features && config.num_features !== channels) {
      errors.push(
        `BatchNorm2d num_features (${config.num_features}) doesn't match input channels (${channels})`
      )
    }
  } else if (inputShape.length === 2) {
    const [, features] = inputShape

    if (
      (layerType === 'Dense' || layerType === 'Linear') &&
      config.in_features &&
      config.in_features !== features
    ) {
      errors.push(
        `${layerType} in_features (${config.in_features}) doesn't match input features (${features})`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
