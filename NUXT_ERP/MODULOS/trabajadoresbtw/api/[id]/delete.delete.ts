import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';
import { logCRUD, logError } from '../../../../server/utils/logger';

/**
 * DELETE /api/modules/trabajadoresbtw/:id/delete
 * Elimina un trabajador
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'Solo los administradores pueden eliminar trabajadores' };
    }

    const id = getRouterParam(event, 'id');

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de trabajador inválido' };
    }

    // Obtener datos del trabajador antes de eliminar
    const workerData = await executeQuery(
      'SELECT dni, nombres, apellido_paterno FROM trabajadores WHERE id = ?',
      [id]
    );

    if (!workerData.success || !workerData.data || workerData.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Trabajador no encontrado' };
    }

    const worker = workerData.data[0];

    // Eliminar trabajador (los documentos se eliminan en cascada)
    await executeQuery('DELETE FROM trabajadores WHERE id = ?', [id]);

    // Registrar en logs
    await logCRUD(
      event,
      'trabajadores',
      'delete_worker',
      'delete',
      user,
      `Trabajador eliminado: ${worker.nombres} ${worker.apellido_paterno} (${worker.dni})`,
      {
        trabajador_id: id,
        dni: worker.dni,
        nombre_completo: `${worker.nombres} ${worker.apellido_paterno}`
      }
    );

    return {
      success: true,
      message: 'Trabajador eliminado exitosamente'
    };

  } catch (error: any) {
    console.error('Error eliminando trabajador:', error);
    
    // Registrar error en logs
    await logError(event, error, 'trabajadores', 'delete_worker', user);
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al eliminar trabajador: ' + error.message
    };
  }
});
