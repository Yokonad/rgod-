import mysql from 'mysql2/promise';
import { REQUIRED_TABLES } from '../../utils/schema';

/**
 * GET /api/install/status
 * Verifica el estado completo de la instalación
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    // Paso 1: Verificar conexión al servidor MySQL
    let connectionOk = false;
    let databaseExists = false;
    let tablesExist = false;
    let hasAdminUser = false;
    let missingTables: string[] = [];
    let errorMessage = '';

    try {
        // Intentar conectar sin especificar base de datos
        const connectionWithoutDb = await mysql.createConnection({
            host: config.dbHost,
            port: parseInt(config.dbPort),
            user: config.dbUser,
            password: config.dbPassword,
            connectTimeout: 5000
        });

        connectionOk = true;

        // Verificar si la base de datos existe
        const [databases] = await connectionWithoutDb.query(
            'SHOW DATABASES LIKE ?',
            [config.dbName]
        );

        databaseExists = (databases as any[]).length > 0;

        await connectionWithoutDb.end();

        // Si la base de datos existe, verificar tablas
        if (databaseExists) {
            const connectionWithDb = await mysql.createConnection({
                host: config.dbHost,
                port: parseInt(config.dbPort),
                user: config.dbUser,
                password: config.dbPassword,
                database: config.dbName,
                connectTimeout: 5000
            });

            // Obtener tablas existentes
            const [existingTables] = await connectionWithDb.query('SHOW TABLES');
            const tableNames = (existingTables as any[]).map(
                (row: any) => Object.values(row)[0] as string
            );

            // Verificar qué tablas faltan
            missingTables = REQUIRED_TABLES.filter(t => !tableNames.includes(t));
            tablesExist = missingTables.length === 0;

            // Si las tablas existen, verificar si hay usuarios admin
            if (tablesExist) {
                try {
                    const [users] = await connectionWithDb.query(
                        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
                    );
                    hasAdminUser = (users as any[])[0]?.count > 0;
                } catch (e) {
                    // La tabla users podría tener estructura diferente
                    hasAdminUser = false;
                }
            }

            await connectionWithDb.end();
        }

    } catch (error: any) {
        errorMessage = error.message || 'Error de conexión';

        // Determinar tipo de error
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'No se puede conectar al servidor MySQL. Verifica que el servicio esté corriendo.';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            errorMessage = 'Credenciales inválidas. Verifica usuario y contraseña.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Tiempo de conexión agotado. Verifica el host y puerto.';
        }
    }

    // Determinar paso actual
    let currentStep = 0;
    if (!connectionOk) {
        currentStep = 1; // Configurar conexión
    } else if (!databaseExists || !tablesExist) {
        currentStep = 2; // Crear base de datos/tablas
    } else if (!hasAdminUser) {
        currentStep = 3; // Crear administrador
    }
    // currentStep = 0 significa instalación completa

    return {
        connectionOk,
        databaseExists,
        tablesExist,
        hasAdminUser,
        currentStep,
        missingTables,
        errorMessage,
        config: {
            host: config.dbHost,
            port: config.dbPort,
            database: config.dbName,
            user: config.dbUser
        }
    };
});
