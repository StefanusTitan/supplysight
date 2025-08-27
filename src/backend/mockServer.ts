import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { v4 as uuidv4 } from 'uuid';

const typeDefs = `#graphql
  type Warehouse {
    code: ID!
    name: String!
    city: String!
    country: String!
  }

  type Product {
    id: ID!
    name: String!
    sku: String!
    warehouse: String!
    stock: Int!
    demand: Int!
  }

  type KPI {
    date: String!
    stock: Int!
    demand: Int!
  }

  type Query {
    products(search: String, status: String, warehouse: String): [Product!]!
    warehouses: [Warehouse!]!
    kpis(range: String!): [KPI!]!
  }

  type Mutation {
    updateDemand(id: ID!, demand: Int!): Product!
    transferStock(id: ID!, from: String!, to: String!, qty: Int!): Product!
  }
`;

const sampleProducts = [
  { id: 'P-1001', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1002', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1003', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1004', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
  { id: 'P-1005', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1006', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1007', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1008', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
  { id: 'P-1009', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1010', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1011', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1012', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
  { id: 'P-1013', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1014', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1015', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1016', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
  { id: 'P-1017', name: '12mm Hex Bolt', sku: 'HEX-12-100', warehouse: 'BLR-A', stock: 180, demand: 120 },
  { id: 'P-1018', name: 'Steel Washer', sku: 'WSR-08-500', warehouse: 'BLR-A', stock: 50, demand: 80 },
  { id: 'P-1019', name: 'M8 Nut', sku: 'NUT-08-200', warehouse: 'PNQ-C', stock: 80, demand: 80 },
  { id: 'P-1020', name: 'Bearing 608ZZ', sku: 'BRG-608-50', warehouse: 'DEL-B', stock: 24, demand: 120 },
];

const sampleWarehouses = [
  { code: 'BLR-A', name: 'Bangalore - A', city: 'Bangalore', country: 'India' },
  { code: 'PNQ-C', name: 'Pune - C', city: 'Pune', country: 'India' },
  { code: 'DEL-B', name: 'Delhi - B', city: 'Delhi', country: 'India' },
];

function generateKpis(days: number): { date: string; stock: number; demand: number }[] {
  const kpis = [];
  const today = new Date();
  today.setDate(today.getDate() - 1);
  let currentStock = 420;
  let currentDemand = 440;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    
    const dayOfWeek = date.getDay(); // Sunday = 0, Saturday = 6

    // Simulate weekend dip in demand
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;

    // Add random noise
    const stockNoise = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const demandNoise = Math.floor(Math.random() * 10) - 5; // -5 to +5

    currentStock += stockNoise;
    currentDemand = Math.max(350, Math.floor((currentDemand + demandNoise) * weekendFactor));
    
    // Simple trend simulation
    if (i < days / 2) {
        currentStock -= 2;
        currentDemand += 1;
    } else {
        currentStock += 1;
        currentDemand -= 2;
    }

    kpis.push({
      date: date.toISOString().split('T')[0],
      stock: currentStock,
      demand: currentDemand,
    });
  }
  return kpis;
}

const sampleKpis = generateKpis(45);

const resolvers = {
  Query: {
    // products(search: String, status: String, warehouse: String): [Product!]!
    products: (_: any, args: { search?: string; status?: string; warehouse?: string }) => {
      let result = sampleProducts.slice();
      if (args.warehouse) {
        result = result.filter((p) => p.warehouse === args.warehouse);
      }
      if (args.search) {
        const q = args.search.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        );
      }
      // basic status filter: 'shortage' -> stock < demand, 'ok' -> stock >= demand
      if (args.status) {
        if (args.status === 'healthy') result = result.filter((p) => p.stock > p.demand);
        if (args.status === 'low') result = result.filter((p) => p.stock === p.demand);
        if (args.status === 'critical') result = result.filter((p) => p.stock < p.demand);
      }
      return result;
    },
    warehouses: () => sampleWarehouses,
    kpis: (_: any, args: { range: string }) => {
      // support dynamic ranges like '7d', '14d', '30d' based on the latest KPI date
      if (!args || !args.range || args.range === 'all') return sampleKpis;
      const m = String(args.range).match(/(\d+)d/i);
      if (!m) return sampleKpis;
      const days = parseInt(m[1], 10);
      if (isNaN(days) || days <= 0) return sampleKpis;

      // assume sampleKpis is ordered ascending by date; use the last date as the "now" reference
      const last = sampleKpis[sampleKpis.length - 1];
      if (!last || !last.date) return sampleKpis;
      const lastDate = new Date(last.date + 'T00:00:00');
      const startDate = new Date(lastDate);
      startDate.setDate(startDate.getDate() - (days - 1));

      return sampleKpis.filter((k) => {
        const d = new Date(k.date + 'T00:00:00');
        return d >= startDate && d <= lastDate;
      });
    },
  },
  Mutation: {
    updateDemand: (_: any, { id, demand }: { id: string; demand: number }) => {
      const prod = sampleProducts.find((p) => p.id === id);
      if (!prod) throw new Error('Product not found');
      prod.demand = demand;
      return prod;
    },
    transferStock: (_: any, { id, from, to, qty }: { id: string; from: string; to: string; qty: number }) => {
      const prod = sampleProducts.find((p) => p.id === id && p.warehouse === from);
      if (!prod) throw new Error('Product not found in source warehouse');
      if (prod.stock < qty) throw new Error('Insufficient stock');
      prod.stock -= qty;
      // create or update product in destination warehouse for demo purposes
      let dest = sampleProducts.find((p) => p.id === id && p.warehouse === to);
      if (!dest) {
        let id = uuidv4();
        dest = { ...prod, warehouse: to, stock: qty, id };
        sampleProducts.push(dest);
      } else {
        dest.stock += qty;
      }
      return prod;
    },
  },
};

// keep simple type mocks for anything not covered by resolvers
// highlight-start
const mocks = {
  Int: () => 6,
  Float: () => 22.1,
  String: () => 'Hello',
};
// highlight-end

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    mocks,
    preserveResolvers: true,
  }),
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);