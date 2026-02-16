import { executeQuery } from '../../utils/db';
import { hashPassword, isValidEmail, isStrongPassword, sanitizeInput } from '../../utils/auth';

/**
 * POST /api/auth/setup
 * Crea el primer usuario administrador
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar primero si ya hay usuarios
    const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users');
    const hasUsers = usersResult.success && (usersResult.data as any[])[0]?.count > 0;
    
    if (hasUsers) {
      setResponseStatus(event, 403);
      return {
        success: false,
        message: 'El setup ya ha sido completado'
      };
    }
    
    // Leer el body de la request
    const body = await readBody(event);
    const { name, email, password } = body;
    
    // Validaciones
    if (!name || !email || !password) {
      setResponseStatus(event, 400);
      return {
        success: false,
        message: 'Todos los campos son requeridos'
      };
    }
    
    // Validar email
    if (!isValidEmail(email)) {
      setResponseStatus(event, 400);
      return {
        success: false,
        message: 'El email no es válido'
      };
    }
    
    // Validar contraseña
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.valid) {
      setResponseStatus(event, 400);
      return {
        success: false,
        message: passwordValidation.message
      };
    }
    
    // Sanitizar inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    // Hashear contraseña
    const hashedPassword = await hashPassword(password);
    
    // Crear el usuario administrador
    const insertResult = await executeQuery(
      'INSERT INTO users (name, email, password, role, is_first_user) VALUES (?, ?, ?, ?, ?)',
      [sanitizedName, sanitizedEmail, hashedPassword, 'admin', true]
    );
    
    if (!insertResult.success) {
      setResponseStatus(event, 500);
      return {
        success: false,
        message: 'Error al crear el usuario',
        error: insertResult.error
      };
    }
    
    // Obtener el ID del usuario creado
    const userId = (insertResult.data as any).insertId;
    
    // Marcar el setup como completado
    await executeQuery(
      'UPDATE setup_completed SET completed = TRUE, completed_at = NOW(), completed_by = ? WHERE id = 1',
      [userId]
    );
    
    // Registrar actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [userId, 'setup_completed', 'Setup inicial completado - Usuario administrador creado']
    );
    
    return {
      success: true,
      message: 'Usuario administrador creado exitosamente',
      user: {
        id: userId,
        name: sanitizedName,
        email: sanitizedEmail,
        role: 'admin'
      }
    };
  } catch (error: any) {
    console.error('Error en setup:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
});
