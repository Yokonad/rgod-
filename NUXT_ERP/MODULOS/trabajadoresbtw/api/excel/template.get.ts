import * as XLSX from 'xlsx';
import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';

/**
 * GET /api/modules/trabajadoresbtw/excel/template
 * Genera y descarga plantilla Excel para importación de trabajadores
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromRequest(event);
    
    if (!user) {
      setResponseStatus(event, 401);
      return { success: false, message: 'No autenticado' };
    }

    // Definir estructura simplificada de la plantilla
    const headers = [
      'DNI (*)',
      'NOMBRE COMPLETO (*)',
      'EMAIL',
      'TELEFONO',
      'SISTEMA PENSIONES',
      'FECHA NACIMIENTO',
      'LUGAR NACIMIENTO',
      'ESTADO'
    ];

    // Ejemplo de fila de datos
    const exampleRow = [
      '12345678',
      'Pérez García, Juan Carlos',
      'juan.perez@email.com',
      '999888777',
      'AFP',
      '1990-05-15',
      'Lima, Lima',
      'Activo'
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Plantilla con headers y ejemplo
    const worksheetData = [headers, exampleRow];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 12 }, // DNI
      { wch: 40 }, // Nombre Completo
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 18 }, // Sistema Pensiones
      { wch: 16 }, // Fecha Nacimiento
      { wch: 25 }, // Lugar Nacimiento
      { wch: 12 }  // Estado
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

    // Hoja 2: Instrucciones
    const instructions = [
      ['INSTRUCCIONES PARA IMPORTAR TRABAJADORES'],
      [''],
      ['CAMPOS OBLIGATORIOS (*)'],
      ['• DNI: Documento de identidad de 8-12 caracteres'],
      ['• NOMBRE COMPLETO: Formato "Apellidos, Nombres" (ej: Pérez García, Juan Carlos)'],
      [''],
      ['CAMPOS OPCIONALES'],
      ['• EMAIL: Correo electrónico del trabajador'],
      ['• TELEFONO: Número de contacto del trabajador'],
      ['• SISTEMA PENSIONES: Solo AFP u ONP'],
      ['• FECHA NACIMIENTO: Formato YYYY-MM-DD (ej: 1990-05-15) o formato de texto como "sept 10, 1999"'],
      ['• LUGAR NACIMIENTO: Ciudad y departamento (ej: Lima, Lima)'],
      ['• ESTADO: Activo, Inactivo, Cesado, Vacaciones o Licencia (por defecto: Activo)'],
      [''],
      ['FORMATOS DE FECHA ACEPTADOS:'],
      ['• YYYY-MM-DD (ej: 1990-05-15)'],
      ['• Formato de texto (ej: "sept 10, 1999", "10/09/1999")'],
      ['• Excel convertirá automáticamente las fechas al formato correcto'],
      [''],
      ['VALORES VÁLIDOS PARA ESTADO:'],
      ['• Activo (predeterminado si se deja vacío)'],
      ['• Inactivo'],
      ['• Cesado'],
      ['• Vacaciones'],
      ['• Licencia'],
      [''],
      ['NOTAS IMPORTANTES:'],
      ['1. Solo DNI y Nombre Completo son obligatorios'],
      ['2. El DNI debe ser único (no puede repetirse)'],
      ['3. El nombre completo debe seguir el formato "Apellidos, Nombres"'],
      ['4. Sistema de pensiones solo acepta: AFP u ONP'],
      ['5. Los datos opcionales se pueden completar después editando al trabajador'],
      ['6. Los archivos (DNI, CV, certificados, firma, foto) se suben desde el sistema'],
      ['7. Puede eliminar la fila de ejemplo antes de importar'],
      ['8. Guarde el archivo como Excel (.xlsx)'],
      ['9. No modifique los nombres de las columnas']
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionsSheet['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');

    // Generar archivo Excel en memoria
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'download_template', 'Descargó plantilla Excel de trabajadores']
    );

    // Configurar headers para descarga
    setResponseHeaders(event, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_trabajadores.xlsx"',
      'Content-Length': excelBuffer.length.toString()
    });

    return excelBuffer;

  } catch (error: any) {
    console.error('Error generando plantilla:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al generar plantilla: ' + error.message
    };
  }
});
