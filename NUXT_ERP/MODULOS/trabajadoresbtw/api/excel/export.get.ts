import * as XLSX from 'xlsx';
import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';

/**
 * GET /api/modules/trabajadoresbtw/excel/export
 * Exporta todos los trabajadores a Excel
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Obtener todos los trabajadores
    const result = await executeQuery('SELECT * FROM trabajadores_completo ORDER BY created_at DESC');
    const trabajadores = result.success && result.data ? result.data : [];

    if (trabajadores.length === 0) {
      setResponseStatus(event, 404);
      return { success: false, message: 'No hay trabajadores para exportar' };
    }

    // Preparar datos para Excel
    const excelData = trabajadores.map((t: any) => ({
      'DNI': t.dni,
      'NOMBRES': t.nombres,
      'APELLIDO PATERNO': t.apellido_paterno,
      'APELLIDO MATERNO': t.apellido_materno,
      'NOMBRE COMPLETO': t.nombre_completo,
      'FECHA NACIMIENTO': t.fecha_nacimiento || '',
      'EDAD': t.edad || '',
      'GÉNERO': t.genero,
      'ESTADO CIVIL': t.estado_civil,
      'TELÉFONO': t.telefono || '',
      'EMAIL': t.email || '',
      'DIRECCIÓN': t.direccion || '',
      'DISTRITO': t.distrito || '',
      'PROVINCIA': t.provincia || '',
      'DEPARTAMENTO': t.departamento || '',
      'ÁREA': t.area_nombre || 'Sin área',
      'CARGO': t.cargo || '',
      'FECHA INGRESO': t.fecha_ingreso,
      'DÍAS LABORADOS': t.dias_laborados,
      'FECHA CESE': t.fecha_cese || '',
      'TIPO CONTRATO': t.tipo_contrato,
      'ESTADO': t.estado,
      'SUELDO BÁSICO': t.sueldo_basico,
      'BANCO': t.banco || '',
      'NÚMERO CUENTA': t.numero_cuenta || '',
      'TIENE ANTECEDENTES PENALES': t.tiene_antecedentes_penales ? 'SÍ' : 'NO',
      'TIENE ANTECEDENTES POLICIALES': t.tiene_antecedentes_policiales ? 'SÍ' : 'NO',
      'TIENE SCTR': t.tiene_sctr ? 'SÍ' : 'NO',
      'TIENE EPSRC': t.tiene_epsrc ? 'SÍ' : 'NO',
      'CONTACTO EMERGENCIA': t.contacto_emergencia_nombre || '',
      'TELÉFONO EMERGENCIA': t.contacto_emergencia_telefono || '',
      'PARENTESCO EMERGENCIA': t.contacto_emergencia_parentesco || '',
      'OBSERVACIONES': t.observaciones || '',
      'FECHA REGISTRO': t.created_at
    }));

    // Crear workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

    // Ajustar ancho de columnas
    const maxWidths = Object.keys(excelData[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key as keyof typeof row] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = maxWidths;

    // Generar archivo Excel en memoria
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'export_trabajadores', `Exportó ${trabajadores.length} trabajadores a Excel`]
    );

    // Configurar headers para descarga
    const filename = `trabajadores_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length.toString()
    });

    return excelBuffer;

  } catch (error: any) {
    console.error('Error exportando trabajadores:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al exportar trabajadores: ' + error.message
    };
  }
});
