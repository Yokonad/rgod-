import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { executeQuery } from '../../utils/db';
import { getUserFromRequest } from '../../utils/session';

/**
 * POST /api/folders
 * Crea una nueva carpeta (solo admin)
 */
export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event);
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autorizado' };
    }

    // Verificar que sea admin
    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'Solo administradores pueden crear carpetas' };
    }

    const body = await readBody(event);
    const { name, icon, color, description } = body;

    // Validaciones
    if (!name || name.trim() === '') {
      setResponseStatus(event, 400);
      return { success: false, message: 'El nombre es requerido' };
    }

    // Obtener el último order_index
    const maxOrderResult = await executeQuery(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM module_folders'
    );
    const nextOrder = (maxOrderResult.data?.[0]?.max_order || -1) + 1;

    // Crear carpeta
    const result = await executeQuery(
      `INSERT INTO module_folders (name, icon, color, description, created_by, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        icon || 'folder',
        color || '#0AA4A4',
        description || '',
        user.id,
        nextOrder
      ]
    );

    if (!result.success) {
      setResponseStatus(event, 500);
      return { success: false, message: 'Error al crear carpeta' };
    }

    return {
      success: true,
      message: 'Carpeta creada exitosamente',
      folder: {
        id: result.data?.insertId,
        name: name.trim(),
        icon: icon || 'folder',
        color: color || '#0AA4A4',
        description: description || '',
        order_index: nextOrder
      }
    };
  } catch (error: any) {
    console.error('Error en POST /api/folders:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: error.message || 'Error al crear carpeta'
    };
  }
});
