import { getUserFromRequest } from '../../../utils/session';
import { getModuleConfig, isModuleAvailableAsync } from '../../../utils/moduleLoader';

/**
 * GET /api/modules/:id/info
 * Obtiene información de un módulo específico
 * ACTUALIZADO: Verifica disponibilidad con estado de BD
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const moduleId = event.context.params?.id;

    if (!moduleId) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de módulo requerido' };
    }

    // Obtener configuración del módulo
    const moduleConfig = getModuleConfig(moduleId);

    if (!moduleConfig) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Módulo no encontrado' };
    }

    // Verificar que tenga componente
    if (!moduleConfig.hasComponent) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Módulo no tiene interfaz visual' };
    }

    // Verificar estado habilitado (del JSON, no de BD)
    if (!moduleConfig.enabled) {
      setResponseStatus(event, 403);
      return { success: false, message: 'Módulo deshabilitado' };
    }

    // Verificar permisos
    if (user.role !== 'admin' && moduleConfig.access_level === 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'No tienes permisos para acceder a este módulo' };
    }

    return {
      success: true,
      module: moduleConfig
    };

  } catch (error: any) {
    console.error('Error obteniendo información del módulo:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener información del módulo'
    };
  }
});
