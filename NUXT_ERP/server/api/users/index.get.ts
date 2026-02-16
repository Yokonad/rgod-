import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/users
 * Obtiene lista de usuarios (solo admin)
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
      return { success: false, message: 'No tienes permisos para ver usuarios' };
    }

    const result = await executeQuery(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, u.area_id,
       a.name as area_name, a.color as area_color, a.icon as area_icon,
       (SELECT COUNT(*) FROM sessions WHERE user_id = u.id AND expires_at > NOW()) as active_sessions
       FROM users u
       LEFT JOIN areas a ON u.area_id = a.id
       ORDER BY u.created_at DESC`
    );

    return {
      success: true,
      users: result.success && result.data ? result.data : []
    };

  } catch (error: any) {
    console.error('Error obteniendo usuarios:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener usuarios'
    };
  }
});
