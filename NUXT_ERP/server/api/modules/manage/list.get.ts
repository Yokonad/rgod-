import { getUserFromRequest } from '../../../utils/session';
import { scanModulesAsync } from '../../../utils/moduleLoader';

/**
 * GET /api/modules/manage/list
 * Lista TODOS los módulos dinámicos con su estado (habilitado/deshabilitado)
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

    // Escanear todos los módulos con información de BD
    const modulesWithState = await scanModulesAsync();

    // Formatear respuesta
    const formattedModules = modulesWithState.map(module => ({
      id: module.id,
      name: module.name,
      description: module.description || 'Sin descripción',
      version: module.version,
      author: module.author || 'Desconocido',
      icon: module.icon || 'default',
      access_level: module.access_level || 'user',
      route: module.route,
      hasComponent: module.hasComponent,
      enabled: module.enabled,
      requiresDatabase: module.requiresDatabase || false,
      databaseInitialized: module.databaseInitialized || false,
      databaseVersion: module.databaseVersion || null,
      statusMessage: module.statusMessage || null
    }));

    return {
      success: true,
      modules: formattedModules,
      total: formattedModules.length
    };

  } catch (error: any) {
    console.error('Error listando módulos para gestión:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al listar módulos',
      error: error.message
    };
  }
});
