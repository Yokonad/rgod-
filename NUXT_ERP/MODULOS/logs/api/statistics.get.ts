import { defineEventHandler, setResponseStatus } from 'h3';
import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * GET /api/modules/logs/statistics
 * Obtiene estadísticas agregadas de los logs del sistema
 * Solo accesible para administradores
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

    // Total de logs en los últimos 7 días
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Logs en las últimas 24 horas
    const last24hResult = await executeQuery(`
      SELECT COUNT(*) as count
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Total de logs (todos)
    const allTimeResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM system_logs
    `);

    // Total de errores
    const errorsResult = await executeQuery(`
      SELECT COUNT(*) as count
      FROM system_logs
      WHERE event_type = 'error'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Total de advertencias
    const warningsResult = await executeQuery(`
      SELECT COUNT(*) as count
      FROM system_logs
      WHERE event_type = 'warning'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Eventos críticos
    const criticalResult = await executeQuery(`
      SELECT COUNT(*) as count
      FROM system_logs
      WHERE severity = 'critical'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Distribución por severidad
    const bySeverityResult = await executeQuery(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY severity
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);

    // Distribución por módulo
    const byModuleResult = await executeQuery(`
      SELECT 
        module,
        COUNT(*) as count
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY module
      ORDER BY count DESC
      LIMIT 10
    `);

    // Distribución por tipo de evento
    const byEventTypeResult = await executeQuery(`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM system_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY event_type
      ORDER BY count DESC
    `);

    // Usuarios más activos
    const topUsersResult = await executeQuery(`
      SELECT 
        user_id,
        user_name,
        COUNT(*) as action_count
      FROM system_logs
      WHERE user_id IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY user_id, user_name
      ORDER BY action_count DESC
      LIMIT 5
    `);

    return {
      success: true,
      statistics: {
        total: allTimeResult.data?.[0]?.total || 0,
        last_24h: last24hResult.data?.[0]?.count || 0,
        last_7days: totalResult.data?.[0]?.total || 0,
        total_errors: errorsResult.data?.[0]?.count || 0,
        total_warnings: warningsResult.data?.[0]?.count || 0,
        critical_events: criticalResult.data?.[0]?.count || 0,
        by_severity: bySeverityResult.data || [],
        by_module: byModuleResult.data || [],
        by_event_type: byEventTypeResult.data || [],
        top_users: topUsersResult.data || []
      }
    };

  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    };
  }
});
