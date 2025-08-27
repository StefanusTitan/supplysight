import { gql } from '@apollo/client'

export const PRODUCTS_QUERY = gql`
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

export const WAREHOUSES_QUERY = gql`
  query Warehouses {
    warehouses {
      code
      name
    }
  }
`

export const KPIS_QUERY = gql`
  query Kpis($range: String!) {
    kpis(range: $range) {
      date
      stock
      demand
    }
  }
`

export const UPDATE_DEMAND_MUTATION = gql`
  mutation UpdateDemand($id: ID!, $demand: Int!) {
    updateDemand(id: $id, demand: $demand) {
      id
      demand
    }
  }
`

export const TRANSFER_STOCK_MUTATION = gql`
  mutation TransferStock($id: ID!, $from: String!, $to: String!, $qty: Int!) {
    transferStock(id: $id, from: $from, to: $to, qty: $qty) {
      id
      stock
      warehouse
    }
  }
`
