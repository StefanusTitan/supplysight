import { useMemo } from 'react'
import { useQuery } from "@apollo/client/react"
import { Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridRowsProp, GridColDef } from '@mui/x-data-grid'
import type { ProductsQuery, SelectedProduct } from '../types'
import { COLOR_CLASSES, STATUS_LABELS } from '../constants'
import { PRODUCTS_QUERY } from '../queries'

interface ProductsTableProps {
  search?: string
  warehouse?: string
  status?: string
  setOpenRightDrawer: (open: boolean) => void
  setSelectedProduct: (product: SelectedProduct) => void
}

export default function ProductsTable({ search, warehouse, status, setOpenRightDrawer, setSelectedProduct }: ProductsTableProps) {
  const variables = {
    search: search || undefined,
    warehouse: warehouse === 'all' ? undefined : warehouse,
    status: status === 'all' ? undefined : status,
  }
  const { data, loading, error } = useQuery<ProductsQuery>(PRODUCTS_QUERY, { variables })

  if (error) return <div className="text-red-600 mt-2">Error loading products</div>

  const rows: GridRowsProp = useMemo(() => (data?.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    warehouse: p.warehouse ?? '',
    stock: p.stock ?? 0,
    demand: p.demand ?? 0,
    status: (p.stock ?? 0) > (p.demand ?? 0) ? 'Healthy' : (p.stock ?? 0) === (p.demand ?? 0) ? 'Low' : 'Critical',
  })), [data])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', width: 240 },
    { field: 'sku', headerName: 'SKU', width: 140 },
    { field: 'warehouse', headerName: 'Warehouse', width: 160 },
    { field: 'stock', headerName: 'Stock', width: 110, type: 'number' },
    { field: 'demand', headerName: 'Demand', width: 110, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const val: string = params.value ?? ''
        const colorClasses = COLOR_CLASSES[val as keyof typeof COLOR_CLASSES] ?? COLOR_CLASSES.Low
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
            {STATUS_LABELS[val as keyof typeof STATUS_LABELS] ?? val}
          </span>
        )
      },
    },
  ]

  return (
    <div className="bg-white/6 rounded-lg p-4 mt-4">
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          slotProps={{
            loadingOverlay: {
              variant: 'linear-progress',
              noRowsVariant: 'skeleton',
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          getRowClassName={(params) => (params.row.status === 'Critical' ? 'critical-row' : '')}
          onRowClick={(params) => {
            setOpenRightDrawer(true)
            setSelectedProduct(params.row as SelectedProduct)
          }}
          sx={{
            border: '1px solid rgba(255,255,255,0.04)',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'primary.dark' },
            '& .MuiDataGrid-cell': { py: 1 },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            // lightly tint the entire row when status is Critical
            '& .MuiDataGrid-row.critical-row': {
              background: 'rgba(220, 0, 78, 0.07) !important',
            },
            '& .MuiDataGrid-row.critical-row:hover': {
              background: 'rgba(220, 0, 78, 0.1) !important',
            },
            '& .MuiDataGrid-row.critical-row.Mui-selected': {
              background: 'rgba(220, 0, 78, 0.2) !important',
            },
            '& .MuiDataGrid-cell.Mui-selected': {
              border: 'none'
            },
          }}
        />
      </Box>
    </div>
  )
}
