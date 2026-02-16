import { executeQuery } from '../../utils/db';
import { verifyPassword, isValidEmail, sanitizeInput } from '../../utils/auth';
import { createSession } from '../../utils/session';
import { logAuth } from '../../utils/logger';

/**
 * POST /api/auth/login
 * Inicia sesión con email y contraseña
 */
export default defineEventHandler(async (event) => {
  try {
    // Leer el body de la request
    const body = await readBody(event);
    const { email, password } = body;
    
    // Validaciones básicas
    if (!email || !password) {
      setResponseStatus(event, 400);
      return {
        success: false,
        message: 'Email y contraseña son requeridos'
      };
    }
    
    if (!isValidEmail(email)) {
      setResponseStatus(event, 400);
      return {
        success: false,
        message: 'Email inválido'
      };
    }
    
    // Sanitizar email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    // Buscar usuario por email
    const userResult = await executeQuery(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.area_id, a.name as area_name, u.is_first_user, u.is_active 
       FROM users u 
       LEFT JOIN areas a ON u.area_id = a.id 
       WHERE u.email = ?`,
      [sanitizedEmail]
    );
    
    if (!userResult.success || !(userResult.data as any[]).length) {
      setResponseStatus(event, 401);
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }
    
    const user = (userResult.data as any[])[0];
    
    // Verificar si el usuario está activo
    if (!user.is_active) {
      setResponseStatus(event, 403);
      return {
        success: false,
        message: 'Usuario desactivado'
      };
    }
    
    // Verificar contraseña
    const passwordValid = await verifyPassword(password, user.password);
    
    if (!passwordValid) {
      setResponseStatus(event, 401);
      
      // Registrar intento fallido
      await logAuth(event, 'login_failed', { id: user.id, name: user.name, email: user.email }, false, 'Contraseña incorrecta');
      
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }
    
    // Crear sesión
    const sessionResult = await createSession(user.id);
    
    if (!sessionResult.success) {
      setResponseStatus(event, 500);
      return {
        success: false,
        message: 'Error al crear la sesión',
        error: sessionResult.error
      };
    }
    
    // Establecer cookie HttpOnly para mayor seguridad
    setCookie(event, 'bytewave_auth_token', sessionResult.token, {
      httpOnly: true,  // No accesible desde JavaScript (protección XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // Protección CSRF
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/'
    });

    // Retornar usuario y token (token también en response para localStorage como fallback)
    return {
      success: true,
      message: 'Login exitoso',
      token: sessionResult.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        area_id: user.area_id,
        area_name: user.area_name,
        is_first_user: user.is_first_user === 1
      }
    };
  } catch (error: any) {
    console.error('Error en login:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
});
