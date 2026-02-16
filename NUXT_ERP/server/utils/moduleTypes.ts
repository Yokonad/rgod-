/**
 * Sistema de Módulos Dinámicos - ByteWave ERP
 * 
 * Este archivo contiene la configuración y validación para el sistema de módulos.
 */

// Lista de iconos sugeridos (pueden usarse otros)
export const SUGGESTED_ICONS = [
  'users',
  'dashboard',
  'settings',
  'chart',
  'document',
  'folder',
  'calendar',
  'mail',
  'bell',
  'package',
  'clipboard',
  'file-text',
  'briefcase',
  'shopping-cart',
  'credit-card',
  'truck',
  'bar-chart',
  'pie-chart',
  'trending-up',
  'dollar-sign',
  'default'
] as const;

export const ACCESS_LEVELS = [
  'admin',
  'user',
  'public',
  'mixed'
] as const;

export type ModuleIcon = string; // Aceptar cualquier string
export type AccessLevel = typeof ACCESS_LEVELS[number];

/**
 * Configuración de un módulo
 */
export interface ModuleConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  icon?: ModuleIcon;
  gradient?: string;
  access_level?: AccessLevel;
  allowed_areas?: string[];
  enabled?: boolean;
  route?: string;
  hasComponent?: boolean;
  // Propiedades dinámicas de DB
  requiresDatabase?: boolean;
  databaseInitialized?: boolean;
  databaseVersion?: string;
  statusMessage?: string;
}

/**
 * Valida que un objeto tenga la estructura correcta de module.json
 */
export function validateModuleConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar campos requeridos
  if (!config.id || typeof config.id !== 'string') {
    errors.push('Campo "id" es requerido y debe ser string');
  } else if (!/^[a-z0-9_-]+$/.test(config.id)) {
    errors.push('Campo "id" debe ser un slug válido (minúsculas, números, guiones y guiones bajos)');
  }

  if (!config.name || typeof config.name !== 'string') {
    errors.push('Campo "name" es requerido y debe ser string');
  }

  if (!config.version || typeof config.version !== 'string') {
    errors.push('Campo "version" es requerido y debe ser string');
  } else if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push('Campo "version" debe seguir formato semver (ej: 1.0.0)');
  }

  // Validar campos opcionales
  if (config.icon && typeof config.icon !== 'string') {
    errors.push('Campo "icon" debe ser string');
  }

  if (config.access_level && !ACCESS_LEVELS.includes(config.access_level)) {
    errors.push(`Campo "access_level" debe ser uno de: ${ACCESS_LEVELS.join(', ')}`);
  }

  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    errors.push('Campo "enabled" debe ser boolean');
  }

  if (config.allowed_areas !== undefined) {
    if (!Array.isArray(config.allowed_areas)) {
      errors.push('Campo "allowed_areas" debe ser un array');
    } else if (!config.allowed_areas.every((area: any) => typeof area === 'string')) {
      errors.push('Campo "allowed_areas" debe contener solo strings');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normaliza la configuración de un módulo con valores por defecto
 */
export function normalizeModuleConfig(config: Partial<ModuleConfig>): ModuleConfig {
  return {
    id: config.id || '',
    name: config.name || '',
    version: config.version || '0.0.0',
    description: config.description || '',
    author: config.author || 'Unknown',
    icon: config.icon || 'default',
    gradient: config.gradient || undefined,
    access_level: config.access_level || 'user',
    allowed_areas: config.allowed_areas || undefined,
    enabled: config.enabled !== false,
    route: config.route || `/modules/${config.id}`,
    hasComponent: config.hasComponent || false,
    requiresDatabase: config.requiresDatabase || false,
    databaseInitialized: config.databaseInitialized || false,
    databaseVersion: config.databaseVersion,
    statusMessage: config.statusMessage
  };
}
