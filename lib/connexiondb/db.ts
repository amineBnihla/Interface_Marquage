// db/connection.ts
import sql, { config as SQLConfig, ConnectionPool } from "mssql";

// Cache multiple pools by database name
const poolCache: Map<string, ConnectionPool> = new Map();

function createConfig(dbName: string): SQLConfig {
  return {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: dbName,                          // ✅ Use passed dbName
    server: process.env.DB_SERVER as string,
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  };
}

// ✅ Get pool for a SPECIFIC database
export async function getDB(dbName?: string): Promise<ConnectionPool> {
  // Use passed dbName, fallback to env
  const database = dbName || process.env.DB_NAME as string;

  console.log(`📂 Connecting to database: ${database}`);

  // Check if pool already exists AND is connected
  const cached = poolCache.get(database);
  if (cached && cached.connected) {
    console.log(`♻️  Reusing pool for: ${database}`);
    return cached;
  }

  // Close old pool if it exists but is disconnected
  if (cached && !cached.connected) {
    poolCache.delete(database);
  }

  // Create NEW pool for this database
  console.log(`🆕 Creating new pool for: ${database}`);
  const config = createConfig(database);
  const pool = await sql.connect(config);

  // Store in cache
  poolCache.set(database, pool);

  return pool;
}

// Close a specific pool
export async function closePool(dbName: string) {
  const pool = poolCache.get(dbName);
  if (pool) {
    await pool.close();
    poolCache.delete(dbName);
    console.log(`🔒 Closed pool for: ${dbName}`);
  }
}

// Close ALL pools
export async function closeAllPools() {
  for (const [dbName, pool] of poolCache) {
    await pool.close();
    poolCache.delete(dbName);
  }
  console.log(`🔒 Closed all pools`);
}