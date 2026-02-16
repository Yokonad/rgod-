import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';
import { hashPassword, isValidEmail, sanitizeInput } from '../../../server/utils/auth';

/**
 * PUT /api/users/:id
 * Actualiza un usuario existente (solo admin)
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
      return { success: false, message: 'Solo los administradores pueden editar usuarios' };
    }

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const { name, email, password, role, area_id } = body;

    if (!id) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de usuario inválido' };
    }

    // Verificar que el usuario existe
    const userExists = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!userExists.success || !userExists.data || userExists.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Validaciones
    if (email && !isValidEmail(email)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Email inválido' };
    }

    if (password && password.length < 8) {
      setResponseStatus(event, 400);
      return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const validRoles = ['admin', 'user'];
    if (role && !validRoles.includes(role)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Rol inválido' };
    }

    // Verificar email duplicado (excluyendo el usuario actual)
    if (email) {
      const duplicateEmail = await executeQuery(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.toLowerCase().trim(), id]
      );

      if (duplicateEmail.success && duplicateEmail.data && duplicateEmail.data.length > 0) {
        setResponseStatus(event, 409);
        return { success: false, message: 'El email ya está registrado por otro usuario' };
      }
    }

    // Validar area_id si se proporciona
    if (area_id !== undefined && area_id !== null) {
      const areaExists = await executeQuery(
        'SELECT id FROM areas WHERE id = ?',
        [area_id]
      );

      if (!areaExists.success || !areaExists.data || areaExists.data.length === 0) {
        setResponseStatus(event, 400);
        return { success: false, message: 'El área seleccionada no existe' };
      }
    }

    // Construir query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(sanitizeInput(name));
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email.toLowerCase().trim());
    }

    if (password !== undefined && password.length > 0) {
      updates.push('password = ?');
      const hashedPassword = await hashPassword(password);
      values.push(hashedPassword);
    }

    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (area_id !== undefined) {
      updates.push('area_id = ?');
      values.push(area_id || null);
    }

    if (updates.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No hay campos para actualizar' };
    }

    values.push(id);

    // Actualizar usuario
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'update_user', `Actualizó usuario ID: ${id}`]
    );

    return {
      success: true,
      message: 'Usuario actualizado exitosamente'
    };

  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al actualizar usuario'
    };
  }
});
