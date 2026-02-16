import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';
import { logCRUD, logError } from '../../../../server/utils/logger';

/**
 * DELETE /api/modules/facturas/:id/delete
 * Elimina una factura
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const id = getRouterParam(event, 'id');

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de factura requerido' };
    }

    // Obtener información de la factura antes de eliminarla
    const invoiceResult = await executeQuery(
      'SELECT invoice_number, client_name, total FROM invoices WHERE id = ?',
      [id]
    );

    const invoice = invoiceResult.success && (invoiceResult.data as any[]).length > 0
      ? (invoiceResult.data as any[])[0]
      : null;

    // Eliminar factura
    const result = await executeQuery(
      'DELETE FROM invoices WHERE id = ?',
      [id]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al eliminar factura' };
    }

    // Verificar si se eliminó alguna fila
    const affectedRows = (result.data as any)?.affectedRows || 0;
    
    if (affectedRows === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Factura no encontrada' };
    }

    // Registrar en logs
    if (invoice) {
      await logCRUD(
        event,
        'facturas',
        'delete_invoice',
        'delete',
        user,
        `Factura eliminada: ${invoice.invoice_number} - ${invoice.client_name}`,
        {
          invoice_id: id,
          invoice_number: invoice.invoice_number,
          client_name: invoice.client_name,
          total: invoice.total
        }
      );
    }

    return {
      success: true,
      message: 'Factura eliminada exitosamente'
    };

  } catch (error: any) {
    console.error('Error eliminando factura:', error);
    
    // Registrar error en logs
    try {
      const user = await getUserFromRequest(event);
      if (user) {
        await logError(event, error, 'facturas', 'delete_invoice', user);
      }
    } catch (logErr) {
      console.error('Error registrando log:', logErr);
    }
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al eliminar factura'
    };
  }
});
