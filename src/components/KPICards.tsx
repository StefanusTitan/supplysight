import { useMemo } from 'react'
import { useQuery } from "@apollo/client/react"
import { CircularProgress } from '@mui/material'
import type { ProductsQuery, Product } from '../types'
import { PRODUCTS_QUERY } from '../queries'

interface KPICardsProps {
  search?: string
  warehouse?: string
  status?: string
}

export default function KPICards({ search, warehouse, status }: KPICardsProps) {
  const variables = {
    search: search || undefined,
    warehouse: warehouse === 'all' ? undefined : warehouse,
    status: status === 'all' ? undefined : status,
  }
  const { data, loading, error } = useQuery<ProductsQuery>(PRODUCTS_QUERY, { variables })

  const totals = useMemo(() => {
    if (!data?.products) return { stock: 0, demand: 0, fillRate: 0 }
    const products = data.products
    const totalStock = products.reduce((s: number, p: Product) => s + (p.stock ?? 0), 0)
    const totalDemand = products.reduce((d: number, p: Product) => d + (p.demand ?? 0), 0)
    const served = products.reduce((sum: number, p: Product) => sum + Math.min(p.stock ?? 0, p.demand ?? 0), 0)
    const fillRate = totalDemand === 0 ? 100 : (served / totalDemand) * 100
    return { stock: totalStock, demand: totalDemand, fillRate }
  }, [data])

  if (loading)
    return (
      <div className="flex items-center justify-center mt-4">
        <CircularProgress />
      </div>
    )
  if (error) return <div className="text-red-600 mt-2">Error loading KPIs</div>

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mt-4">
      <div className="bg-white/6 rounded-lg p-4 items-center justify-content-center content-center">
        <div className="text-sm text-gray-300">Total Stock</div>
        <div className="text-2xl font-semibold">{totals.stock}</div>
      </div>
      <div className="bg-white/6 rounded-lg p-4 justify-content-center content-center">
        <div className="text-sm text-gray-300">Total Demand</div>
        <div className="text-2xl font-semibold">{totals.demand}</div>
      </div>
      <div className="bg-white/6 rounded-lg p-4 justify-content-center content-center">
        <div className="text-sm text-gray-300">Fill Rate</div>
        <div className="text-2xl font-semibold">{totals.fillRate.toFixed(1)}%</div>
      </div>
    </div>
  )
}
