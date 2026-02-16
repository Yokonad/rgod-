import { defineEventHandler, setResponseStatus, getQuery } from 'h3';
import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * GET /api/modules/logs/list
 * Obtiene lista paginada de logs del sistema con filtros
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

    // Obtener parámetros de query
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    const module = query.module as string || '';
    const eventType = query.event_type as string || '';
    const severity = query.severity as string || '';
    const userId = query.user_id as string || '';
    const search = query.search as string || '';

    // Construir query SQL con filtros
    let sql = `
      SELECT 
        id, user_id, user_name, user_email,
        module, action, event_type, severity,
        description, metadata,
        ip_address, user_agent,
        request_method, request_url, response_status,
        error_message, stack_trace,
        created_at
      FROM system_logs 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (module) {
      sql += ` AND module = ?`;
      params.push(module);
    }

    if (eventType) {
      sql += ` AND event_type = ?`;
      params.push(eventType);
    }

    if (severity) {
      sql += ` AND severity = ?`;
      params.push(severity);
    }

    if (userId) {
      sql += ` AND user_id = ?`;
      params.push(parseInt(userId));
    }

    if (search) {
      sql += ` AND (description LIKE ? OR action LIKE ? OR error_message LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Contar total de registros
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as filtered_logs`;
    const countResult = await executeQuery(countSql, params);
    const total = countResult.data?.[0]?.total || 0;

    // Agregar orden y límite
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Ejecutar query
    const result = await executeQuery(sql, params);

    if (!result.success) {
      throw new Error(result.error || 'Error en la consulta');
    }

    // Parsear metadata JSON si existe
    const logs = (result.data || []).map((log: any) => ({
      ...log,
      metadata: log.metadata ? (typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata) : null
    }));

    return {
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error: any) {
    console.error('Error listando logs:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener logs',
      error: error.message
    };
  }
});
