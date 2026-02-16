import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * GET /api/modules/facturas/list
 * Obtiene lista de facturas con filtros opcionales
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Obtener parámetros de query
    const query = getQuery(event);
    const search = query.search as string || '';
    const status = query.status as string || '';
    const clientName = query.client_name as string || '';

    // Construir query SQL con filtros
    let sql = `
      SELECT 
        id, invoice_number, type, client_name, client_rfc, 
        description, subtotal, tax, total, status, 
        issue_date, due_date, payment_date, notes, 
        created_at, updated_at
      FROM invoices 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (invoice_number LIKE ? OR client_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (clientName) {
      sql += ` AND client_name LIKE ?`;
      params.push(`%${clientName}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await executeQuery(sql, params);

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al obtener facturas' };
    }

    return {
      success: true,
      invoices: result.data || [],
      total: result.data?.length || 0
    };

  } catch (error: any) {
    console.error('Error obteniendo facturas:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener facturas'
    };
  }
});
