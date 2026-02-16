import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { executeQuery } from './db';

const MODULES_DIR = path.join(process.cwd(), 'MODULOS');

/**
 * Parsea un archivo SQL y extrae los nombres de las tablas que se crean
 * Busca patrones CREATE TABLE [IF NOT EXISTS] tableName
 */
function extractTableNames(sqlContent: string): string[] {
    const tableNames: string[] = [];
    // Regex para encontrar nombres de tablas en sentencias CREATE TABLE
    // Soporta: CREATE TABLE x, CREATE TABLE IF NOT EXISTS x, comillas invertidas, etc.
    const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/gi;

    let match;
    while ((match = regex.exec(sqlContent)) !== null) {
        if (match[1]) {
            tableNames.push(match[1]);
        }
    }

    return [...new Set(tableNames)]; // Eliminar duplicados
}

/**
 * Calcula un hash del contenido del archivo schema.sql para detectar cambios
 */
function calculateSchemaHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Verifica si un módulo tiene un archivo schema.sql
 */
export function hasModuleSchema(moduleId: string): boolean {
    const schemaPath = path.join(MODULES_DIR, moduleId, 'schema.sql');
    return fs.existsSync(schemaPath);
}

/**
 * Obtiene el estado de inicialización de la base de datos de un módulo
 */
export async function getModuleDatabaseStatus(moduleId: string) {
    try {
        const result = await executeQuery(
            'SELECT * FROM module_database_status WHERE module_id = ?',
            [moduleId]
        );

        if (result.success && result.data && result.data.length > 0) {
            return result.data[0];
        }
        return null;
    } catch (error) {
        console.error(`Error consultando estado DB módulo ${moduleId}:`, error);
        return null;
    }
}

/**
 * Inicializa o actualiza la base de datos de un módulo
 * Realiza sincronización automática:
 * 1. Ejecuta el nuevo schema
 * 2. Detecta tablas antiguas que ya no están en el schema y las elimina
 * 3. Registra las nuevas tablas
 */
export async function initializeModuleDatabase(moduleId: string, userId: number | null) {
    const schemaPath = path.join(MODULES_DIR, moduleId, 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
        throw new Error(`El módulo ${moduleId} no tiene archivo schema.sql`);
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    const newTables = extractTableNames(sqlContent);
    const schemaHash = calculateSchemaHash(sqlContent);

    // 1. Obtener tablas registradas actualmente para este módulo
    const currentTablesResult = await executeQuery(
        'SELECT table_name FROM module_tables WHERE module_id = ?',
        [moduleId]
    );

    const currentTables = (currentTablesResult.data || []).map((row: any) => row.table_name);

    // 2. Identificar tablas a eliminar (están en BD pero no en el nuevo schema)
    const tablesToDelete = currentTables.filter((table: string) => !newTables.includes(table));

    // 3. Obtener versión del module.json
    const moduleJsonPath = path.join(MODULES_DIR, moduleId, 'module.json');
    let version = '1.0.0';
    if (fs.existsSync(moduleJsonPath)) {
        try {
            const moduleConfig = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
            version = moduleConfig.version || version;
        } catch (e) {
            // Ignorar error de lectura JSON
        }
    }

    // --- TRANSACCIÓN ---
    // Nota: MySQL no soporta transacciones completas para DDL (CREATE/DROP), 
    // pero intentaremos mantener la integridad lógica.

    // 4. Eliminar tablas obsoletas
    if (tablesToDelete.length > 0) {
        console.log(`[ModuleDB] Eliminando tablas obsoletas del módulo ${moduleId}: ${tablesToDelete.join(', ')}`);
        // Desactivar checks de FK temporalmente para evitar errores al borrar
        await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

        for (const table of tablesToDelete) {
            await executeQuery(`DROP TABLE IF EXISTS \`${table}\``);
            // Eliminar registro de module_tables
            await executeQuery(
                'DELETE FROM module_tables WHERE module_id = ? AND table_name = ?',
                [moduleId, table]
            );
        }

        await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    }

    // 5. Ejecutar el SQL del schema (crea nuevas tablas o actualiza existentes si el SQL lo soporta)
    // Dividimos por ; para ejecutar múltiples sentencias si el driver lo requiere, 
    // aunque executeQuery puede manejar múltiples sentencias si está configurado.
    // Asumiremos que executeQuery soporta múltiples sentencias string.
    const executionResult = await executeQuery(sqlContent);

    if (!executionResult.success) {
        throw new Error(`Error ejecutando SQL del módulo: ${executionResult.error?.message || 'Error desconocido'}`);
    }

    // 6. Actualizar registro de tablas actuales (module_tables)
    for (const table of newTables) {
        // Insert ignore para evitar duplicados
        await executeQuery(
            'INSERT IGNORE INTO module_tables (module_id, table_name) VALUES (?, ?)',
            [moduleId, table]
        );
    }

    // 7. Actualizar estado del módulo (module_database_status)
    // Usamos INSERT ... ON DUPLICATE KEY UPDATE
    await executeQuery(
        `INSERT INTO module_database_status 
      (module_id, schema_version, tables_hash, initialized_at, last_updated_at, initialized_by)
     VALUES (?, ?, ?, NOW(), NOW(), ?)
     ON DUPLICATE KEY UPDATE
      schema_version = VALUES(schema_version),
      tables_hash = VALUES(tables_hash),
      last_updated_at = NOW(),
      initialized_by = VALUES(initialized_by)`,
        [moduleId, version, schemaHash, userId]
    );

    return {
        success: true,
        tablesCreated: newTables.length,
        tablesDeleted: tablesToDelete.length,
        newTables,
        deletedTables: tablesToDelete
    };
}
