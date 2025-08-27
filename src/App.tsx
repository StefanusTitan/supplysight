import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'
import { ApolloProvider, useQuery, useMutation } from "@apollo/client/react"
import { ThemeProvider, CssBaseline, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Drawer, CircularProgress } from '@mui/material'
import theme from './theme'
import { DataGrid } from '@mui/x-data-grid'
import type { GridRowsProp, GridColDef } from '@mui/x-data-grid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Type definitions for the GraphQL query results
type Product = {
  id: string
  name: string
  sku?: string | null
  warehouse?: string | null
  stock?: number | null
  demand?: number | null
}

type ProductsQuery = {
  products: Product[]
}

type WarehousesQuery = {
  warehouses: { code: string; name: string }[]
}

type KPIsQuery = {
  kpis: { date: string; stock: number; demand: number }[]
}

// Helper to convert internal range values to human-friendly labels
const formatRangeLabel = (r: string) => {
  const map: Record<string, string> = { '7d': '7 Days', '14d': '14 Days', '30d': '30 Days' }
  return map[r] ?? r
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
})

const PRODUCTS_QUERY = gql`
  query Products($search: String, $status: String, $warehouse: String) {
    products(search: $search, status: $status, warehouse: $warehouse) {
      id
      name
      sku
      warehouse
      stock
      demand
    }
  }
`

function KPICards({ search, warehouse, status }: { search?: string; warehouse?: string; status?: string }) {
  const variables = {
  search: search || undefined,
  warehouse: warehouse === 'all' ? undefined : warehouse,
  status: status === 'all' ? undefined : status,
  }
  const { data, loading, error } = useQuery<ProductsQuery>(PRODUCTS_QUERY, { variables })

  const totals = useMemo(() => {
    if (!data?.products) return { stock: 0, demand: 0, fillRate: 0 }
    const products = data.products
    const totalStock = products.reduce((s: number, p: any) => s + (p.stock ?? 0), 0)
    const totalDemand = products.reduce((d: number, p: any) => d + (p.demand ?? 0), 0)
    const served = products.reduce((sum: number, p: any) => sum + Math.min(p.stock ?? 0, p.demand ?? 0), 0)
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
      <div className="bg-white/6 rounded-lg p-4">
        <div className="text-sm text-gray-300">Total Stock</div>
        <div className="text-2xl font-semibold">{totals.stock}</div>
      </div>
      <div className="bg-white/6 rounded-lg p-4">
        <div className="text-sm text-gray-300">Total Demand</div>
        <div className="text-2xl font-semibold">{totals.demand}</div>
      </div>
      <div className="bg-white/6 rounded-lg p-4">
        <div className="text-sm text-gray-300">Fill Rate</div>
        <div className="text-2xl font-semibold">{totals.fillRate.toFixed(1)}%</div>
      </div>
    </div>
  )
}

function KPILineChart({ range }: { range: string }) {
  const { data, loading } = useQuery<KPIsQuery>(gql`query Kpis($range: String!){ kpis(range: $range){ date stock demand } }`, { variables: { range } })
  if (loading)
    return (
      <div className="flex items-center justify-center mt-4">
        <CircularProgress />
      </div>
    )
  const chartData = data?.kpis ?? []
  return (
    <div className="bg-white/6 rounded-lg p-4 mt-4">
      <div className="text-lg font-medium">Stock vs Demand ({formatRangeLabel(range)})</div>
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

function ProductsTable({ search, warehouse, status, setOpenRightDrawer, setSelectedProduct }: { search?: string; warehouse?: string; status?: string; setOpenRightDrawer: (open: boolean) => void; setSelectedProduct: (product: any) => void }) {
  const variables = {
  search: search || undefined,
  warehouse: warehouse === 'all' ? undefined : warehouse,
  status: status === 'all' ? undefined : status,
  }
  const { data, loading, error } = useQuery<ProductsQuery>(PRODUCTS_QUERY, { variables })

  if (error) return <div className="text-red-600 mt-2">Error loading products</div>

  const rows: GridRowsProp = (data?.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    warehouse: p.warehouse ?? '',
    stock: p.stock ?? 0,
    demand: p.demand ?? 0,
    status: (p.stock ?? 0) > (p.demand ?? 0) ? 'Healthy' : (p.stock ?? 0) === (p.demand ?? 0) ? 'Low' : 'Critical',
  }))

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
      renderCell: (params: any) => {
        const val: string = params.value ?? ''
        const colorMap: Record<string, string> = {
          Healthy: 'border-green-500 text-green-400 bg-green-500/10',
          Low: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
          Critical: 'border-red-500 text-red-400 bg-red-500/10',
        }
        const colorClasses = colorMap[val] ?? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
            {val}
          </span>
        )
      },
    },
  ]

  return (
    <div className="bg-white/6 rounded-lg p-4 mt-4">
      <div className="text-lg font-medium mb-2">Products</div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <CircularProgress />
        </div>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            getRowClassName={(params: any) => (params.row.status === 'Critical' ? 'critical-row' : '')}
            onRowClick={(params) => {
              setOpenRightDrawer(true)
              setSelectedProduct(params.row)
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
      )}
    </div>
  )
}

