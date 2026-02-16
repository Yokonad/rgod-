import { executeQuery } from '../../utils/db';

/**
 * GET /api/auth/setup
 * Verifica si el setup inicial está completo
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar si hay usuarios en la base de datos
    const usersResult = await executeQuery('SELECT COUNT(*) as count FROM users');
    const hasUsers = usersResult.success && (usersResult.data as any[])[0]?.count > 0;
    
    // Verificar el estado del setup
    const setupResult = await executeQuery('SELECT completed FROM setup_completed WHERE id = 1');
    const setupCompleted = setupResult.success && (setupResult.data as any[])[0]?.completed === 1;
    
    return {
      setupCompleted,
      hasUsers,
      needsSetup: !hasUsers
    };
  } catch (error: any) {
    setResponseStatus(event, 500);
    return {
      error: 'Error al verificar el estado del setup',
      message: error.message
    };
  }
});
