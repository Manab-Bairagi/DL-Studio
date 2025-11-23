export interface LayerTypeConfig {
  name: string
  description: string
  defaultParams: Record<string, any>
  paramFields: {
    name: string
    label: string
    type: 'number' | 'select' | 'array' | 'string' | 'boolean'
    required?: boolean
    options?: Array<{ label: string; value: any }>
    defaultValue?: any
  }[]
}

export const layers: Record<string, LayerTypeConfig> = {
  Conv2d: {
    name: 'Conv2d',
    description: '2D Convolutional Layer',
    defaultParams: {
      in_channels: 3,
      out_channels: 64,
      kernel_size: 3,
      stride: 1,
      padding: 1,
    },
    paramFields: [
      {
        name: 'in_channels',
        label: 'Input Channels',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'out_channels',
        label: 'Output Channels',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  Dense: {
    name: 'Dense',
    description: 'Fully Connected Layer',
    defaultParams: {
      in_features: 128,
      out_features: 64,
    },
    paramFields: [
      {
        name: 'in_features',
        label: 'Input Features',
        type: 'number',
        required: true,
        defaultValue: 128,
      },
      {
        name: 'out_features',
        label: 'Output Features',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
    ],
  },
  Linear: {
    name: 'Linear',
    description: 'Linear (Fully Connected) Layer',
    defaultParams: {
      in_features: 128,
      out_features: 64,
    },
    paramFields: [
      {
        name: 'in_features',
        label: 'Input Features',
        type: 'number',
        required: true,
        defaultValue: 128,
      },
      {
        name: 'out_features',
        label: 'Output Features',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
    ],
  },
  MaxPool2d: {
    name: 'MaxPool2d',
    description: 'Max Pooling Layer',
    defaultParams: {
      kernel_size: 2,
      stride: 2,
    },
    paramFields: [
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 2,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 2,
      },
    ],
  },
  AvgPool2d: {
    name: 'AvgPool2d',
    description: 'Average Pooling Layer',
    defaultParams: {
      kernel_size: 2,
      stride: 2,
    },
    paramFields: [
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 2,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 2,
      },
    ],
  },
  AdaptiveAvgPool2d: {
    name: 'AdaptiveAvgPool2d',
    description: 'Adaptive Average Pooling',
    defaultParams: {
      output_size: [1, 1],
    },
    paramFields: [
      {
        name: 'output_size',
        label: 'Output Size (H,W)',
        type: 'array',
        required: true,
        defaultValue: [1, 1],
      },
    ],
  },
  BatchNorm2d: {
    name: 'BatchNorm2d',
    description: 'Batch Normalization 2D',
    defaultParams: {
      num_features: 64,
    },
    paramFields: [
      {
        name: 'num_features',
        label: 'Number of Features',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
    ],
  },
  ReLU: {
    name: 'ReLU',
    description: 'ReLU Activation',
    defaultParams: {},
    paramFields: [],
  },
  Sigmoid: {
    name: 'Sigmoid',
    description: 'Sigmoid Activation',
    defaultParams: {},
    paramFields: [],
  },
  Tanh: {
    name: 'Tanh',
    description: 'Tanh Activation',
    defaultParams: {},
    paramFields: [],
  },
  Softmax: {
    name: 'Softmax',
    description: 'Softmax Activation',
    defaultParams: {
      dim: 1,
    },
    paramFields: [
      {
        name: 'dim',
        label: 'Dimension',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
    ],
  },
  LogSoftmax: {
    name: 'LogSoftmax',
    description: 'Log Softmax Activation',
    defaultParams: {
      dim: 1,
    },
    paramFields: [
      {
        name: 'dim',
        label: 'Dimension',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
    ],
  },
  Softplus: {
    name: 'Softplus',
    description: 'Softplus Activation',
    defaultParams: {
      beta: 1.0,
      threshold: 20,
    },
    paramFields: [
      {
        name: 'beta',
        label: 'Beta',
        type: 'number',
        defaultValue: 1.0,
      },
      {
        name: 'threshold',
        label: 'Threshold',
        type: 'number',
        defaultValue: 20,
      },
    ],
  },
  Softsign: {
    name: 'Softsign',
    description: 'Softsign Activation',
    defaultParams: {},
    paramFields: [],
  },
  GELU: {
    name: 'GELU',
    description: 'GELU Activation',
    defaultParams: {},
    paramFields: [],
  },
  Mish: {
    name: 'Mish',
    description: 'Mish Activation',
    defaultParams: {},
    paramFields: [],
  },
  ELU: {
    name: 'ELU',
    description: 'ELU Activation',
    defaultParams: {
      alpha: 1.0,
    },
    paramFields: [
      {
        name: 'alpha',
        label: 'Alpha',
        type: 'number',
        defaultValue: 1.0,
      },
    ],
  },
  SELU: {
    name: 'SELU',
    description: 'SELU Activation',
    defaultParams: {},
    paramFields: [],
  },
  PReLU: {
    name: 'PReLU',
    description: 'Parametric ReLU',
    defaultParams: {
      num_parameters: 1,
      init: 0.25,
    },
    paramFields: [
      {
        name: 'num_parameters',
        label: 'Number of Parameters',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'init',
        label: 'Init Value',
        type: 'number',
        defaultValue: 0.25,
      },
    ],
  },
  LeakyReLU: {
    name: 'LeakyReLU',
    description: 'Leaky ReLU Activation',
    defaultParams: {
      negative_slope: 0.01,
    },
    paramFields: [
      {
        name: 'negative_slope',
        label: 'Negative Slope',
        type: 'number',
        defaultValue: 0.01,
      },
    ],
  },
  RReLU: {
    name: 'RReLU',
    description: 'Randomized ReLU',
    defaultParams: {
      lower: 0.125,
      upper: 0.333,
    },
    paramFields: [
      {
        name: 'lower',
        label: 'Lower Bound',
        type: 'number',
        defaultValue: 0.125,
      },
      {
        name: 'upper',
        label: 'Upper Bound',
        type: 'number',
        defaultValue: 0.333,
      },
    ],
  },
  Dropout: {
    name: 'Dropout',
    description: 'Dropout Regularization',
    defaultParams: {
      p: 0.5,
    },
    paramFields: [
      {
        name: 'p',
        label: 'Dropout Probability',
        type: 'number',
        required: true,
        defaultValue: 0.5,
      },
    ],
  },
  Flatten: {
    name: 'Flatten',
    description: 'Flatten Layer',
    defaultParams: {},
    paramFields: [],
  },
  ConvBNReLU: {
    name: 'ConvBNReLU',
    description: 'Conv2d + BatchNorm2d + ReLU Block',
    defaultParams: {
      in_channels: 3,
      out_channels: 64,
      kernel_size: 3,
      stride: 1,
      padding: 1,
    },
    paramFields: [
      {
        name: 'in_channels',
        label: 'Input Channels',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'out_channels',
        label: 'Output Channels',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
  ConvBNLeakyReLU: {
    name: 'ConvBNLeakyReLU',
    description: 'Conv2d + BatchNorm2d + LeakyReLU Block',
    defaultParams: {
      in_channels: 3,
      out_channels: 64,
      kernel_size: 3,
      stride: 1,
      padding: 1,
      negative_slope: 0.01,
    },
    paramFields: [
      {
        name: 'in_channels',
        label: 'Input Channels',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'out_channels',
        label: 'Output Channels',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'negative_slope',
        label: 'Leaky ReLU Slope',
        type: 'number',
        defaultValue: 0.01,
      },
    ],
  },
  ResidualBlock: {
    name: 'ResidualBlock',
    description: 'Residual Block with Skip Connection',
    defaultParams: {
      in_channels: 64,
      out_channels: 64,
      kernel_size: 3,
      stride: 1,
      padding: 1,
    },
    paramFields: [
      {
        name: 'in_channels',
        label: 'Input Channels',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
      {
        name: 'out_channels',
        label: 'Output Channels',
        type: 'number',
        required: true,
        defaultValue: 64,
      },
      {
        name: 'kernel_size',
        label: 'Kernel Size',
        type: 'number',
        required: true,
        defaultValue: 3,
      },
      {
        name: 'stride',
        label: 'Stride',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        defaultValue: 1,
      },
    ],
  },
}
export default layers;