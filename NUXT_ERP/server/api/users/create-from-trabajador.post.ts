import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';
import bcrypt from 'bcrypt';

/**
 * POST /api/users/create-from-trabajador
 * Crea un usuario vinculado a un trabajador existente
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user || user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'No autorizado' };
    }

    const body = await readBody(event);
    const { trabajador_id, email, password, role, area_id } = body;

    // Validaciones
    if (!trabajador_id || !email || !password) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Faltan campos requeridos' };
    }

    if (password.length < 8) {
      setResponseStatus(event, 400);
      return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    // Verificar que el trabajador existe
    const trabajadorResult = await executeQuery(
      'SELECT * FROM trabajadores_completo WHERE id = ?',
      [trabajador_id]
    );

    if (!trabajadorResult.success || !trabajadorResult.data || trabajadorResult.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Trabajador no encontrado' };
    }

    const trabajador = trabajadorResult.data[0];

    // Verificar que el email no esté en uso
    const emailCheck = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (emailCheck.success && emailCheck.data && emailCheck.data.length > 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El email ya está registrado' };
    }

    // Verificar que el trabajador no tenga ya un usuario
    const userCheck = await executeQuery(
      'SELECT id FROM users WHERE trabajador_id = ?',
      [trabajador_id]
    );

    if (userCheck.success && userCheck.data && userCheck.data.length > 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Este trabajador ya tiene un usuario asociado' };
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario vinculado al trabajador
    const insertResult = await executeQuery(
      `INSERT INTO users (name, email, password, role, area_id, trabajador_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        trabajador.nombre_completo,
        email,
        hashedPassword,
        role || 'user',
        area_id || null,
        trabajador_id
      ]
    );

    if (!insertResult.success) {
      throw new Error(insertResult.error || 'Error al crear usuario');
    }

    return {
      success: true,
      message: 'Usuario creado exitosamente desde trabajador',
      user: {
        id: insertResult.insertId,
        name: trabajador.nombre_completo,
        email,
        role: role || 'user',
        area_id: area_id || null,
        trabajador_id
      }
    };

  } catch (error: any) {
    console.error('Error creating user from trabajador:', error);
    setResponseStatus(event, 500);
    return { 
      success: false, 
      message: error.message || 'Error al crear usuario desde trabajador' 
    };
  }
});
