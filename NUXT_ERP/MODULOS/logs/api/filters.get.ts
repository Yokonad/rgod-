import { defineEventHandler, setResponseStatus } from 'h3';
import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';


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

    // Obtener módulos únicos
    const modulesResult = await executeQuery(`
      SELECT DISTINCT module
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY module
    `);

    // Obtener usuarios únicos
    const usersResult = await executeQuery(`
      SELECT DISTINCT user_id, user_name
      FROM system_logs
      WHERE user_id IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY user_name
    `);

    // Obtener acciones únicas por módulo (top 50)
    const actionsResult = await executeQuery(`
      SELECT DISTINCT action, module
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY module, action
      LIMIT 50
    `);

    // Tipos de evento y severidades están predefinidos pero los incluimos por completitud
    const eventTypes = [
      'create',
      'read', 
      'update',
      'delete',
      'auth',
      'error',
      'warning',
      'info'
    ];

    const severities = [
      'low',
      'medium',
      'high',
      'critical'
    ];

    return {
      success: true,
      filters: {
        modules: modulesResult.data?.map((row: any) => row.module) || [],
        users: usersResult.data || [],
        actions: actionsResult.data || [],
        event_types: eventTypes,
        severities: severities
      }
    };

  } catch (error: any) {
    console.error('Error obteniendo filtros:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener filtros',
      error: error.message
    };
  }
});
