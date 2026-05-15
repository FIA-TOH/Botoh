import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import config from './environment';

// Clean Supabase PostgreSQL connection configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || config.databaseUrl,
  // Supabase requires SSL with proper configuration
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
    // Don't use SSL mode in connection string, use pg's SSL config instead
  },
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // Connection timeout
  query_timeout: 30000, // Query timeout in milliseconds
  // Additional Supabase-specific settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Database connection status
let isConnected = false;

// Handle pool events with proper error handling
pool.on('connect', () => {
  if (!isConnected) {
    console.log('🗄️  Database connected successfully');
    isConnected = true;
  }
});

pool.on('error', (err: Error) => {
  console.error('❌ Database connection error:', err.message);
  isConnected = false;
});

pool.on('remove', () => {
  // Silent - too verbose for development
});

// Test connection function with Supabase-specific error handling
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    
    // Simple test query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    
    console.log('✅ Database connected successfully');
    console.log(`🗄️  PostgreSQL ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    
    // Supabase-specific error handling
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Check Supabase project status');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Check network connectivity');
    } else if (error.code === '3D000') {
      console.error('🗄️  Database does not exist');
    } else if (error.code === '28P01') {
      console.error('🔐 Check Supabase credentials');
    } else if (error.code === 'ECONNRESET') {
      console.error('🔄 Check SSL configuration');
    }
    
    return false;
  }
};

// Main query function with proper error handling
export const query = async <T extends QueryResultRow = any>(
  sql: string, 
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;
    
    // Log only slow queries (> 1 second)
    if (duration > 1000) {
      console.log(`⚠️  Slow query (${duration}ms):`, sql.substring(0, 50) + '...');
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Query failed (${duration}ms):`, sql.substring(0, 50) + '...');
    throw error;
  }
};

// Transaction helper with proper error handling
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

// Query helpers
export const queryOne = async <T extends QueryResultRow = any>(
  sql: string, 
  params?: any[]
): Promise<T | null> => {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
};

export const queryMany = async <T extends QueryResultRow = any>(
  sql: string, 
  params?: any[]
): Promise<T[]> => {
  const result = await query<T>(sql, params);
  return result.rows;
};

// CRUD helpers
export const insert = async <T extends QueryResultRow = any>(
  table: string, 
  data: Record<string, any>
): Promise<T> => {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await query<T>(sql, values);
  return result.rows[0];
};

export const update = async <T extends QueryResultRow = any>(
  table: string, 
  id: string | number, 
  data: Record<string, any>
): Promise<T | null> => {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
  const result = await query<T>(sql, [...values, id]);
  return result.rows[0] || null;
};

export const deleteRows = async (
  table: string, 
  condition: string, 
  params?: any[]
): Promise<number> => {
  const sql = `DELETE FROM ${table} WHERE ${condition}`;
  const result = await query(sql, params);
  return result.rowCount || 0;
};

// Health check function for monitoring
export const healthCheck = async () => {
  const tables = ['users', 'teams', 'upgrades', 'user_upgrades', 'race_history', 'team_members'];
  const tableStatus: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const result = await queryOne(
        'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2) as exists',
        ['public', table]
      );
      tableStatus[table] = result?.exists || false;
    } catch (error) {
      tableStatus[table] = false;
    }
  }
  
  return {
    connected: isConnected,
    tables: tableStatus,
    timestamp: new Date().toISOString()
  };
};

// Close database connection gracefully
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Initialize database connection with retry logic
export const initializeDatabase = async (): Promise<void> => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test connection with timeout
      const connected = await Promise.race([
        testConnection(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        )
      ]);
      
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
      
      // Check if tables exist
      const health = await healthCheck();
      const missingTables = Object.entries(health.tables)
        .filter(([_, exists]) => !exists)
        .map(([table]) => table);
      
      if (missingTables.length > 0) {
        console.warn('⚠️  Missing tables:', missingTables.join(', '));
      }
      
      return; // Success, exit retry loop
      
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ Database connection failed - Check credentials');
        throw new Error('Failed to connect to database after multiple attempts');
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Export connection status
export const getConnectionStatus = (): boolean => isConnected;

// Export pool for advanced usage
export { pool };

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
