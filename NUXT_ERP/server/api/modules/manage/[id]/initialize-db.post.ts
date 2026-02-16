import { initializeModuleDatabase, hasModuleSchema } from '../../../../utils/moduleDatabase';
import { getUserFromRequest } from '../../../../utils/session';
import { logCRUD, logError } from '../../../../utils/logger';

/**
 * POST /api/modules/manage/:id/initialize-db
 * Inicializa o actualiza la base de datos de un módulo dinámico
 */
export default defineEventHandler(async (event) => {
    const moduleId = event.context.params?.id;

    if (!moduleId) {
        setResponseStatus(event, 400);
        return { success: false, message: 'ID de módulo requerido' };
    }

    try {
        // 1. Verificar autenticación y permisos de admin
        const user = await getUserFromRequest(event);
        if (!user || user.role !== 'admin') {
            setResponseStatus(event, 403);
            return { success: false, message: 'Acceso denegado. Se requieren permisos de administrador.' };
        }

        // 2. Verificar si el módulo tiene schema
        if (!hasModuleSchema(moduleId)) {
            setResponseStatus(event, 404);
            return { success: false, message: 'El módulo no tiene archivo de configuración de base de datos (schema.sql)' };
        }

        // 3. Inicializar DB
        const result = await initializeModuleDatabase(moduleId, user.id);

        // 4. Log de auditoría
        await logCRUD(
            event,
            'modules-manager',
            `initialize_db_${moduleId}`,
            'update',
            user,
            `Base de datos del módulo '${moduleId}' inicializada/actualizada. Tablas creadas: ${result.tablesCreated}, Borradas: ${result.tablesDeleted}`,
            result
        );

        return {
            success: true,
            message: 'Base de datos del módulo inicializada correctamente',
            details: result
        };

    } catch (error: any) {
        console.error(`Error inicializando DB del módulo ${moduleId}:`, error);

        // Intentar loguear el error si tenemos usuario
        try {
            const user = await getUserFromRequest(event);
            if (user) {
                await logError(event, error, 'modules-manager', `initialize_db_${moduleId}`, user);
            }
        } catch (e) { }

        setResponseStatus(event, 500);
        return {
            success: false,
            message: error.message || 'Error interno al inicializar base de datos del módulo'
        };
    }
});
