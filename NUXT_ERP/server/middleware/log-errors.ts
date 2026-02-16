import { logError, logInfo } from '../utils/logger';
import { getUserFromRequest } from '../utils/session';

/**
 * Middleware global para registrar errores automáticamente
 * Se ejecuta en cada petición
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    // Interceptar respuesta para detectar errores
    const originalEnd = event.node.res.end;
    
    (event.node.res.end as any) = function(chunk: any, ...args: any[]) {
      const statusCode = event.node.res.statusCode || 200;
      const duration = Date.now() - startTime;
      
      // Log automático de errores HTTP (4xx, 5xx)
      if (statusCode >= 400) {
        getUserFromRequest(event).then(user => {
          const url = event.node.req.url || '';
          const method = event.node.req.method || '';
          
          // Determinar severidad según código de estado
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
          if (statusCode >= 500) severity = 'high';
          if (statusCode === 401 || statusCode === 403) severity = 'low';
          
          logError(
            event,
            new Error(`HTTP ${statusCode}: ${method} ${url}`),
            'http',
            `${method.toLowerCase()}_${url.split('/')[2] || 'unknown'}`,
            user || undefined
          ).catch(err => console.error('Error logging HTTP error:', err));
        });
      }
      
      // Log de peticiones lentas (> 5 segundos)
      if (duration > 5000) {
        getUserFromRequest(event).then(user => {
          logInfo(
            'performance',
            'slow_request',
            `Petición lenta: ${event.node.req.method} ${event.node.req.url} (${duration}ms)`,
            {
              method: event.node.req.method,
              url: event.node.req.url,
              duration,
              user_id: user?.id
            }
          ).catch(err => console.error('Error logging slow request:', err));
        });
      }
      
      return originalEnd.apply(event.node.res, [chunk, ...args] as any);
    };
    
  } catch (error: any) {
    console.error('Error en middleware de logs:', error);
  }
});
