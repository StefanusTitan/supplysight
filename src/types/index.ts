// Type definitions for the GraphQL query results and components

export type Product = {
  id: string
  name: string
  sku?: string | null
  warehouse?: string | null
  stock?: number | null
  demand?: number | null
}

export type ProductsQuery = {
  products: Product[]
}

export type WarehousesQuery = {
  warehouses: { code: string; name: string }[]
}

export type KPIsQuery = {
  kpis: { date: string; stock: number; demand: number }[]
}

export type SelectedProduct = {
  id: string
  name: string
  sku: string
  warehouse: string
  stock: number
  demand: number
  status: string
}

export type Range = '7d' | '14d' | '30d'

export type Status = 'all' | 'healthy' | 'low' | 'critical'
