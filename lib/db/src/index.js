import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// For development without a real database, use a mock connection
let pool, db;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else if (process.env.NODE_ENV === "development") {
  // Mock database for development - returns empty results
  console.warn("⚠️  DATABASE_URL not set. Using mock database for development.");
  
  // Create a mock pool that doesn't actually connect
  pool = {
    query: async () => ({ rows: [] }),
    end: async () => {},
    connect: async () => ({ release: () => {} }),
  };
  
  // Create a mock db object that responds to drizzle queries
  db = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
        then: (onFulfilled) => Promise.resolve([]).then(onFulfilled),
        [Symbol.toStringTag]: 'Promise',
      }),
      then: (onFulfilled) => Promise.resolve([]).then(onFulfilled),
      [Symbol.toStringTag]: 'Promise',
    }),
    insert: () => ({
      into: () => ({
        values: () => Promise.resolve([]),
        then: (onFulfilled) => Promise.resolve([]).then(onFulfilled),
        [Symbol.toStringTag]: 'Promise',
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([]),
        then: (onFulfilled) => Promise.resolve([]).then(onFulfilled),
        [Symbol.toStringTag]: 'Promise',
      }),
    }),
    delete: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
        then: (onFulfilled) => Promise.resolve([]).then(onFulfilled),
        [Symbol.toStringTag]: 'Promise',
      }),
    }),
  };
} else {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export { pool, db };
export * from "./schema";