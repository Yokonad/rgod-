import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * POST /api/user-positions/save
 * Guarda las posiciones personalizadas de iconos del usuario
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    const body = await readBody(event);
    const { positions } = body;

    if (!positions || !Array.isArray(positions)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Posiciones inválidas' };
    }

    const userId = user.id;

    // Eliminar posiciones anteriores del usuario
    await executeQuery(
      'DELETE FROM user_icon_positions WHERE user_id = ?',
      [userId]
    );

    // Insertar nuevas posiciones
    if (positions.length > 0) {
      const values = positions.map((pos: any, index: number) => {
        return [userId, pos.type, pos.id, index];
      });

      const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();

      await executeQuery(
        `INSERT INTO user_icon_positions (user_id, item_type, item_id, position) 
         VALUES ${placeholders}`,
        flatValues
      );
    }

    return {
      success: true,
      message: 'Posiciones guardadas exitosamente'
    };
  } catch (error: any) {
    console.error('Error en POST /api/user-positions/save:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al guardar posiciones'
    };
  }
});
