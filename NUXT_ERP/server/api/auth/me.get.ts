import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/auth/me
 * Obtiene información del usuario autenticado
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        message: 'No autenticado'
      };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        area_id: user.area_id,
        area_name: user.area_name,
        is_first_user: user.is_first_user,
        created_at: user.created_at
      }
    };
  } catch (error: any) {
    console.error('Error en /api/auth/me:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
});
