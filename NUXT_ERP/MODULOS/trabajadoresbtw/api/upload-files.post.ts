import { handleFileUploads, type UploadedFile } from '../../../server/utils/fileUpload';
import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';

/**
 * POST /api/modules/trabajadoresbtw/upload-files
 * Sube archivos de un trabajador
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    if (user.role !== 'admin') {
      setResponseStatus(event, 403);
      return { success: false, message: 'Solo los administradores pueden subir archivos' };
    }

    // Procesar archivos
    const { files, fields } = await handleFileUploads(event, {
      uploadDir: '/uploads/trabajadores',
      allowedTypes: ['image', 'pdf', 'doc', 'docx'],
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    const trabajadorId = parseInt(fields.trabajador_id);

    if (!trabajadorId || isNaN(trabajadorId)) {
      setResponseStatus(event, 400);
      return { success: false, message: 'ID de trabajador inválido' };
    }

    // Verificar que el trabajador existe
    const trabajador = await executeQuery(
      'SELECT id FROM trabajadores WHERE id = ?',
      [trabajadorId]
    );

    if (!trabajador.success || !trabajador.data || trabajador.data.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'Trabajador no encontrado' };
    }

    const savedDocuments = [];

    // Mapeo de campos a tipos de documento
    const tipoDocumentoMap: Record<string, string> = {
      dni: 'DNI',
      cv: 'CV',
      certificado: 'Certificado',
      firma: 'Firma',
      foto: 'Foto'
    };

    // Guardar cada archivo en la base de datos
    for (const [fieldName, fileList] of Object.entries(files)) {
      const tipoDocumento = tipoDocumentoMap[fieldName] || 'Otros';

      for (const file of fileList) {
        const result = await executeQuery(
          `INSERT INTO trabajadores_documentos 
           (trabajador_id, tipo_documento, nombre_archivo, ruta_archivo, subido_por) 
           VALUES (?, ?, ?, ?, ?)`,
          [trabajadorId, tipoDocumento, file.originalName, file.path, user.id]
        );

        if (result.success) {
          savedDocuments.push({
            id: result.data.insertId,
            tipo: tipoDocumento,
            nombre: file.originalName,
            ruta: file.path
          });
        }
      }
    }

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'upload_trabajador_docs', `Subió ${savedDocuments.length} documento(s) del trabajador ID: ${trabajadorId}`]
    );

    return {
      success: true,
      message: `${savedDocuments.length} archivo(s) subido(s) correctamente`,
      documents: savedDocuments
    };

  } catch (error: any) {
    console.error('Error subiendo archivos:', error);
    setResponseStatus(event, 500);
    return { 
      success: false, 
      message: error.message || 'Error al subir archivos',
      error: error.toString()
    };
  }
});
