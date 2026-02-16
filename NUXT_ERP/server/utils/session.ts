import { executeQuery } from './db';
import { generateToken, getSessionExpiry } from './auth';

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  area_id?: number;
  area_name?: string;
  is_first_user: boolean;
  created_at: Date;
}

/**
 * Crea una nueva sesión para un usuario
 */
export async function createSession(userId: number): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const token = generateToken();
    const expiresAt = getSessionExpiry();
    
    const result = await executeQuery(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    
    if (result.success) {
      return { success: true, token };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Valida un token y retorna el usuario si es válido
 */
export async function validateSession(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
  try {
    const result = await executeQuery(
      `SELECT u.id, u.name, u.email, u.role, u.area_id, a.name as area_name, u.is_first_user, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN areas a ON u.area_id = a.id
       WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = TRUE`,
      [token]
    );
    
    if (result.success && result.data && (result.data as any[]).length > 0) {
      const user = (result.data as any[])[0];
      
      // Actualizar last_activity
      await executeQuery(
        'UPDATE sessions SET last_activity = NOW() WHERE token = ?',
        [token]
      );
      
      return { 
        valid: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          area_id: user.area_id || undefined,
          area_name: user.area_name || undefined,
          is_first_user: user.is_first_user === 1,
          created_at: user.created_at
        }
      };
    }
    
    return { valid: false, error: 'Token inválido o expirado' };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Elimina una sesión (logout)
 */
export async function deleteSession(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await executeQuery(
      'DELETE FROM sessions WHERE token = ?',
      [token]
    );
    
    return { success: result.success, error: result.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Elimina todas las sesiones de un usuario
 */
export async function deleteAllUserSessions(userId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await executeQuery(
      'DELETE FROM sessions WHERE user_id = ?',
      [userId]
    );
    
    return { success: result.success, error: result.error };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Limpia sesiones expiradas
 */
export async function cleanupExpiredSessions(): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    const result = await executeQuery(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    );
    
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el usuario desde el token en el header o cookie de la request
 */
export async function getUserFromRequest(event: any): Promise<User | null> {
  // Intentar obtener token del header (para APIs)
  const authHeader = getHeader(event, 'authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  // Si no hay token en header, intentar cookie (para SSR)
  if (!token) {
    token = getCookie(event, 'bytewave_auth_token') || null;
  }
  
  if (!token) {
    return null;
  }
  
  const session = await validateSession(token);
  
  return session.valid && session.user ? session.user : null;
}
