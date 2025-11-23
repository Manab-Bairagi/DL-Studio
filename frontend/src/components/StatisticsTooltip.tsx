import React from 'react'
import { Box, Tooltip, Typography, Paper } from '@mui/material'

interface StatisticInfo {
  name: string
  value: string
  description: string
  calculation: string
}

interface StatisticsTooltipProps {
  statistics: StatisticInfo[]
  children: React.ReactElement
}

export const StatisticsTooltip: React.FC<StatisticsTooltipProps> = ({ statistics, children }) => {
  const tooltipContent = (
    <Paper
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
      }}
    >
      {statistics.map((stat, idx) => (
        <Box key={idx} sx={{ mb: idx < statistics.length - 1 ? 2 : 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3b82f6', mb: 0.5 }}>
            {stat.name}: {stat.value}
          </Typography>
          <Typography variant="caption" sx={{ color: '#e5e7eb', display: 'block', mb: 0.5 }}>
            📝 {stat.description}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#9ca3af',
              display: 'block',
              fontStyle: 'italic',
              borderLeft: '2px solid #8b5cf6',
              pl: 1,
            }}
          >
            {stat.calculation}
          </Typography>
        </Box>
      ))}
    </Paper>
  )

  return <Tooltip title={tooltipContent}>{children}</Tooltip>
}

// Common statistics definitions
export const ACTIVATION_STATS_INFO = [
  {
    name: 'Min',
    description: 'Minimum activation value across all neurons',
    calculation: 'min(all_activations)',
  },
  {
    name: 'Max',
    description: 'Maximum activation value across all neurons',
    calculation: 'max(all_activations)',
  },
  {
    name: 'Mean',
    description: 'Average activation value across all neurons',
    calculation: 'sum(activations) / count(activations)',
  },
  {
    name: 'Std',
    description: 'Standard deviation of activation values',
    calculation: 'sqrt(mean((activations - mean(activations))²))',
  },
]

export const LAYER_STATS_INFO = {
  min: {
    name: 'Min (Minimum Activation)',
    description: 'The lowest output value produced by any neuron in this layer.',
    calculation: 'Helpful for: Detecting "dead neurons" (if always 0 for ReLU) or negative saturation.',
  },
  max: {
    name: 'Max (Maximum Activation)',
    description: 'The highest output value produced by any neuron in this layer.',
    calculation: 'Helpful for: Detecting exploding gradients (if extremely large) or saturation.',
  },
  mean: {
    name: 'Mean (Average Activation)',
    description: 'The average output value across all neurons in this layer.',
    calculation: 'Helpful for: Checking distribution shift. Should generally be stable across layers.',
  },
  std: {
    name: 'Std (Standard Deviation)',
    description: 'Measures the spread/diversity of neuron activations.',
    calculation: 'Helpful for: Ensuring feature diversity. Low std implies neurons are learning similar features.',
  },
}
