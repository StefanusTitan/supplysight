import { useQuery } from "@apollo/client/react"
import { CircularProgress } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { KPIsQuery, Range } from '../types'
import { RANGES } from '../constants'
import { KPIS_QUERY } from '../queries'

interface KPILineChartProps {
  range: Range
}

export default function KPILineChart({ range }: KPILineChartProps) {
  const { data, loading } = useQuery<KPIsQuery>(KPIS_QUERY, { variables: { range } })
  if (loading)
    return (
      <div className="flex items-center justify-center mt-4">
        <CircularProgress />
      </div>
    )
  const chartData = data?.kpis ?? []
  return (
    <div className="bg-white/6 rounded-lg p-4 mt-4">
      <div className="text-lg font-medium">Stock vs Demand ({RANGES[range]})</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <Line type="monotone" dataKey="stock" name="Stock" stroke="#1976d2" strokeWidth={2} />
          <Line type="monotone" dataKey="demand" name="Demand" stroke="#dc004e" strokeWidth={2} />
          <XAxis dataKey="date" />
          <YAxis />
          <Legend align="right" />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(15,23,36,0.95)', border: 'none', color: '#fff' }}
            labelStyle={{ color: '#bbb' }}
            itemStyle={{ color: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
