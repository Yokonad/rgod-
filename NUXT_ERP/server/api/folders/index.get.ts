import { defineEventHandler, getQuery, setResponseStatus } from 'h3';
import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/folders
 * Obtiene todas las carpetas disponibles
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    // Obtener carpetas con información de módulos
    const result = await executeQuery(`
      SELECT 
        f.id,
        f.name,
        f.icon,
        f.color,
        f.description,
        f.order_index,
        f.created_by,
        u.name as created_by_name,
        f.created_at,
        f.updated_at,
        COUNT(fm.id) as module_count
      FROM module_folders f
      LEFT JOIN folder_modules fm ON f.id = fm.folder_id
      LEFT JOIN users u ON f.created_by = u.id
      GROUP BY f.id
      ORDER BY f.order_index ASC
    `);

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al obtener carpetas' };
    }

    return {
      success: true,
      folders: result.data || []
    };
  } catch (error: any) {
    console.error('Error en GET /api/folders:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al obtener carpetas'
    };
  }
});
