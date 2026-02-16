import { executeQuery } from '../utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Ejemplo: obtener información de la base de datos
    const result = await executeQuery('SELECT DATABASE() as current_db, VERSION() as version, NOW() as current_time');
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      setResponseStatus(event, 500);
      return {
        success: false,
        message: result.error || 'Error al ejecutar la consulta'
      };
    }
  } catch (error: any) {
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error interno del servidor'
    };
  }
});
