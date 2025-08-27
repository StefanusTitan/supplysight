import { useState } from 'react'
import { useQuery, useMutation } from "@apollo/client/react"
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Drawer } from '@mui/material'
import type { WarehousesQuery, SelectedProduct } from '../types'
import { WAREHOUSES_QUERY, UPDATE_DEMAND_MUTATION, TRANSFER_STOCK_MUTATION, PRODUCTS_QUERY } from '../queries'

interface RightDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedProduct: SelectedProduct | null
}

export default function RightDrawer({ open, setOpen, selectedProduct }: RightDrawerProps) {
  // GraphQL mutations for updating demand and transferring stock

  const { data: whData } = useQuery<WarehousesQuery>(WAREHOUSES_QUERY)

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
    await transferStock({ variables: { id: selectedId, from: selectedWarehouse!, to: transferTo, qty } })
  }

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <div className="p-4">
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
                onChange={(e) => setDemandValue(e.target.value)}
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
                <Select labelId="to-label" value={transferTo} label="To" onChange={(e) => setTransferTo(e.target.value)}>
                  <MenuItem value="">Select</MenuItem>
                  {whData?.warehouses.map((w) => (
                    <MenuItem key={w.code} value={w.code} disabled={w.code === selectedWarehouse}>{w.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField size="small" label="Quantity" type="number" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} fullWidth />

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
