import fs from 'fs';
import path from 'path';
import { getModuleConfig, hasModuleAccess } from '../../utils/moduleLoader';
import { getUserFromRequest } from '../../utils/session';

/**
 * API Handler Dinámico para Módulos
 * 
 * Captura todas las rutas /api/modules/* y ejecuta el código de los módulos
 * 
 * IMPORTANTE: Los archivos TypeScript en MODULOS/ deben ser transpilados en tiempo de ejecución
 * porque Node.js no puede ejecutar .ts directamente fuera del contexto de Nitro.
 * 
 * Solución: Usamos jiti para transpilar y ejecutar los archivos .ts on-the-fly
 */
export default defineEventHandler(async (event) => {
  try {
    // Obtener el path completo después de /api/modules/ y quitar query params
    const fullPath = event.path.replace('/api/modules/', '').split('?')[0];
    const pathParts = fullPath.split('/').filter(p => p);

    if (pathParts.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Ruta inválida' };
    }

    const moduleId = pathParts[0]; // Primer segmento es el ID del módulo
    const apiPath = pathParts.slice(1); // Resto es la ruta de la API
    const method = event.method.toUpperCase();

    console.log(`[Dynamic API] ${method} /api/modules/${moduleId}/${apiPath.join('/')}`);

    // Verificar que el módulo existe y está habilitado
    const moduleConfig = getModuleConfig(moduleId);
    if (!moduleConfig) {
      setResponseStatus(event, 404);
      return { success: false, message: `Módulo ${moduleId} no encontrado` };
    }

    if (!moduleConfig.enabled) {
      setResponseStatus(event, 403);
      return { success: false, message: `Módulo ${moduleId} está deshabilitado` };
    }

    // Verificar permisos de acceso del usuario
    const user = await getUserFromRequest(event);
    if (!user && moduleConfig.access_level !== 'public') {
      setResponseStatus(event, 401);
      return { success: false, message: 'Autenticación requerida' };
    }

    // Validar acceso al módulo considerando rol y área
    if (user && !hasModuleAccess(moduleConfig, { role: user.role, area_name: user.area_name })) {
      setResponseStatus(event, 403);
      return { 
        success: false, 
        message: 'Acceso denegado a este módulo',
        details: moduleConfig.allowed_areas 
          ? `Solo usuarios del área: ${moduleConfig.allowed_areas.join(', ')}`
          : 'Permisos insuficientes'
      };
    }

    // Construir ruta del archivo API dentro del módulo
    const modulePath = path.join(process.cwd(), 'MODULOS', moduleId);
    const moduleApiPath = path.join(modulePath, 'api');

    // Si no hay ruta de API, error
    if (apiPath.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Ruta de API no especificada' };
    }

    // Convertir ruta y método HTTP a nombre de archivo
    let apiFile: string | null = null;
    const methodExt = method.toLowerCase();

    // Intentar diferentes patrones de archivos
    const possiblePaths = [
      // Ruta exacta: api/list.get.ts
      path.join(moduleApiPath, `${apiPath.join('/')}.${methodExt}.ts`),
      // Con parámetros: api/[id]/delete.delete.ts
      path.join(moduleApiPath, apiPath.map(p => /^\d+$/.test(p) ? '[id]' : p).join('/') + `.${methodExt}.ts`),
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        apiFile = possiblePath;
        console.log(`[Dynamic API] Found: ${possiblePath.replace(process.cwd(), '')}`);
        break;
      }
    }

    if (!apiFile) {
      console.error(`[Dynamic API] No encontrado. Probé:`, possiblePaths.map(p => p.replace(process.cwd(), '')));
      setResponseStatus(event, 404);
      return {
        success: false,
        message: `API no encontrada: ${method} /api/modules/${moduleId}/${apiPath.join('/')}`,
        tried: possiblePaths.map(p => p.replace(process.cwd(), ''))
      };
    }

    // Importar y ejecutar el handler del módulo usando jiti
    try {
      // jiti es un loader que puede ejecutar TypeScript en Node.js
      // Ya viene incluido con Nuxt/Nitro
      const { createJiti } = await import('jiti');

      // Crear contexto con las funciones de Nitro disponibles globalmente
      const jitiContext = createJiti(import.meta.url, {
        interopDefault: true,
        cache: false, // Desactivar caché para desarrollo
        requireCache: false
      });

      console.log(`[Dynamic API] Loading with jiti: ${apiFile}`);

      // Inyectar todas las funciones de Nitro/h3 en el contexto global
      // IMPORTANTE: No usar try-finally porque las funciones deben estar disponibles
      // durante toda la ejecución asíncrona del handler
      (globalThis as any).defineEventHandler = defineEventHandler;
      (globalThis as any).setResponseStatus = setResponseStatus;
      (globalThis as any).getRouterParam = getRouterParam;
      (globalThis as any).readBody = readBody;
      (globalThis as any).getHeader = getHeader;
      (globalThis as any).getHeaders = getHeaders;
      (globalThis as any).getCookie = getCookie;
      (globalThis as any).setCookie = setCookie;
      (globalThis as any).deleteCookie = deleteCookie;
      (globalThis as any).getQuery = getQuery;
      (globalThis as any).setHeader = setHeader;
      (globalThis as any).setHeaders = setHeaders;
      (globalThis as any).useRuntimeConfig = useRuntimeConfig;

      // Cargar el módulo con jiti (transpila TS automáticamente)
      const apiHandler = jitiContext(apiFile);

      if (!apiHandler || !apiHandler.default || typeof apiHandler.default !== 'function') {
        setResponseStatus(event, 500);
        return {
          success: false,
          message: 'El archivo API no exporta un handler válido',
          file: apiFile.replace(process.cwd(), '')
        };
      }

      // Ejecutar el handler del módulo
      const result = await apiHandler.default(event);
      return result;

    } catch (importError: any) {
      console.error(`[Dynamic API] Error ejecutando API del módulo ${moduleId}:`, importError);
      setResponseStatus(event, 500);
      return {
        success: false,
        message: 'Error ejecutando la API del módulo',
        error: importError.message,
        stack: importError.stack
      };
    }

  } catch (error: any) {
    console.error('[Dynamic API] Error en API handler dinámico:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
});
