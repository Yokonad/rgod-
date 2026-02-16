import fs from 'fs'; // Trigger reload
import path from 'path';
import { validateModuleConfig, normalizeModuleConfig, type ModuleConfig } from './moduleTypes';
import { executeQuery } from './db';

const MODULES_DIR = path.join(process.cwd(), 'MODULOS');

/**
 * Obtiene el estado de habilitación de un módulo desde la BD
 * Retorna null si no existe en BD (usar valor del JSON)
 */
async function getModuleStateFromDb(moduleId: string): Promise<boolean | null> {
  try {
    const result = await executeQuery(
      'SELECT is_enabled FROM module_states WHERE module_id = ?',
      [moduleId]
    );

    if (result.success && result.data && result.data.length > 0) {
      // Convertir explícitamente a boolean (MySQL devuelve 0/1 como números)
      return Boolean(result.data[0].is_enabled);
    }

    return null; // No existe en BD, usar valor del JSON
  } catch (error) {
    console.error(`Error obteniendo estado del módulo ${moduleId}:`, error);
    return null;
  }
}

/**
 * Escanea el directorio MODULOS y detecta todos los módulos disponibles
 * NOTA: Esta versión es síncrona para mantener compatibilidad
 * Para verificar estados de BD, usar scanModulesAsync()
 */
