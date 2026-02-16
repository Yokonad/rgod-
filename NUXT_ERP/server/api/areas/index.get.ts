import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/areas
 * Obtiene lista de áreas (solo admin)
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'No tienes permisos para ver áreas' };
    }

    const result = await executeQuery(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM users WHERE area_id = a.id) as user_count
       FROM areas a 
       ORDER BY a.name ASC`
    );

    return {
      success: true,
      areas: result.success && result.data ? result.data : []
    };

  } catch (error: any) {
    console.error('Error obteniendo áreas:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener áreas'
    };
  }
});
