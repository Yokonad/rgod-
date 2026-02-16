import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';
import { logCRUD, logError } from '../../../../server/utils/logger';

/**
 * PUT /api/modules/trabajadoresbtw/:id/update
 * Actualiza un trabajador existente
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
      return { success: false, message: 'Solo los administradores pueden editar trabajadores' };
    }

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de trabajador inválido' };
    }

    // Verificar que el trabajador existe
    const existingWorker = await executeQuery(
      'SELECT id, dni FROM trabajadores WHERE id = ?',
      [id]
    );

    if (!existingWorker.success || !existingWorker.data || existingWorker.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Trabajador no encontrado' };
    }

    // Verificar DNI duplicado (excluyendo el trabajador actual)
    if (body.dni && body.dni !== existingWorker.data[0].dni) {
      const duplicateDNI = await executeQuery(
        'SELECT id FROM trabajadores WHERE dni = ? AND id != ?',
        [body.dni, id]
      );

      if (duplicateDNI.success && duplicateDNI.data && duplicateDNI.data.length > 0) {
        setResponseStatus(event, 409);
        return { success: false, message: 'Ya existe otro trabajador con ese DNI' };
      }
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    const allowedFields = [
      'dni', 'nombres', 'apellido_paterno', 'apellido_materno', 'nombre_completo',
      'fecha_nacimiento', 'lugar_nacimiento', 'nacionalidad', 'sexo', 'estado_civil',
      'telefono', 'celular', 'email', 'direccion', 'distrito', 'provincia', 'departamento',
      'area_id', 'puesto', 'fecha_ingreso', 'fecha_cese', 'tipo_contrato', 'estado',
      'observaciones', 'emergencia_nombre', 'emergencia_telefono', 'emergencia_parentesco'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field] === '' ? null : body[field]);
      }
    }

    if (updates.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No hay campos para actualizar' };
    }

    values.push(id);

    await executeQuery(
      `UPDATE trabajadores SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Registrar en logs
    await logCRUD(
      event,
      'trabajadores',
      'update_worker',
      'update',
      user,
      `Trabajador actualizado ID: ${id}`,
      {
        trabajador_id: id,
        updated_fields: allowedFields.filter(f => body[f] !== undefined)
      }
    );

    return {
      success: true,
      message: 'Trabajador actualizado exitosamente'
    };

  } catch (error: any) {
    console.error('Error actualizando trabajador:', error);
    
    // Registrar error en logs
    await logError(event, error, 'trabajadores', 'update_worker', user);
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al actualizar trabajador: ' + error.message
    };
  }
});
