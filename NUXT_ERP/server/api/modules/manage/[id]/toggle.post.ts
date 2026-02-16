import { getUserFromRequest } from '../../../../utils/session';
import { getModuleConfig } from '../../../../utils/moduleLoader';
import { executeQuery } from '../../../../utils/db';

/**
 * POST /api/modules/manage/:id/toggle
 * Activa o desactiva un módulo dinámico
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

    const body = await readBody(event);
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      setResponseStatus(event, 400);
      return { success: false, message: 'Campo "enabled" debe ser boolean' };
    }

    // Verificar que el módulo existe
    const moduleConfig = getModuleConfig(moduleId);
    if (!moduleConfig) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Módulo no encontrado' };
    }

    // Verificar si ya existe un registro en module_states
    const existingResult = await executeQuery(
      'SELECT id, is_enabled FROM module_states WHERE module_id = ?',
      [moduleId]
    );

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
      // Actualizar registro existente
      await executeQuery(
        `UPDATE module_states 
         SET is_enabled = ?, 
             ${enabled ? 'enabled_by' : 'disabled_by'} = ?,
             ${enabled ? 'enabled_at' : 'disabled_at'} = ?
         WHERE module_id = ?`,
        [enabled, user.id, now, moduleId]
      );
    } else {
      // Crear nuevo registro
      await executeQuery(
        `INSERT INTO module_states (module_id, is_enabled, ${enabled ? 'enabled_by, enabled_at' : 'disabled_by, disabled_at'}) 
         VALUES (?, ?, ?, ?)`,
        [moduleId, enabled, user.id, now]
      );
    }

    // Registrar en activity_logs
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [
        user.id,
        enabled ? 'enable_module' : 'disable_module',
        `${enabled ? 'Activó' : 'Desactivó'} el módulo: ${moduleConfig.name} (${moduleId})`
      ]
    );

    return {
      success: true,
      message: `Módulo ${enabled ? 'activado' : 'desactivado'} exitosamente`,
      module: {
        id: moduleId,
        name: moduleConfig.name,
        enabled
      }
    };

  } catch (error: any) {
    console.error('Error al cambiar estado del módulo:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al cambiar estado del módulo',
      error: error.message
    };
  }
});
