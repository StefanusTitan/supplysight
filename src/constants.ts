// Constants for the application

export const RANGES = {
  '7d': '7 Days',
  '14d': '14 Days',
  '30d': '30 Days',
} as const

export const STATUSES = {
  ALL: 'all',
  HEALTHY: 'healthy',
  LOW: 'low',
  CRITICAL: 'critical',
} as const

export const STATUS_LABELS = {
  Healthy: 'Healthy',
  Low: 'Low',
  Critical: 'Critical',
} as const

export const COLOR_CLASSES = {
  Healthy: 'border-green-500 text-green-400 bg-green-500/10',
  Low: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  Critical: 'border-red-500 text-red-400 bg-red-500/10',
} as const

export const GRAPHQL_URI = 'http://localhost:4000'