function TopBar({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-semibold">SupplySight</div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '7d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('7d')}
          >
            {formatRangeLabel('7d')}
          </button>

          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '14d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('14d')}
          >
            {formatRangeLabel('14d')}
          </button>

          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '30d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('30d')}
          >
            {formatRangeLabel('30d')}
          </button>
        </div>
      </div>
    </header>
  )
}

function RightDrawer({ open, setOpen, selectedProduct }: { open: boolean; setOpen: (open: boolean) => void; selectedProduct: any }) {
  // GraphQL mutations for updating demand and transferring stock
  const UPDATE_DEMAND_MUTATION = gql`
    mutation UpdateDemand($id: ID!, $demand: Int!) {
      updateDemand(id: $id, demand: $demand) { id demand }
    }
  `

  const TRANSFER_STOCK_MUTATION = gql`
    mutation TransferStock($id: ID!, $from: String!, $to: String!, $qty: Int!) {
      transferStock(id: $id, from: $from, to: $to, qty: $qty) { id stock warehouse }
    }
  `

  const { data: whData } = useQuery<WarehousesQuery>(gql`query Warehouses { warehouses { code name } }`)

  const [openUpdate, setOpenUpdate] = useState(false)
  const [openTransfer, setOpenTransfer] = useState(false)

  const [demandValue, setDemandValue] = useState<string>('')
  const [transferQty, setTransferQty] = useState<string>('')
  const [transferTo, setTransferTo] = useState<string>('')

  const [message, setMessage] = useState<string | null>(null)

  const [updateDemand, { loading: updating }] = useMutation(UPDATE_DEMAND_MUTATION, {
    refetchQueries: [{ query: PRODUCTS_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setMessage('Demand updated')
    },
    onError: (err) => setMessage(String(err.message)),
  })

  const [transferStock, { loading: transferring }] = useMutation(TRANSFER_STOCK_MUTATION, {
    refetchQueries: [{ query: PRODUCTS_QUERY }],
    awaitRefetchQueries: true,
    onCompleted: () => setMessage('Stock transferred'),
    onError: (err) => setMessage(String(err.message)),
  })

  // combined loading state for any mutation in this drawer
  const loading = updating || transferring

  // helpers
  const selectedId = selectedProduct?.id
  const selectedWarehouse = selectedProduct?.warehouse
  const selectedStock = typeof selectedProduct?.stock === 'number' ? selectedProduct.stock : 0

  const submitUpdate = async () => {
    setMessage(null)
    if (!selectedId) return setMessage('No product selected')
    const v = parseInt(demandValue, 10)
    if (isNaN(v) || v < 0) return setMessage('Enter a valid demand')
    await updateDemand({ variables: { id: selectedId, demand: v } })
  }

  const submitTransfer = async () => {
    setMessage(null)
    if (!selectedId) return setMessage('No product selected')
    const qty = parseInt(transferQty, 10)
    if (isNaN(qty) || qty <= 0) return setMessage('Enter a valid quantity')
    if (!transferTo) return setMessage('Choose destination warehouse')
    if (transferTo === selectedWarehouse) return setMessage('Destination must differ from source')
    if (qty > selectedStock) return setMessage('Quantity exceeds available stock')
    await transferStock({ variables: { id: selectedId, from: selectedWarehouse, to: transferTo, qty } })
  }

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <div style={{ width: 360, padding: 16 }}>
        <div className="text-lg font-medium mb-2">Details</div>
        <div className="text-sm text-gray-300">
          {selectedProduct ? (
            <div className="space-y-1">
              <div><span className="font-bold">ID:</span> {selectedProduct.id ?? '-'}</div>
              <div><span className="font-bold">Name:</span> {selectedProduct.name ?? '-'}</div>
              <div><span className="font-bold">SKU:</span> {selectedProduct.sku ?? '-'}</div>
              <div><span className="font-bold">Warehouse:</span> {selectedProduct.warehouse ?? '-'}</div>
              <div><span className="font-bold">Stock:</span> {typeof selectedProduct.stock === 'number' ? selectedProduct.stock : '-'}</div>
              <div><span className="font-bold">Demand:</span> {typeof selectedProduct.demand === 'number' ? selectedProduct.demand : '-'}</div>
              <div><span className="font-bold">Status:</span> {selectedProduct.status ?? '-'}</div>
            </div>
          ) : (
            <div>No product selected</div>
          )}
        </div>

        <hr className="my-4 border-gray-700" />

        {/* Update Demand - collapsible */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenUpdate((v) => !v)}>
            <div className="font-medium">Update Demand</div>
            <span
              className={`transform transition-transform duration-200 ${openUpdate ? 'rotate-180' : 'rotate-0'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openUpdate ? 'max-h-72 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-2 pt-2">
              <TextField
                size="small"
                label="Demand"
                type="number"
                value={demandValue}
                onChange={(e: any) => setDemandValue(e.target.value)}
                fullWidth
              />
              <div className="flex gap-2">
                <Button disabled={!selectedProduct || loading} loading={loading} variant="contained" color="primary" size="small" onClick={submitUpdate}>Save</Button>
                <Button variant="text" size="small" onClick={() => { setDemandValue(''); setOpenUpdate(false) }}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-700" />

        {/* Transfer Stock - collapsible */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenTransfer((v) => !v)}>
            <div className="font-medium">Transfer Stock</div>
            <span
              className={`transform transition-transform duration-200 ${openTransfer ? 'rotate-180' : 'rotate-0'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openTransfer ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-2 pt-2">
              <FormControl size="small" fullWidth>
                <InputLabel id="from-label">From</InputLabel>
                <Select labelId="from-label" value={selectedWarehouse ?? ''} label="From" disabled>
                  <MenuItem value={selectedWarehouse}>{selectedWarehouse ?? '—'}</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="to-label">To</InputLabel>
                <Select labelId="to-label" value={transferTo} label="To" onChange={(e: any) => setTransferTo(e.target.value)}>
                  <MenuItem value="">Select</MenuItem>
                  {whData?.warehouses.map((w) => (
                    <MenuItem key={w.code} value={w.code} disabled={w.code === selectedWarehouse}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField size="small" label="Quantity" type="number" value={transferQty} onChange={(e: any) => setTransferQty(e.target.value)} fullWidth />

              <div className="flex gap-2">
                <Button disabled={!selectedProduct || loading} loading={loading} variant="contained" color="primary" size="small" onClick={submitTransfer}>Transfer</Button>
                <Button variant="text" size="small" onClick={() => { setTransferQty(''); setTransferTo(''); setOpenTransfer(false) }}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>

        {message && <div className="text-sm text-gray-200 mt-4">{message}</div>}

        <div style={{ height: 24 }} />
      </div>
    </Drawer>
  )
}

function AppInner({ setOpenRightDrawer, setSelectedProduct }: { setOpenRightDrawer: (open: boolean) => void; setSelectedProduct: (product: any) => void }) {
  const [range, setRange] = useState('7d')
  const [search, setSearch] = useState('')
  const [warehouse, setWarehouse] = useState('all')
  const [status, setStatus] = useState('all')

  const { data: whData } = useQuery<WarehousesQuery>(gql`query Warehouses { warehouses { code name } }`)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }
  const [debouncedInputValue, setDebouncedInputValue] = useState("")

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedInputValue(search);
    }, 350);
    return () => clearTimeout(delayInputTimeoutId);
  }, [search]);

  // Clear all filters and force the queries to refresh by updating the state
  const handleClearAll = () => {
    setSearch('')
    setWarehouse('all')
    setStatus('all')
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <TopBar range={range} setRange={setRange} />

      <div className="mt-6">
        <div className="text-2xl font-semibold">Overview — {formatRangeLabel(range)}</div>
        <KPICards search={debouncedInputValue} warehouse={warehouse} status={status} />
        <KPILineChart range={range} />
        {/* Filters row (Material UI components, dark-mode friendly) */}
        <div className="flex flex-row sm:items-center gap-3 mt-4">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
            <TextField
              size="small"
              placeholder="Search (name, SKU, ID)"
              value={search}
              onChange={handleInputChange}
              sx={{ minWidth: 240, bgcolor: 'background.paper', borderRadius: 1 }}
            />

            <FormControl size="small" sx={{ m: 1, minWidth: 100 }}>
              <InputLabel id="warehouse-label">Warehouse</InputLabel>
              <Select
                labelId="warehouse-label"
                value={warehouse}
                label="Warehouse"
                autoWidth
                onChange={(e: any) => setWarehouse(e.target.value)}
              >
                  <MenuItem value="all">All</MenuItem>
                {whData?.warehouses.map((w) => (
                  <MenuItem key={w.code} value={w.code}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                autoWidth
                onChange={(e: any) => setStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <Button variant="text" color="primary" onClick={handleClearAll}>Clear</Button>
          </Box>
        </div>
      </div>

      <ProductsTable search={debouncedInputValue} warehouse={warehouse} status={status} setOpenRightDrawer={setOpenRightDrawer} setSelectedProduct={setSelectedProduct} />
    </div>
  )
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [openRightDrawer, setOpenRightDrawer] = useState(false)
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppInner setOpenRightDrawer={setOpenRightDrawer} setSelectedProduct={setSelectedProduct} />
        <RightDrawer open={openRightDrawer} setOpen={setOpenRightDrawer} selectedProduct={selectedProduct} />
      </ThemeProvider>
    </ApolloProvider>
  )
}
