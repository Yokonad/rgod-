import { getUserFromRequest } from '../../../../../server/utils/session';
import { executeQuery } from '../../../../../server/utils/db';
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const user = await getUserFromRequest(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // Solo administradores pueden eliminar documentos
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para eliminar documentos'
      })
    }

    const trabajadorId = getRouterParam(event, 'id')
    const docId = getRouterParam(event, 'docId')

    if (!trabajadorId || !docId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de trabajador o documento no proporcionado'
      })
    }

    // Obtener información del documento
    const [documents] = await pool.query(
      'SELECT * FROM trabajadores_documentos WHERE id = ? AND trabajador_id = ?',
      [docId, trabajadorId]
    )

    if (!documents || documents.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Documento no encontrado'
      })
    }

    const document = documents[0]

    // Eliminar archivo físico
    try {
      const filePath = path.join(process.cwd(), 'public', document.ruta_archivo)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (fileError) {
      console.error('Error eliminando archivo físico:', fileError)
      // Continuar con la eliminación de la base de datos aunque falle el archivo
    }

    // Eliminar registro de la base de datos
    await pool.query(
      'DELETE FROM trabajadores_documentos WHERE id = ?',
      [docId]
    )

    return {
      success: true,
      message: 'Documento eliminado correctamente'
    }

  } catch (error) {
    console.error('Error eliminando documento:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error al eliminar documento'
    })
  }
})
