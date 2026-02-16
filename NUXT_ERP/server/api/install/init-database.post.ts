import mysql from 'mysql2/promise';
import { TABLE_CREATION_QUERIES, SETUP_INITIAL_RECORD, CORE_MODULES_INSERT } from '../../utils/schema';

/**
 * POST /api/install/init-database
 * Crea la base de datos y todas las tablas necesarias
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const results: { table: string; success: boolean; error?: string }[] = [];
    let connection: mysql.Connection | null = null;

    try {
        // Conectar sin base de datos específica para poder crearla
        connection = await mysql.createConnection({
            host: config.dbHost,
            port: parseInt(config.dbPort),
            user: config.dbUser,
            password: config.dbPassword,
            multipleStatements: true,
            connectTimeout: 10000
        });

        // Crear la base de datos si no existe
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${config.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );

        results.push({
            table: 'database',
            success: true
        });

        // Seleccionar la base de datos
        await connection.query(`USE \`${config.dbName}\``);

        // Crear cada tabla en orden
        for (const tableInfo of TABLE_CREATION_QUERIES) {
            try {
                await connection.query(tableInfo.query);
                results.push({
                    table: tableInfo.name,
                    success: true
                });
            } catch (error: any) {
                // Ignorar errores de "tabla ya existe"
                if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
                    results.push({
                        table: tableInfo.name,
                        success: false,
                        error: error.message
                    });
                } else {
                    results.push({
                        table: tableInfo.name,
                        success: true
                    });
                }
            }
        }

        // Insertar registro inicial de setup
        try {
            await connection.query(SETUP_INITIAL_RECORD);
            results.push({
                table: 'setup_initial_record',
                success: true
            });
        } catch (error: any) {
            // Ignorar si ya existe
            results.push({
                table: 'setup_initial_record',
                success: true
            });
        }

        // Insertar módulos principales del sistema
        try {
            await connection.query(CORE_MODULES_INSERT);
            results.push({
                table: 'core_modules',
                success: true
            });
        } catch (error: any) {
            // Ignorar si ya existen
            results.push({
                table: 'core_modules',
                success: true
            });
        }

        // Añadir foreign key de users a areas (puede fallar si ya existe)
        try {
            await connection.query(`
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_area 
        FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      `);
        } catch (error: any) {
            // Ignorar si la constraint ya existe
        }

        // Añadir foreign keys a setup_completed
        try {
            await connection.query(`
        ALTER TABLE setup_completed 
        ADD CONSTRAINT fk_setup_completed_by 
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
      `);
        } catch (error: any) {
            // Ignorar si la constraint ya existe
        }

        // Añadir foreign keys a module_states
        try {
            await connection.query(`
        ALTER TABLE module_states 
        ADD CONSTRAINT fk_module_enabled_by 
        FOREIGN KEY (enabled_by) REFERENCES users(id) ON DELETE SET NULL
      `);
            await connection.query(`
        ALTER TABLE module_states 
        ADD CONSTRAINT fk_module_disabled_by 
        FOREIGN KEY (disabled_by) REFERENCES users(id) ON DELETE SET NULL
      `);
        } catch (error: any) {
            // Ignorar si las constraints ya existen
        }

        // Añadir foreign key a module_folders
        try {
            await connection.query(`
        ALTER TABLE module_folders 
        ADD CONSTRAINT fk_folder_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      `);
        } catch (error: any) {
            // Ignorar si la constraint ya existe
        }

        // Añadir foreign key a activity_logs
        try {
            await connection.query(`
        ALTER TABLE activity_logs 
        ADD CONSTRAINT fk_activity_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `);
        } catch (error: any) {
            // Ignorar si la constraint ya existe
        }

        await connection.end();

        // Verificar si hubo errores
        const errors = results.filter(r => !r.success);

        if (errors.length > 0) {
            setResponseStatus(event, 500);
            return {
                success: false,
                message: 'Algunas tablas no se pudieron crear',
                results,
                errors
            };
        }

        return {
            success: true,
            message: 'Base de datos inicializada correctamente',
            results,
            tablesCreated: TABLE_CREATION_QUERIES.length
        };

    } catch (error: any) {
        console.error('Error inicializando base de datos:', error);

        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                // Ignorar errores al cerrar conexión
            }
        }

        setResponseStatus(event, 500);
        return {
            success: false,
            message: 'Error al inicializar la base de datos',
            error: error.message,
            results
        };
    }
});
