import mysql from 'mysql2/promise';

/**
 * POST /api/install/test-connection
 * Prueba una conexión con credenciales personalizadas (sin guardar)
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { host, port, user, password, database } = body;

        // Validaciones
        if (!host || !user) {
            setResponseStatus(event, 400);
            return {
                success: false,
                message: 'Host y usuario son requeridos'
            };
        }

        const connectionPort = parseInt(port) || 3306;

        // Intentar conectar
        const connection = await mysql.createConnection({
            host,
            port: connectionPort,
            user,
            password: password || '',
            connectTimeout: 10000
        });

        // Verificar si la base de datos existe (si se especificó)
        let databaseExists = false;
        if (database) {
            const [databases] = await connection.query(
                'SHOW DATABASES LIKE ?',
                [database]
            );
            databaseExists = (databases as any[]).length > 0;
        }

        // Obtener versión del servidor
        const [versionResult] = await connection.query('SELECT VERSION() as version');
        const serverVersion = (versionResult as any[])[0]?.version || 'Unknown';

        await connection.end();

        return {
            success: true,
            message: 'Conexión exitosa',
            serverVersion,
            databaseExists,
            config: {
                host,
                port: connectionPort,
                user,
                database: database || null
            }
        };

    } catch (error: any) {
        let message = 'Error de conexión';
        let errorCode = error.code || 'UNKNOWN';

        if (error.code === 'ECONNREFUSED') {
            message = 'No se puede conectar al servidor MySQL. Verifica que el servicio esté corriendo en el host y puerto especificados.';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            message = 'Acceso denegado. Usuario o contraseña incorrectos.';
        } else if (error.code === 'ETIMEDOUT') {
            message = 'Tiempo de conexión agotado. Verifica que el host sea accesible.';
        } else if (error.code === 'ENOTFOUND') {
            message = 'Host no encontrado. Verifica el nombre del servidor.';
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            message = 'Base de datos no encontrada.';
        } else {
            message = error.message || 'Error desconocido';
        }

        setResponseStatus(event, 400);
        return {
            success: false,
            message,
            errorCode,
            details: error.message
        };
    }
});
