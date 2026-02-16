import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from 'h3';
import { executeQuery } from '../../../utils/db';
import { getUserFromRequest } from '../../../utils/session';

/**
 * DELETE /api/folders/:id/modules
 * Elimina un módulo de una carpeta (solo admin)
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    // Verificar que sea admin
    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'Solo administradores pueden eliminar módulos de carpetas' };
    }

    const folderId = getRouterParam(event, 'id');
    if (!folderId) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de carpeta requerido' };
    }

    const body = await readBody(event);
    const { moduleName } = body;

    if (!moduleName) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Nombre de módulo requerido' };
    }

    // Eliminar módulo de la carpeta
    const result = await executeQuery(
      'DELETE FROM folder_modules WHERE folder_id = ? AND module_name = ?',
      [folderId, moduleName]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al eliminar módulo de la carpeta' };
    }

    return {
      success: true,
      message: 'Módulo eliminado de la carpeta exitosamente'
    };
  } catch (error: any) {
    console.error('Error en DELETE /api/folders/:id/modules:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al eliminar módulo de la carpeta'
    };
  }
});
