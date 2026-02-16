import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from 'h3';
import { executeQuery } from '../../../utils/db';
import { getUserFromRequest } from '../../../utils/session';

/**
 * POST /api/folders/:id/modules
 * Agrega un módulo a una carpeta (solo admin)
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
      return { success: false, message: 'Solo administradores pueden agregar módulos a carpetas' };
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

    // Verificar si el módulo ya está en la carpeta
    const existingResult = await executeQuery(
      'SELECT id FROM folder_modules WHERE folder_id = ? AND module_name = ?',
      [folderId, moduleName]
    );

    if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El módulo ya está en esta carpeta' };
    }

    // Obtener el último order_index de esta carpeta
    const maxOrderResult = await executeQuery(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM folder_modules WHERE folder_id = ?',
      [folderId]
    );
    const nextOrder = (maxOrderResult.data?.[0]?.max_order || -1) + 1;

    // Agregar módulo a la carpeta
    const result = await executeQuery(
      'INSERT INTO folder_modules (folder_id, module_name, order_index) VALUES (?, ?, ?)',
      [folderId, moduleName, nextOrder]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al agregar módulo a la carpeta' };
    }

    return {
      success: true,
      message: 'Módulo agregado a la carpeta exitosamente'
    };
  } catch (error: any) {
    console.error('Error en POST /api/folders/:id/modules:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al agregar módulo a la carpeta'
    };
  }
});
