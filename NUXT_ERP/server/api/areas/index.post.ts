import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';
import { sanitizeInput } from '../../utils/auth';

/**
 * POST /api/areas
 * Crea una nueva área (solo admin)
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
      return { success: false, message: 'Solo los administradores pueden crear áreas' };
    }

    const body = await readBody(event);
    const { name, description, color, icon } = body;

    // Validaciones
    if (!name || name.trim().length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El nombre del área es requerido' };
    }

    if (name.length > 100) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El nombre no puede exceder 100 caracteres' };
    }

    // Verificar si el nombre ya existe
    const existingArea = await executeQuery(
      'SELECT id FROM areas WHERE name = ?',
      [name.trim()]
    );

    if (existingArea.success && existingArea.data && existingArea.data.length > 0) {
      setResponseStatus(event, 409);
      return { success: false, message: 'Ya existe un área con ese nombre' };
    }

    // Validar color (formato hex)
    const colorRegex = /^#[0-9A-F]{6}$/i;
    const finalColor = color && colorRegex.test(color) ? color : '#3B82F6';

    // Sanitizar inputs
    const cleanName = sanitizeInput(name.trim());
    const cleanDescription = description ? sanitizeInput(description.trim()) : null;
    const cleanIcon = icon ? sanitizeInput(icon.trim()) : 'briefcase';

    // Crear área
    const result = await executeQuery(
      'INSERT INTO areas (name, description, color, icon) VALUES (?, ?, ?, ?)',
      [cleanName, cleanDescription, finalColor, cleanIcon]
    );

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'create_area', `Creó área: ${cleanName}`]
    );

    return {
      success: true,
      message: 'Área creada exitosamente',
      area_id: result.success && result.data ? result.data.insertId : null
    };

  } catch (error: any) {
    console.error('Error creando área:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al crear área'
    };
  }
});
