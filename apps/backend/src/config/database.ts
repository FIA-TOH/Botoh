import { Pool, PoolConfig, QueryResult } from 'pg';
import config from './environment';

// Database connection configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
};

// Create connection pool
const pool = new Pool(poolConfig);

// Database connection status
let isConnected = false;

// Handle pool events
pool.on('connect', () => {
  if (!isConnected) {
    console.log('🗄️  Database connected successfully');
    isConnected = true;
  }
});

pool.on('error', (err: Error) => {
  console.error('❌ Database connection error:', err);
  isConnected = false;
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed');
});

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database test connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database test connection failed:', error);
    return false;
  }
};

// Main query function
export const query = async <T = any>(
  sql: string, 
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;
    
    // Log query in development mode
    if (config.nodeEnv === 'development') {
      console.log(`🔍 Query executed in ${duration}ms:`, sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
      if (params && params.length > 0) {
        console.log('📋 Parameters:', params);
      }
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Query failed after ${duration}ms:`, sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
    if (params && params.length > 0) {
      console.error('📋 Parameters:', params);
    }
    throw error;
  }
};

// Transaction helper
export const transaction = async <T = any>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Helper functions for common operations

// Single row query
export const queryOne = async <T = any>(
  sql: string, 
  params?: any[]
): Promise<T | null> => {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
};

// Multiple rows query
export const queryMany = async <T = any>(
  sql: string, 
  params?: any[]
): Promise<T[]> => {
  const result = await query<T>(sql, params);
  return result.rows;
};

// Insert query helper
export const insert = async (
  table: string, 
  data: Record<string, any>
): Promise<QueryResult> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  return query(sql, values);
};

// Update query helper
export const update = async (
  table: string, 
  data: Record<string, any>, 
  whereClause: string, 
  whereParams?: any[]
): Promise<QueryResult> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  const allParams = [...values, ...(whereParams || [])];
  
  return query(sql, allParams);
};

// Delete query helper
export const deleteRows = async (
  table: string, 
  whereClause: string, 
  params?: any[]
): Promise<QueryResult> => {
  const sql = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
  return query(sql, params);
};

// Check if table exists
export const tableExists = async (tableName: string): Promise<boolean> => {
  const sql = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  const result = await queryOne<{ exists: boolean }>(sql, [tableName]);
  return result?.exists || false;
};

// Get table row count
export const getRowCount = async (tableName: string): Promise<number> => {
  const sql = `SELECT COUNT(*) as count FROM ${tableName}`;
  const result = await queryOne<{ count: number }>(sql);
  return result?.count || 0;
};

// Database health check
export const healthCheck = async (): Promise<{
  connected: boolean;
  tables: Record<string, boolean>;
  timestamp: string;
}> => {
  const tables = ['users', 'teams', 'upgrades', 'user_upgrades', 'race_history', 'team_members'];
  const tableStatus: Record<string, boolean> = {};
  
  // Check each table
  for (const table of tables) {
    tableStatus[table] = await tableExists(table);
  }
  
  return {
    connected: isConnected,
    tables: tableStatus,
    timestamp: new Date().toISOString(),
  };
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Database connection pool closed');
    isConnected = false;
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Export pool for advanced usage
export { pool };

// Export connection status
export const getConnectionStatus = (): boolean => isConnected;

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    // Check if tables exist
    const health = await healthCheck();
    const missingTables = Object.entries(health.tables)
      .filter(([_, exists]) => !exists)
      .map(([table]) => table);
    
    if (missingTables.length > 0) {
      console.warn('⚠️  Missing tables:', missingTables);
      console.log('💡 Run the schema.sql file to create missing tables');
    } else {
      console.log('✅ All required tables exist');
    }
    
    console.log('🗄️  Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export default {
  query,
  queryOne,
  queryMany,
  insert,
  update,
  deleteRows,
  transaction,
  testConnection,
  healthCheck,
  initializeDatabase,
  closeDatabase,
  getConnectionStatus,
  pool,
};
