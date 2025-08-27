import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#0b1220', paper: '#0f1724' },
    text: { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b1220',
        },
      },
    },
    // DataGrid is provided by @mui/x-data-grid; TS types sometimes need a cast
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          color: 'rgba(255,255,255,0.92)',
          backgroundColor: '#0b1220',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#0c1726',
            color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255,255,255,0.02)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: '#0b1220',
          },
        },
      },
    },
  },
} as any)

export default theme
