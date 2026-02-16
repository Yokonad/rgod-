import { checkDatabaseConnection } from '../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const result = await checkDatabaseConnection();
    
    if (result.success) {
      return {
        status: 'connected',
        message: result.message,
        timestamp: result.timestamp,
        database: useRuntimeConfig().dbName
      };
    } else {
      setResponseStatus(event, 503);
      return {
        status: 'disconnected',
        message: result.message,
        timestamp: result.timestamp
      };
    }
  } catch (error: any) {
    setResponseStatus(event, 500);
    return {
      status: 'error',
      message: error.message || 'Error interno del servidor',
      timestamp: new Date().toISOString()
    };
  }
});
