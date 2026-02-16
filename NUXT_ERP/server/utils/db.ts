import mysql from 'mysql2/promise';

// Pool de conexiones para optimizar el rendimiento
let pool: any = null;

export function getPool() {
  if (!pool) {
    const config = useRuntimeConfig();
    
    pool = mysql.createPool({
      host: config.dbHost,
      port: parseInt(config.dbPort),
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      waitForConnections: true,
      connectionLimit: 20,
      maxIdle: 10, // Máximo de conexiones inactivas
      idleTimeout: 60000, // 60 segundos para timeout de inactivas
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  
  return pool;
}

// Función para verificar la conexión
export async function checkDatabaseConnection() {
  try {
    const dbPool = getPool();
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    return { 
      success: true, 
      message: 'Conexión exitosa a la base de datos',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Error al conectar con la base de datos',
      timestamp: new Date().toISOString()
    };
  }
}

// Función helper para ejecutar queries
export async function executeQuery(query: string, params: any[] = []) {
  let connection;
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const dbPool = getPool();
      connection = await dbPool.getConnection();
      const [rows] = await connection.query(query, params);
      return { success: true, data: rows };
    } catch (error: any) {
      lastError = error;
      console.error(`Error ejecutando query (intento ${attempt + 1}/${maxRetries + 1}):`, error.message);
      
      // Si es timeout o error de conexión y no es el último intento, esperar y reintentar
      if (attempt < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED')) {
        // Recrear el pool si hay error de conexión
        pool = null;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        continue;
      }
      
      // Si llegamos aquí, ya no reintentamos
      break;
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (e) {
          console.error('Error al liberar conexión:', e);
        }
      }
    }
  }
  
  return { success: false, error: lastError?.message || 'Error desconocido' };
}
