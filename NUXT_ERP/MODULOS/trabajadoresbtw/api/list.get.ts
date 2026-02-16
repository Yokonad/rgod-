import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * GET /api/modules/trabajadoresbtw/list
 * Lista todos los trabajadores
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    const query = getQuery(event);
    const { estado, area_id, search } = query;

    let sql = 'SELECT * FROM trabajadores_completo WHERE 1=1';
    const params: any[] = [];

    // Filtro por estado
    if (estado && estado !== '') {
      sql += ' AND estado = ?';
      params.push(estado);
    }

    // Filtro por área
    if (area_id && area_id !== '') {
      sql += ' AND area_id = ?';
      params.push(area_id);
    }

    // Filtro por búsqueda
    if (search && search !== '') {
      sql += ' AND (dni LIKE ? OR nombre_completo LIKE ? OR email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await executeQuery(sql, params);

    const trabajadoresData = result.success && result.data ? result.data : [];

    // Retornar objeto con formato consistente (compatibilidad con ambos nombres)
    return {
      success: true,
      trabajadores: trabajadoresData,
      workers: trabajadoresData  // Alias para compatibilidad con módulo de proyectos
    };

  } catch (error: any) {
    console.error('Error obteniendo trabajadores:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al obtener trabajadores',
      trabajadores: [],
      workers: []  // Alias para compatibilidad
    };
  }
});
