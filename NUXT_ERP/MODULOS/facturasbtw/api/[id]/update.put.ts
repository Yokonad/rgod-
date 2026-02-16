import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';
import { logCRUD, logError } from '../../../../server/utils/logger';

/**
 * PUT /api/modules/facturas/:id/update
 * Actualiza una factura existente
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const id = getRouterParam(event, 'id');
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

    // Actualizar factura
    const result = await executeQuery(
      `UPDATE invoices 
       SET invoice_number = ?, type = ?, client_name = ?, client_rfc = ?, 
           description = ?, subtotal = ?, tax = ?, total = ?, 
           status = ?, issue_date = ?, due_date = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        body.invoice_number,
        body.type,
        body.client_name,
        body.client_rfc || null,
        body.description,
        body.subtotal,
        body.tax,
        body.total,
        body.status,
        body.issue_date,
        body.due_date || null,
        body.notes || null,
        id
      ]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al actualizar factura' };
    }

    // Registrar en logs
    await logCRUD(
      event,
      'facturas',
      'update_invoice',
      'update',
      user,
      `Factura actualizada: ${body.invoice_number} - ${body.client_name}`,
      {
        invoice_id: id,
        invoice_number: body.invoice_number,
        client_name: body.client_name,
        total: body.total,
        status: body.status
      }
    );

    return {
      success: true,
      message: 'Factura actualizada exitosamente'
    };

  } catch (error: any) {
    console.error('Error actualizando factura:', error);
    
    // Registrar error en logs
    try {
      const user = await getUserFromRequest(event);
      if (user) {
        await logError(event, error, 'facturas', 'update_invoice', user);
      }
    } catch (logErr) {
      console.error('Error registrando log:', logErr);
    }
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al actualizar factura'
    };
  }
});
