import { defineEventHandler, setResponseStatus } from 'h3';
import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/user-positions
 * Obtiene las posiciones personalizadas de iconos del usuario
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    const userId = user.id;

    // Obtener posiciones del usuario
    const result = await executeQuery(
      `SELECT item_type, item_id, position 
       FROM user_icon_positions 
       WHERE user_id = ? 
       ORDER BY position ASC`,
      [userId]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al obtener posiciones' };
    }

    return {
      success: true,
      positions: result.data || []
    };
  } catch (error: any) {
    console.error('Error en GET /api/user-positions:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al obtener posiciones'
    };
  }
});
