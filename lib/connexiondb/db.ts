import sql, { config as SQLConfig, ConnectionPool } from "mssql";

const sqlConfig: SQLConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  server: process.env.DB_SERVER as string,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

let pool: ConnectionPool | null = null;

export async function getDB(): Promise<ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  pool = await sql.connect(sqlConfig);
  return pool;
}