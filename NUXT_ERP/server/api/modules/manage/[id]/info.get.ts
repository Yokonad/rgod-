import { getUserFromRequest } from '../../../../utils/session';
import { getModuleConfig } from '../../../../utils/moduleLoader';
import { executeQuery } from '../../../../utils/db';

/**
 * GET /api/modules/manage/:id/info
 * Obtiene información detallada de un módulo específico
 * Solo accesible por administradores
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Solo administradores pueden acceder
    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'Acceso denegado. Solo administradores.' };
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

    // Obtener estado de BD
    const stateResult = await executeQuery(
      `SELECT ms.*, 
              u1.name as disabled_by_name,
              u2.name as enabled_by_name
       FROM module_states ms
       LEFT JOIN users u1 ON ms.disabled_by = u1.id
       LEFT JOIN users u2 ON ms.enabled_by = u2.id
       WHERE ms.module_id = ?`,
      [moduleId]
    );

    let state = null;
    if (stateResult.success && stateResult.data && stateResult.data.length > 0) {
      state = stateResult.data[0];
    }

    const effectiveEnabled = state ? state.is_enabled : moduleConfig.enabled;

    return {
      success: true,
      module: {
        id: moduleConfig.id,
        name: moduleConfig.name,
        description: moduleConfig.description || 'Sin descripción',
        version: moduleConfig.version,
        author: moduleConfig.author || 'Desconocido',
        icon: moduleConfig.icon || 'default',
        access_level: moduleConfig.access_level || 'user',
        route: moduleConfig.route,
        hasComponent: moduleConfig.hasComponent,
        enabled: effectiveEnabled,
        enabledInJson: moduleConfig.enabled,
        managedInDb: state !== null,
        stateHistory: state ? {
          disabledBy: state.disabled_by_name,
          disabledAt: state.disabled_at,
          enabledBy: state.enabled_by_name,
          enabledAt: state.enabled_at,
          lastUpdated: state.updated_at
        } : null
      }
    };

  } catch (error: any) {
    console.error('Error obteniendo información del módulo:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener información del módulo',
      error: error.message
    };
  }
});
