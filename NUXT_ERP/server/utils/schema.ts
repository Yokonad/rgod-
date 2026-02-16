/**
 * Schema SQL completo para ByteWave ERP
 * Generado a partir del análisis del código actual
 */

export const DATABASE_SCHEMA = `
-- =====================================================
-- ByteWave ERP - Database Schema
-- =====================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  area_id INT DEFAULT NULL,
  trabajador_id INT DEFAULT NULL,
  is_first_user BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_area_id (area_id),
  INDEX idx_trabajador_id (trabajador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  last_activity DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de áreas/departamentos
CREATE TABLE IF NOT EXISTS areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'briefcase',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir foreign key de users a areas (después de crear ambas tablas)
ALTER TABLE users ADD CONSTRAINT fk_users_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;

-- Tabla de registro de actividad de usuarios
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs del sistema (más detallada)
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  user_name VARCHAR(100) DEFAULT NULL,
  user_email VARCHAR(150) DEFAULT NULL,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  event_type ENUM('create', 'read', 'update', 'delete', 'auth', 'error', 'warning', 'info') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  description TEXT,
  metadata JSON,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT,
  request_method VARCHAR(10) DEFAULT NULL,
  request_url TEXT,
  response_status INT DEFAULT NULL,
  error_message TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_module (module),
  INDEX idx_action (action),
  INDEX idx_event_type (event_type),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de estado del setup inicial
CREATE TABLE IF NOT EXISTS setup_completed (
  id INT PRIMARY KEY DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME DEFAULT NULL,
  completed_by INT DEFAULT NULL,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar registro inicial de setup
INSERT INTO setup_completed (id, completed) VALUES (1, FALSE)
ON DUPLICATE KEY UPDATE id = id;

-- Tabla de estados de módulos dinámicos
CREATE TABLE IF NOT EXISTS module_states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id VARCHAR(100) NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT TRUE,
  enabled_by INT DEFAULT NULL,
  enabled_at DATETIME DEFAULT NULL,
  disabled_by INT DEFAULT NULL,
  disabled_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module_id (module_id),
  INDEX idx_is_enabled (is_enabled),
  FOREIGN KEY (enabled_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (disabled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de carpetas de módulos
CREATE TABLE IF NOT EXISTS module_folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'folder',
  color VARCHAR(7) DEFAULT '#0AA4A4',
  description TEXT,
  created_by INT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_index (order_index),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de módulos dentro de carpetas
CREATE TABLE IF NOT EXISTS folder_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folder_id INT NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_folder_id (folder_id),
  INDEX idx_module_name (module_name),
  INDEX idx_order_index (order_index),
  UNIQUE KEY uk_folder_module (folder_id, module_name),
  FOREIGN KEY (folder_id) REFERENCES module_folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de posiciones personalizadas de iconos por usuario
CREATE TABLE IF NOT EXISTS user_icon_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('module', 'folder') NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_position (position),
  UNIQUE KEY uk_user_item (user_id, item_type, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Lista de tablas requeridas para verificación
export const REQUIRED_TABLES = [
  'users',
  'sessions',
  'areas',
  'activity_logs',
  'system_logs',
  'setup_completed',
  'module_states',
  'module_folders',
  'folder_modules',
  'user_icon_positions',
  'modules',
  'module_database_status',
  'module_tables'
];

// Queries individuales para crear tablas una por una (para mostrar progreso)
export const TABLE_CREATION_QUERIES = [
  {
    name: 'users',
    description: 'Tabla de usuarios del sistema',
    query: `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      area_id INT DEFAULT NULL,
      trabajador_id INT DEFAULT NULL,
      is_first_user BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_area_id (area_id),
      INDEX idx_trabajador_id (trabajador_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'sessions',
    description: 'Sesiones de usuario activas',
    query: `CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      last_activity DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token),
      INDEX idx_user_id (user_id),
      INDEX idx_expires_at (expires_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'module_database_status',
    description: 'Estado de la base de datos de los módulos',
    query: `CREATE TABLE IF NOT EXISTS module_database_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id VARCHAR(100) NOT NULL UNIQUE,
    schema_version VARCHAR(20) NOT NULL,
    tables_hash VARCHAR(64), -- Hash para detectar cambios en el archivo sql
    initialized_at DATETIME NOT NULL,
    last_updated_at DATETIME,
    initialized_by INT,
    FOREIGN KEY (initialized_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'module_tables',
    description: 'Tablas pertenecientes a cada módulo',
    query: `CREATE TABLE IF NOT EXISTS module_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_module_table (module_id, table_name),
    INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'areas',
    description: 'Áreas y departamentos',
    query: `CREATE TABLE IF NOT EXISTS areas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      color VARCHAR(7) DEFAULT '#3B82F6',
      icon VARCHAR(50) DEFAULT 'briefcase',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'activity_logs',
    description: 'Registro de actividad de usuarios',
    query: `CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_action (action),
      INDEX idx_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'system_logs',
    description: 'Logs detallados del sistema',
    query: `CREATE TABLE IF NOT EXISTS system_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      user_name VARCHAR(100) DEFAULT NULL,
      user_email VARCHAR(150) DEFAULT NULL,
      module VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      event_type ENUM('create', 'read', 'update', 'delete', 'auth', 'error', 'warning', 'info') NOT NULL,
      severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
      description TEXT,
      metadata JSON,
      ip_address VARCHAR(45) DEFAULT NULL,
      user_agent TEXT,
      request_method VARCHAR(10) DEFAULT NULL,
      request_url TEXT,
      response_status INT DEFAULT NULL,
      error_message TEXT,
      stack_trace TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_module (module),
      INDEX idx_action (action),
      INDEX idx_event_type (event_type),
      INDEX idx_severity (severity),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'setup_completed',
    description: 'Estado del setup inicial',
    query: `CREATE TABLE IF NOT EXISTS setup_completed (
      id INT PRIMARY KEY DEFAULT 1,
      completed BOOLEAN DEFAULT FALSE,
      completed_at DATETIME DEFAULT NULL,
      completed_by INT DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'module_states',
    description: 'Estados de módulos dinámicos',
    query: `CREATE TABLE IF NOT EXISTS module_states (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id VARCHAR(100) NOT NULL UNIQUE,
      is_enabled BOOLEAN DEFAULT TRUE,
      enabled_by INT DEFAULT NULL,
      enabled_at DATETIME DEFAULT NULL,
      disabled_by INT DEFAULT NULL,
      disabled_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_module_id (module_id),
      INDEX idx_is_enabled (is_enabled)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'module_folders',
    description: 'Carpetas de módulos',
    query: `CREATE TABLE IF NOT EXISTS module_folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT 'folder',
      color VARCHAR(7) DEFAULT '#0AA4A4',
      description TEXT,
      created_by INT,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_order_index (order_index)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'folder_modules',
    description: 'Módulos dentro de carpetas',
    query: `CREATE TABLE IF NOT EXISTS folder_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      folder_id INT NOT NULL,
      module_name VARCHAR(100) NOT NULL,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_folder_id (folder_id),
      INDEX idx_module_name (module_name),
      INDEX idx_order_index (order_index),
      UNIQUE KEY uk_folder_module (folder_id, module_name),
      FOREIGN KEY (folder_id) REFERENCES module_folders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'user_icon_positions',
    description: 'Posiciones personalizadas de iconos',
    query: `CREATE TABLE IF NOT EXISTS user_icon_positions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_type ENUM('module', 'folder') NOT NULL,
      item_id VARCHAR(100) NOT NULL,
      position INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_position (position),
      UNIQUE KEY uk_user_item (user_id, item_type, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  },
  {
    name: 'module_database_status',
    description: 'Estado de DB de módulos',
    query: `CREATE TABLE IF NOT EXISTS module_database_status (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id VARCHAR(100) NOT NULL UNIQUE,
      schema_version VARCHAR(20) NOT NULL,
      tables_hash VARCHAR(64),
      initialized_at DATETIME NOT NULL,
      last_updated_at DATETIME,
      initialized_by INT,
      FOREIGN KEY (initialized_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_module_id (module_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    name: 'module_tables',
    description: 'Tablas de módulos',
    query: `CREATE TABLE IF NOT EXISTS module_tables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id VARCHAR(100) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_module_table (module_id, table_name),
      INDEX idx_module_id (module_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    name: 'modules',
    description: 'Módulos del sistema',
    query: `CREATE TABLE IF NOT EXISTS modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      display_name VARCHAR(150) NOT NULL,
      description TEXT,
      icon VARCHAR(100) DEFAULT 'cube',
      gradient VARCHAR(100) DEFAULT '#3B82F6',
      route VARCHAR(200) NOT NULL,
      access_level ENUM('public', 'user', 'admin', 'mixed') DEFAULT 'admin',
      is_active BOOLEAN DEFAULT TRUE,
      is_core BOOLEAN DEFAULT FALSE,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name),
      INDEX idx_access_level (access_level),
      INDEX idx_is_active (is_active),
      INDEX idx_order_index (order_index)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  }
];

// Query para insertar el registro inicial de setup
export const SETUP_INITIAL_RECORD = `INSERT INTO setup_completed (id, completed) VALUES (1, FALSE) ON DUPLICATE KEY UPDATE id = id`;

// Query para insertar los módulos principales del sistema
export const CORE_MODULES_INSERT = `
INSERT INTO modules (name, display_name, description, icon, gradient, route, access_level, is_active, is_core, order_index) VALUES
('users', 'USUARIOS', 'Gestión de usuarios del sistema', 'users', '#ffcc80', '/dashboard/users', 'admin', TRUE, TRUE, 1),
('modules-manager', 'GESTOR DE MÓDULOS', 'Administración de módulos del sistema', 'gear', '#d1d5db', '/dashboard/modules-manager', 'admin', TRUE, TRUE, 2)
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), is_active = TRUE;
`;
