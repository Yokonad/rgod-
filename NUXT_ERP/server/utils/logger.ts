/**
 * Utilidad para registrar eventos en el sistema de logs
 * Uso: import { logEvent } from '~/server/utils/logger';
 */

import { executeQuery } from './db';
import type { H3Event } from 'h3';

export interface LogEventData {
  user_id?: number | null;
  user_name?: string;
  user_email?: string;
  module: string;
  action: string;
  event_type: 'create' | 'read' | 'update' | 'delete' | 'auth' | 'error' | 'warning' | 'info';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  metadata?: any;
  error_message?: string;
  stack_trace?: string;
}

/**
 * Registra un evento en el sistema de logs
 * @param event - Evento HTTP de Nuxt (opcional, para capturar IP y User Agent)
 * @param data - Datos del evento a registrar
 */
export async function logEvent(event: H3Event | null, data: LogEventData): Promise<void> {
  try {
    // Valores por defecto
    const severity = data.severity || 'low';
    
    // Capturar información de la petición si está disponible
    let ip_address: string | null = null;
    let user_agent: string | null = null;
    let request_method: string | null = null;
    let request_url: string | null = null;
    let response_status: number | null = null;

    if (event) {
      ip_address = event.node.req.socket.remoteAddress || null;
      user_agent = event.node.req.headers['user-agent'] || null;
      request_method = event.node.req.method || null;
      request_url = event.node.req.url || null;
      response_status = event.node.res.statusCode || null;
    }

    // Serializar metadata a JSON si existe
    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;

    // Insertar en la base de datos
    await executeQuery(`
      INSERT INTO system_logs (
        user_id, user_name, user_email,
        module, action, event_type, severity,
        description, metadata,
        ip_address, user_agent,
        request_method, request_url, response_status,
        error_message, stack_trace
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.user_id || null,
      data.user_name || null,
      data.user_email || null,
      data.module,
      data.action,
      data.event_type,
      severity,
      data.description || null,
      metadataJson,
      ip_address,
      user_agent,
      request_method,
      request_url,
      response_status,
      data.error_message || null,
      data.stack_trace || null
    ]);

  } catch (error) {
    // En caso de error al registrar el log, solo lo imprimimos en consola
    // para no afectar el flujo principal de la aplicación
    console.error('Error al registrar log en base de datos:', error);
  }
}

/**
 * Registra un error con toda la información disponible
 * @param event - Evento HTTP de Nuxt
 * @param error - Error capturado
 * @param module - Módulo donde ocurrió el error
 * @param action - Acción que estaba ejecutando
 * @param user - Usuario que ejecutó la acción (opcional)
 */
export async function logError(
  event: H3Event | null,
  error: Error,
  module: string,
  action: string,
  user?: { id: number; name: string; email: string }
): Promise<void> {
  await logEvent(event, {
    user_id: user?.id,
    user_name: user?.name,
    user_email: user?.email,
    module,
    action,
    event_type: 'error',
    severity: 'high',
    description: error.message,
    error_message: error.message,
    stack_trace: error.stack || null
  });
}

/**
 * Registra un evento de autenticación
 * @param event - Evento HTTP de Nuxt
 * @param action - Acción de autenticación (login, logout, login_failed, etc.)
 * @param user - Usuario involucrado (opcional)
 * @param success - Si la acción fue exitosa
 * @param description - Descripción adicional
 */
export async function logAuth(
  event: H3Event,
  action: string,
  user: { id?: number; name?: string; email: string } | null,
  success: boolean,
  description?: string
): Promise<void> {
  await logEvent(event, {
    user_id: user?.id || null,
    user_name: user?.name || 'Anónimo',
    user_email: user?.email || null,
    module: 'auth',
    action,
    event_type: 'auth',
    severity: success ? 'low' : 'medium',
    description: description || (success ? 'Autenticación exitosa' : 'Autenticación fallida')
  });
}

/**
 * Registra una operación CRUD
 * @param event - Evento HTTP de Nuxt
 * @param module - Módulo donde ocurrió la operación
 * @param action - Acción específica (create_invoice, update_project, etc.)
 * @param operation - Tipo de operación CRUD
 * @param user - Usuario que ejecutó la operación
 * @param description - Descripción de la operación
 * @param metadata - Datos adicionales (opcional)
 */
export async function logCRUD(
  event: H3Event | null,
  module: string,
  action: string,
  operation: 'create' | 'read' | 'update' | 'delete',
  user: { id: number; name: string; email: string },
  description: string,
  metadata?: any
): Promise<void> {
  await logEvent(event, {
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    module,
    action,
    event_type: operation,
    severity: operation === 'delete' ? 'medium' : 'low',
    description,
    metadata
  });
}

/**
 * Registra una advertencia
 * @param event - Evento HTTP de Nuxt
 * @param module - Módulo donde ocurrió la advertencia
 * @param action - Acción que generó la advertencia
 * @param description - Descripción de la advertencia
 * @param user - Usuario involucrado (opcional)
 */
export async function logWarning(
  event: H3Event | null,
  module: string,
  action: string,
  description: string,
  user?: { id: number; name: string; email: string }
): Promise<void> {
  await logEvent(event, {
    user_id: user?.id,
    user_name: user?.name,
    user_email: user?.email,
    module,
    action,
    event_type: 'warning',
    severity: 'medium',
    description
  });
}

/**
 * Registra información general del sistema
 * @param module - Módulo que genera la información
 * @param action - Acción ejecutada
 * @param description - Descripción del evento
 * @param metadata - Datos adicionales (opcional)
 */
export async function logInfo(
  module: string,
  action: string,
  description: string,
  metadata?: any
): Promise<void> {
  await logEvent(null, {
    module,
    action,
    event_type: 'info',
    severity: 'low',
    description,
    metadata
  });
}
