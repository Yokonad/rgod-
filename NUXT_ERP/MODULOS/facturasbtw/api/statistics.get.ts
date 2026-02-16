import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * GET /api/modules/facturas/statistics
 * Obtiene estadísticas de facturas
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const result = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN type = 'emitida' THEN 1 END) as emitidas_count,
        SUM(CASE WHEN type = 'emitida' THEN total ELSE 0 END) as emitidas_total,
        SUM(CASE WHEN type = 'emitida' AND status = 'pagada' THEN total ELSE 0 END) as emitidas_paid,
        SUM(CASE WHEN type = 'emitida' AND status = 'pendiente' THEN total ELSE 0 END) as emitidas_pending,
        
        COUNT(CASE WHEN type = 'recibida' THEN 1 END) as recibidas_count,
        SUM(CASE WHEN type = 'recibida' THEN total ELSE 0 END) as recibidas_total,
        SUM(CASE WHEN type = 'recibida' AND status = 'pagada' THEN total ELSE 0 END) as recibidas_paid,
        SUM(CASE WHEN type = 'recibida' AND status = 'pendiente' THEN total ELSE 0 END) as recibidas_pending
      FROM invoices
    `);

    if (!result.success || !result.data || result.data.length === 0) {
      return {
        success: true,
        statistics: {
          emitidas: { count: 0, total: 0, paid: 0, pending: 0 },
          recibidas: { count: 0, total: 0, paid: 0, pending: 0 }
        }
      };
    }

    const data = result.data[0];

    return {
      success: true,
      statistics: {
        emitidas: {
          count: parseInt(data.emitidas_count) || 0,
          total: parseFloat(data.emitidas_total) || 0,
          paid: parseFloat(data.emitidas_paid) || 0,
          pending: parseFloat(data.emitidas_pending) || 0
        },
        recibidas: {
          count: parseInt(data.recibidas_count) || 0,
          total: parseFloat(data.recibidas_total) || 0,
          paid: parseFloat(data.recibidas_paid) || 0,
          pending: parseFloat(data.recibidas_pending) || 0
        }
      }
    };

  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener estadísticas'
    };
  }
});
