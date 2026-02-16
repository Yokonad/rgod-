import { getUserFromRequest } from '../../utils/session';
import { getModulesForUser } from '../../utils/moduleLoader';

/**
 * GET /api/modules/scan
 * Escanea y devuelve todos los módulos dinámicos disponibles
 * ACTUALIZADO: Ahora verifica estados en BD además del module.json
 * Y valida acceso por rol y área del usuario
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Obtener módulos disponibles para el usuario (considerando rol y área)
    const availableModules = await getModulesForUser({
      role: user.role,
      area_name: user.area_name
    });

    return {
      success: true,
      modules: availableModules,
      total: availableModules.length
    };

  } catch (error: any) {
    console.error('Error escaneando módulos:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al escanear módulos',
      error: error.message
    };
  }
});
