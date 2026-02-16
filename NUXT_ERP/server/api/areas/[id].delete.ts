import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * DELETE /api/areas/:id
 * Elimina un área (solo admin)
 * No se puede eliminar si tiene usuarios asignados
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
      return { success: false, message: 'Solo los administradores pueden eliminar áreas' };
    }

    const id = getRouterParam(event, 'id');

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de área inválido' };
    }

    // Verificar que el área existe
    const areaResult = await executeQuery(
      'SELECT name FROM areas WHERE id = ?',
      [id]
    );

    if (!areaResult.success || !areaResult.data || areaResult.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Área no encontrada' };
    }

    const areaName = areaResult.data[0].name;

    // Verificar si hay usuarios asignados a esta área
    const usersInArea = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE area_id = ?',
      [id]
    );

    const userCount = usersInArea.success && usersInArea.data ? usersInArea.data[0].count : 0;

    if (userCount > 0) {
      setResponseStatus(event, 409);
      return { 
        success: false, 
        message: `No se puede eliminar el área porque tiene ${userCount} usuario(s) asignado(s). Primero reasigna o elimina los usuarios.` 
      };
    }

    // Eliminar área
    await executeQuery('DELETE FROM areas WHERE id = ?', [id]);

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'delete_area', `Eliminó área: ${areaName} (ID: ${id})`]
    );

    return {
      success: true,
      message: 'Área eliminada exitosamente'
    };

  } catch (error: any) {
    console.error('Error eliminando área:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al eliminar área'
    };
  }
});