export function scanModules(): ModuleConfig[] {
  const modules: ModuleConfig[] = [];

  try {
    // Verificar si el directorio MODULOS existe
    if (!fs.existsSync(MODULES_DIR)) {
      console.warn('Directorio MODULOS no encontrado');
      return modules;
    }

    // Leer todos los directorios en MODULOS
    const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const modulePath = path.join(MODULES_DIR, entry.name);
      const configPath = path.join(modulePath, 'module.json');

      // Verificar si existe module.json
      if (!fs.existsSync(configPath)) {
        console.warn(`Módulo ${entry.name} no tiene module.json`);
        continue;
      }

      try {
        // Leer y parsear module.json
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const rawConfig = JSON.parse(configContent);

        // Validar configuración
        const validation = validateModuleConfig(rawConfig);
        if (!validation.valid) {
          console.error(`Módulo ${entry.name} tiene configuración inválida:`, validation.errors);
          continue;
        }

        // Verificar si tiene componente Vue
        const componentPath = path.join(modulePath, 'index.vue');
        rawConfig.hasComponent = fs.existsSync(componentPath);

        // Normalizar configuración con valores por defecto
        const config = normalizeModuleConfig(rawConfig);

        modules.push(config);
      } catch (error) {
        console.error(`Error procesando módulo ${entry.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error escaneando módulos:', error);
  }

  return modules;
}

import { getModuleDatabaseStatus, hasModuleSchema } from './moduleDatabase';

/**
 * Escanea módulos y aplica estados de BD (versión asíncrona)
 * Esta función debe usarse cuando se necesita verificar estados reales
 */
export async function scanModulesAsync(): Promise<ModuleConfig[]> {
  const modules = scanModules(); // Obtener todos los módulos

  // Verificar estados en BD y estado de inicialización de tablas
  const modulesWithDbState = await Promise.all(
    modules.map(async (module) => {
      // 1. Verificar estado de habilitación (enabled/disabled)
      const dbState = await getModuleStateFromDb(module.id);

      // 2. Verificar si requiere BD y su estado (initialized/pending)
      const hasSchema = hasModuleSchema(module.id);
      const dbStatus = hasSchema ? await getModuleDatabaseStatus(module.id) : null;

      // Construir objeto enriquecido
      const enrichedModule = { ...module };

      // Aplicar estado de habilitación (si existe en BD)
      if (dbState !== null) {
        enrichedModule.enabled = dbState;
      }

      // Si requiere BD pero no está inicializada, forzar enabled = false y marcar requiere init
      enrichedModule.requiresDatabase = hasSchema;
      enrichedModule.databaseInitialized = !!dbStatus;
      enrichedModule.databaseVersion = dbStatus?.schema_version;

      if (hasSchema && !dbStatus) {
        enrichedModule.enabled = false; // No se puede activar si no está inicializada
        enrichedModule.statusMessage = 'Requiere inicialización de base de datos';
      }

      return enrichedModule;
    })
  );

  return modulesWithDbState;
}

/**
 * Obtiene la configuración de un módulo específico
 */
export function getModuleConfig(moduleId: string): ModuleConfig | null {
  try {
    const modulePath = path.join(MODULES_DIR, moduleId);
    const configPath = path.join(modulePath, 'module.json');

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    const rawConfig = JSON.parse(configContent);

    // Validar configuración
    const validation = validateModuleConfig(rawConfig);
    if (!validation.valid) {
      console.error(`Módulo ${moduleId} tiene configuración inválida:`, validation.errors);
      return null;
    }

    // Verificar si tiene componente Vue
    const componentPath = path.join(modulePath, 'index.vue');
    rawConfig.hasComponent = fs.existsSync(componentPath);

    return normalizeModuleConfig(rawConfig);
  } catch (error) {
    console.error(`Error obteniendo configuración del módulo ${moduleId}:`, error);
    return null;
  }
}

/**
 * Valida si un módulo está disponible y habilitado
 * NOTA: Esta versión solo verifica el JSON, no la BD
 * Para verificación completa, usar isModuleAvailableAsync()
 */
export function isModuleAvailable(moduleId: string): boolean {
  const config = getModuleConfig(moduleId);
  return config !== null && config.enabled !== false && config.hasComponent === true;
}

/**
 * Valida si un módulo está disponible y habilitado (versión asíncrona con BD)
 */
export async function isModuleAvailableAsync(moduleId: string): Promise<boolean> {
  const config = getModuleConfig(moduleId);
  if (!config || !config.hasComponent) {
    return false;
  }

  // Verificar estado en BD
  const dbState = await getModuleStateFromDb(moduleId);
  const effectiveEnabled = dbState !== null ? dbState : config.enabled;

  return effectiveEnabled === true;
}

/**
 * Obtiene módulos filtrados por nivel de acceso
 * NOTA: Esta versión solo usa estados del JSON
 * Para estados actualizados de BD, usar getModulesByAccessLevelAsync()
 */
export function getModulesByAccessLevel(userRole: 'admin' | 'user'): ModuleConfig[] {
  const allModules = scanModules();

  if (userRole === 'admin') {
    return allModules.filter(m => m.enabled && m.hasComponent);
  }

  return allModules.filter(m =>
    m.enabled &&
    m.hasComponent &&
    (m.access_level === 'public' || m.access_level === 'user' || m.access_level === 'mixed')
  );
}

/**
 * Obtiene módulos filtrados por nivel de acceso (versión asíncrona con BD)
 */
export async function getModulesByAccessLevelAsync(userRole: 'admin' | 'user'): Promise<ModuleConfig[]> {
  const allModules = await scanModulesAsync();

  if (userRole === 'admin') {
    return allModules.filter(m => m.enabled && m.hasComponent);
  }

  return allModules.filter(m =>
    m.enabled &&
    m.hasComponent &&
    (m.access_level === 'public' || m.access_level === 'user' || m.access_level === 'mixed')
  );
}

/**
 * Verifica si un usuario tiene acceso a un módulo específico
 * Considera tanto el rol como el área del usuario
 */
export function hasModuleAccess(
  module: ModuleConfig,
  user: { role: string; area_name?: string }
): boolean {
  // Admin siempre tiene acceso
  if (user.role === 'admin') {
    return true;
  }

  // Si el módulo es público, todos tienen acceso
  if (module.access_level === 'public') {
    return true;
  }

  // Si el módulo es solo admin, no admin no tiene acceso
  if (module.access_level === 'admin') {
    return false;
  }

  // Si el módulo tiene áreas restringidas, verificar
  if (module.allowed_areas && module.allowed_areas.length > 0) {
    // El usuario debe pertenecer a una de las áreas permitidas
    if (!user.area_name) {
      return false; // Usuario sin área no puede acceder a módulos con restricción por área
    }
    return module.allowed_areas.includes(user.area_name);
  }

  // Si no hay restricciones por área y el access_level es 'user' o 'mixed', permitir
  if (module.access_level === 'user' || module.access_level === 'mixed') {
    return true;
  }

  return false;
}

/**
 * Obtiene módulos disponibles para un usuario considerando rol y área
 */
export async function getModulesForUser(
  user: { role: string; area_name?: string }
): Promise<ModuleConfig[]> {
  const allModules = await scanModulesAsync();

  return allModules.filter(m =>
    m.enabled &&
    m.hasComponent &&
    hasModuleAccess(m, user)
  );
}

