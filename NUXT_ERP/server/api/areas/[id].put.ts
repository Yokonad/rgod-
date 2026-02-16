import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';
import { sanitizeInput } from '../../../server/utils/auth';

/**
 * PUT /api/areas/:id
 * Actualiza un área existente (solo admin)
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
      return { success: false, message: 'Solo los administradores pueden editar áreas' };
    }

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const { name, description, color, icon, is_active } = body;

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de área inválido' };
    }

    // Verificar que el área existe
    const areaExists = await executeQuery(
      'SELECT id FROM areas WHERE id = ?',
      [id]
    );

    if (!areaExists.success || !areaExists.data || areaExists.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Área no encontrada' };
    }

    // Validaciones
    if (name && name.trim().length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El nombre del área no puede estar vacío' };
    }

    if (name && name.length > 100) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El nombre no puede exceder 100 caracteres' };
    }

    // Verificar nombre duplicado (excluyendo el área actual)
    if (name) {
      const duplicateName = await executeQuery(
        'SELECT id FROM areas WHERE name = ? AND id != ?',
        [name.trim(), id]
      );

      if (duplicateName.success && duplicateName.data && duplicateName.data.length > 0) {
        setResponseStatus(event, 409);
        return { success: false, message: 'Ya existe otra área con ese nombre' };
      }
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(sanitizeInput(name.trim()));
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description ? sanitizeInput(description.trim()) : null);
    }

    if (color !== undefined) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      const finalColor = colorRegex.test(color) ? color : '#3B82F6';
      updates.push('color = ?');
      values.push(finalColor);
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon ? sanitizeInput(icon.trim()) : 'briefcase');
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No hay campos para actualizar' };
    }

    values.push(id);

    // Actualizar área
    await executeQuery(
      `UPDATE areas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'update_area', `Actualizó área ID: ${id}`]
    );

    return {
      success: true,
      message: 'Área actualizada exitosamente'
    };

  } catch (error: any) {
    console.error('Error actualizando área:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al actualizar área'
    };
  }
});
