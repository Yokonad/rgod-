import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * GET /api/modules
 * Obtiene los módulos disponibles según el rol del usuario
 */
const overrideModuleNames = (modules: any[]) => {
  return modules.map(m => {
    if (m.name === 'users') {
      m.display_name = 'USUARIOS';
      m.gradient = '#ffcc80'; // Pastel Orange (Solid)
    }
    if (m.name === 'modules-manager') {
      m.display_name = 'GESTOR DE MODULOS';
      m.gradient = '#d1d5db'; // Pastel Gray (Solid)
      m.icon = 'gear'; // Better icon
    }
    return m;
  });
};

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);

    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Admin puede ver todos los módulos
    if (user.role === 'admin') {
      const result = await executeQuery(
        `SELECT id, name, display_name, description, icon, route, access_level, is_active, order_index
         FROM modules 
         WHERE is_active = TRUE 
         ORDER BY order_index ASC, display_name ASC`
      );

      return {
        success: true,
        modules: result.success && result.data ? overrideModuleNames(result.data) : []
      };
    }

    // Usuario normal solo ve módulos públicos y de usuario
    const result = await executeQuery(
      `SELECT id, name, display_name, description, icon, route, access_level, is_active, order_index
       FROM modules 
       WHERE is_active = TRUE 
       AND (access_level IN ('public', 'user', 'mixed'))
       ORDER BY order_index ASC, display_name ASC`
    );

    return {
      success: true,
      modules: result.success && result.data ? overrideModuleNames(result.data) : []
    };

  } catch (error: any) {
    console.error('Error obteniendo módulos:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener módulos'
    };
  }
});
