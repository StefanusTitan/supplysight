# SupplySight

A modern supply chain management dashboard built with React, TypeScript, and Vite. SupplySight provides real-time visibility into inventory levels, demand forecasting, and warehouse operations.

## Features

- **Real-time Inventory Tracking**: Monitor stock levels across multiple warehouses
- **Demand Analytics**: Track and analyze demand patterns with interactive charts
- **Warehouse Management**: View and manage inventory across different warehouse locations
- **GraphQL API**: Modern GraphQL backend for efficient data querying
- **Responsive Design**: Built with Material-UI and Tailwind CSS for a modern, responsive interface
- **Data Visualization**: Interactive charts and graphs using Recharts

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Components**: Material-UI (MUI) + Tailwind CSS
- **Data Fetching**: Apollo Client for GraphQL
- **Charts**: Recharts for data visualization
- **Backend**: Apollo Server with GraphQL
- **Build Tool**: Vite with SWC for fast refresh

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd supplysight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the mock GraphQL server:
   ```bash
   node src/backend/mockServer.ts
   ```

4. In a new terminal, start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
src/
├── assets/          # Static assets
├── backend/         # Mock GraphQL server
│   └── mockServer.ts
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
├── theme.ts         # Material-UI theme configuration
└── index.css        # Global styles
```

## API

The application uses a mock GraphQL server that provides:

- **Products Query**: Search and filter products by warehouse, status, and search terms
- **Warehouses Query**: Get list of all warehouses
- **KPIs Query**: Retrieve key performance indicators with date ranges
- **Mutations**: Update demand and transfer stock between warehouses

## Development

### ESLint Configuration

### ESLint Configuration

The project uses modern ESLint configuration. If you're developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

For React-specific lint rules, you can install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom):

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not intended for public distribution.
