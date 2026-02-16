import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';
import { hashPassword, isValidEmail, sanitizeInput } from '../../utils/auth';

/**
 * POST /api/users
 * Crea un nuevo usuario (solo admin)
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
      return { success: false, message: 'Solo los administradores pueden crear usuarios' };
    }

    const body = await readBody(event);
    const { name, email, password, role, area_id } = body;

    // Validaciones
    if (!name || !email || !password) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Nombre, email y contraseña son requeridos' };
    }

    if (!isValidEmail(email)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Email inválido' };
    }

    if (password.length < 8) {
      setResponseStatus(event, 400);
      return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const validRoles = ['admin', 'user'];
    if (role && !validRoles.includes(role)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Rol inválido' };
    }

    // Verificar si el email ya existe
    const existingUserResult = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUserResult.success && existingUserResult.data && existingUserResult.data.length > 0) {
      setResponseStatus(event, 409);
      return { success: false, message: 'El email ya está registrado' };
    }

    // Validar area_id si se proporciona
    if (area_id) {
      const areaExists = await executeQuery(
        'SELECT id FROM areas WHERE id = ?',
        [area_id]
      );

      if (!areaExists.success || !areaExists.data || areaExists.data.length === 0) {
        setResponseStatus(event, 400);
        return { success: false, message: 'El área seleccionada no existe' };
      }
    }

    // Sanitizar inputs
    const cleanName = sanitizeInput(name);
    const cleanEmail = email.toLowerCase().trim();
    const userRole = role || 'user';
    const userAreaId = area_id || null;

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const result = await executeQuery(
      'INSERT INTO users (name, email, password, role, area_id) VALUES (?, ?, ?, ?, ?)',
      [cleanName, cleanEmail, hashedPassword, userRole, userAreaId]
    );

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'create_user', `Creó usuario: ${cleanName} (${cleanEmail})`]
    );

    return {
      success: true,
      message: 'Usuario creado exitosamente',
      user_id: result.success && result.data ? result.data.insertId : null
    };

  } catch (error: any) {
    console.error('Error creando usuario:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al crear usuario'
    };
  }
});
