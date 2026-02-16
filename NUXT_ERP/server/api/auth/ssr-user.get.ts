import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/auth/ssr-user
 * Obtiene información del usuario para SSR (usa cookies)
 * Este endpoint es específico para server-side rendering
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      return {
        success: false,
        user: null
      };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_first_user: user.is_first_user,
        created_at: user.created_at
      }
    };
  } catch (error: any) {
    console.error('Error en /api/auth/ssr-user:', error);
    return {
      success: false,
      user: null
    };
  }
});
