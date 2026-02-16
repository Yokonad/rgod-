import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';
import { logCRUD, logError } from '../../../server/utils/logger';

/**
 * POST /api/modules/facturas/create
 * Crea una nueva factura
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const body = await readBody(event);

    // Validaciones
    if (!body.invoice_number || !body.client_name || !body.total) {
      setResponseStatus(event, 400);
      return { 
        success: false, 
        message: 'Número de factura, cliente y total son requeridos' 
      };
    }

    if (body.total <= 0) {
      setResponseStatus(event, 400);
      return { 
        success: false, 
        message: 'El total debe ser mayor a 0' 
      };
    }

    // Insertar factura
    const result = await executeQuery(
      `INSERT INTO invoices 
        (invoice_number, type, client_name, client_rfc, description, 
         subtotal, tax, total, status, issue_date, due_date, notes, user_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.invoice_number,
        body.type || 'emitida',
        body.client_name,
        body.client_rfc || null,
        body.description || '',
        body.subtotal || 0,
        body.tax || 0,
        body.total,
        body.status || 'pendiente',
        body.issue_date || new Date().toISOString().split('T')[0],
        body.due_date || null,
        body.notes || null,
        user.id
      ]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al crear factura' };
    }

    // Registrar en logs
    await logCRUD(
      event,
      'facturas',
      'create_invoice',
      'create',
      user,
      `Factura creada: ${body.invoice_number} - ${body.client_name}`,
      {
        invoice_id: result.data.insertId,
        invoice_number: body.invoice_number,
        client_name: body.client_name,
        total: body.total,
        type: body.type || 'emitida'
      }
    );

    return {
      success: true,
      id: result.data.insertId,
      message: 'Factura creada exitosamente'
    };

  } catch (error: any) {
    console.error('Error creando factura:', error);
    
    // Registrar error en logs
    try {
      const user = await getUserFromRequest(event);
      if (user) {
        await logError(event, error, 'facturas', 'create_invoice', user);
      }
    } catch (logErr) {
      console.error('Error registrando log:', logErr);
    }
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al crear factura'
    };
  }
});
