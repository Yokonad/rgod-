import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * DELETE /api/users/:id
 * Elimina un usuario (solo admin)
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
      return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
    }

    const userId = event.context.params?.id;

    if (!userId) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de usuario requerido' };
    }

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(userId) === user.id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No puedes eliminar tu propia cuenta' };
    }

    // Verificar que el usuario existe
    const targetUserResult = await executeQuery(
      'SELECT name, email FROM users WHERE id = ?',
      [userId]
    );

    if (!targetUserResult.success || !targetUserResult.data || targetUserResult.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const userInfo = targetUserResult.data[0];

    // Eliminar usuario (las sesiones y widgets se eliminarán en cascada)
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'delete_user', `Eliminó usuario: ${userInfo.name} (${userInfo.email})`]
    );

    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };

  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al eliminar usuario'
    };
  }
});
