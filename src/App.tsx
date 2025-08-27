import { useEffect, useState, useCallback } from 'react'
import './App.css'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider, useQuery } from "@apollo/client/react"
import { ThemeProvider, CssBaseline, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material'
import theme from './theme'

// Components
import KPICards from './components/KPICards'
import KPILineChart from './components/KPILineChart'
import TopBar from './components/TopBar'
import ProductsTable from './components/ProductsTable'
import RightDrawer from './components/RightDrawer'

// Types and constants
import type { Range, Status, SelectedProduct, WarehousesQuery } from './types'
import { GRAPHQL_URI, STATUSES, RANGES } from './constants'
import { WAREHOUSES_QUERY } from './queries'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: GRAPHQL_URI,
  }),
})

function AppInner({ setOpenRightDrawer, setSelectedProduct }: { setOpenRightDrawer: (open: boolean) => void; setSelectedProduct: (product: SelectedProduct) => void }) {
  const [range, setRange] = useState<Range>('7d')
  const [search, setSearch] = useState('')
  const [warehouse, setWarehouse] = useState('all')
  const [status, setStatus] = useState<Status>('all')

  const { data: whData } = useQuery<WarehousesQuery>(WAREHOUSES_QUERY)

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }, [])

  const [debouncedInputValue, setDebouncedInputValue] = useState("")

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedInputValue(search);
    }, 350);
    return () => clearTimeout(delayInputTimeoutId);
  }, [search]);

  // Clear all filters and force the queries to refresh by updating the state
  const handleClearAll = useCallback(() => {
    setSearch('')
    setWarehouse('all')
    setStatus('all')
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4">
      <TopBar range={range} setRange={setRange} />

      <div className="mt-6">
        <div className="text-2xl font-semibold">Overview — {RANGES[range]}</div>
        <KPICards search={debouncedInputValue} warehouse={warehouse} status={status} />
        <KPILineChart range={range} />
        {/* Filters row */}
        <div className="flex flex-row sm:items-center gap-3 mt-4">
          <Box 
            sx={{ display: 'flex',
              gap: 2,
              width: '100%',
              flexDirection: 'column',
              [theme.breakpoints.up('lg')]: {
                flexDirection: 'row',
                alignItems: 'center',
              }, 
            }}
          >
            <TextField
              size="small"
              placeholder="Search (name, SKU, ID)"
              value={search}
              onChange={handleInputChange}
              sx={{ minWidth: 240, bgcolor: 'background.paper', borderRadius: 1 }}
            />

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="warehouse-label">Warehouse</InputLabel>
              <Select
                labelId="warehouse-label"
                value={warehouse}
                label="Warehouse"
                autoWidth
                onChange={(e) => setWarehouse(e.target.value)}
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
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <MenuItem value={STATUSES.ALL}>All</MenuItem>
                <MenuItem value={STATUSES.HEALTHY}>Healthy</MenuItem>
                <MenuItem value={STATUSES.LOW}>Low</MenuItem>
                <MenuItem value={STATUSES.CRITICAL}>Critical</MenuItem>
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
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
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
