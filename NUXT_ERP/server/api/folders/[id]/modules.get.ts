import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3';
import { executeQuery } from '../../../utils/db';
import { getUserFromRequest } from '../../../utils/session';

/**
 * GET /api/folders/:id/modules
 * Obtiene los módulos de una carpeta específica
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    const folderId = getRouterParam(event, 'id');
    if (!folderId) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de carpeta requerido' };
    }

    // Obtener módulos de la carpeta
    const result = await executeQuery(
      `SELECT 
        fm.id,
        fm.module_name,
        fm.order_index,
        fm.created_at
      FROM folder_modules fm
      WHERE fm.folder_id = ?
      ORDER BY fm.order_index ASC`,
      [folderId]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al obtener módulos de la carpeta' };
    }

    return {
      success: true,
      modules: result.data || []
    };
  } catch (error: any) {
    console.error('Error en GET /api/folders/:id/modules:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al obtener módulos de la carpeta'
    };
  }
});
