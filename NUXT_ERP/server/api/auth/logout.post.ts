import { deleteSession } from '../../utils/session';
import { executeQuery } from '../../utils/db';
import { logAuth } from '../../utils/logger';

/**
 * POST /api/auth/logout
 * Cierra la sesión actual
 */
export default defineEventHandler(async (event) => {
  try {
    // Obtener el token del header o de la cookie
    const authHeader = getHeader(event, 'authorization');
    const cookieToken = getCookie(event, 'bytewave_auth_token');
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : cookieToken;
    
    if (!token) {
      setResponseStatus(event, 401);
      return {
        success: false,
        message: 'Token no proporcionado'
      };
    }
    
    // Obtener información del usuario antes de borrar la sesión
    const userResult = await executeQuery(
      'SELECT u.id, u.name, u.email FROM users u INNER JOIN sessions s ON u.id = s.user_id WHERE s.token = ?',
      [token]
    );
    
    const user = userResult.success && (userResult.data as any[]).length > 0
      ? (userResult.data as any[])[0]
      : null;
    
    // Eliminar la sesión
    const result = await deleteSession(token);
    
    if (!result.success) {
      setResponseStatus(event, 500);
      return {
        success: false,
        message: 'Error al cerrar sesión',
        error: result.error
      };
    }
    
    // Registrar logout en sistema de logs
    if (user) {
      await logAuth(event, 'logout', user, true, 'Cierre de sesión exitoso');
    }
    
    // Eliminar la cookie de autenticación
    deleteCookie(event, 'bytewave_auth_token', {
      path: '/'
    });
    
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  } catch (error: any) {
    console.error('Error en logout:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
});
