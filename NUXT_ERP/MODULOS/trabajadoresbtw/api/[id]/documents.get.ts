import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';

/**
 * GET /api/modules/trabajadoresbtw/:id/documents
 * Obtiene los documentos de un trabajador
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const trabajadorId = getRouterParam(event, 'id');

    if (!trabajadorId) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de trabajador requerido' };
    }

    // Obtener documentos del trabajador
    const result = await executeQuery(
      `SELECT 
        td.id,
        td.tipo_documento,
        td.nombre_archivo,
        td.ruta_archivo,
        td.fecha_subida,
        u.name as subido_por_nombre
      FROM trabajadores_documentos td
      LEFT JOIN users u ON td.subido_por = u.id
      WHERE td.trabajador_id = ?
      ORDER BY td.fecha_subida DESC`,
      [trabajadorId]
    );

    if (!result.success) {
      throw new Error('Error al obtener documentos');
    }

    return {
      success: true,
      documents: result.data || []
    };

  } catch (error: any) {
    console.error('Error obteniendo documentos:', error);
    setResponseStatus(event, 500);
    return { 
      success: false, 
      message: 'Error al obtener documentos',
      error: error.toString()
    };
  }
});
