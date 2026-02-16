import { promises as fs } from 'fs';
import { resolve } from 'path';

/**
 * POST /api/install/save-config
 * Guarda la configuración de base de datos en el archivo .env
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { host, port, user, password, database } = body;

        // Validaciones
        if (!host || !user || !database) {
            setResponseStatus(event, 400);
            return {
                success: false,
                message: 'Host, usuario y nombre de base de datos son requeridos'
            };
        }

        // Construir contenido del archivo .env
        const envContent = `# Configuración de MariaDB/MySQL
# Generado automáticamente por el wizard de instalación
# ${new Date().toISOString()}

DB_HOST=${host}
DB_PORT=${port || 3306}
DB_USER=${user}
DB_PASSWORD=${password || ''}
DB_NAME=${database}

# Configuración de sesiones
SESSION_SECRET=${generateSecureSecret()}
SESSION_EXPIRY=86400000
`;

        // Ruta del archivo .env (raíz del proyecto)
        const envPath = resolve(process.cwd(), '.env');

        // Escribir archivo
        await fs.writeFile(envPath, envContent, 'utf-8');

        return {
            success: true,
            message: 'Configuración guardada exitosamente',
            envPath,
            note: 'El servidor necesita reiniciarse para aplicar los cambios de configuración.'
        };

    } catch (error: any) {
        console.error('Error guardando configuración:', error);
        setResponseStatus(event, 500);
        return {
            success: false,
            message: 'Error al guardar la configuración',
            error: error.message
        };
    }
});

/**
 * Genera un secreto seguro para las sesiones
 */
function generateSecureSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
