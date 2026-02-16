import * as XLSX from 'xlsx';
import { executeQuery } from '../../../../server/utils/db';
import { getUserFromRequest } from '../../../../server/utils/session';

/**
 * POST /api/modules/trabajadoresbtw/excel/import
 * Importa trabajadores desde archivo Excel
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
      return { success: false, message: 'Solo los administradores pueden importar trabajadores' };
    }

    // Leer el archivo del body
    const formData = await readMultipartFormData(event);
    
    if (!formData || formData.length === 0) {
      setResponseStatus(event, 400);
      return { success: false, message: 'No se recibió ningún archivo' };
    }

    const fileData = formData[0];
    if (!fileData.data) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Archivo inválido' };
    }

    // Leer archivo Excel
    const workbook = XLSX.read(fileData.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      setResponseStatus(event, 400);
      return { success: false, message: 'El archivo no contiene datos para importar' };
    }

    const headers = data[0];
    const rows = data.slice(1).filter(row => row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''));

    // Resultados de la importación
    const results = {
      total: rows.length,
      imported: 0,
      errors: [] as any[]
    };

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 porque la fila 1 son headers y empezamos en 0

      try {
        // Mapear datos de la fila (8 columnas)
        const dni = row[0]?.toString().trim();
        const nombreCompleto = row[1]?.toString().trim();
        const email = row[2]?.toString().trim() || null;
        const telefono = row[3]?.toString().trim() || null;
        const sistemaPensiones = row[4]?.toString().trim() || null;
        let fechaNacimiento = row[5]?.toString().trim() || null;
        const lugarNacimiento = row[6]?.toString().trim() || null;
        const estado = row[7]?.toString().trim() || 'Activo';

        // Validaciones obligatorias (solo DNI y Nombre Completo)
        if (!dni || !nombreCompleto) {
          results.errors.push({
            row: rowNumber,
            dni: dni || '',
            error: 'Campos obligatorios faltantes: DNI y Nombre Completo'
          });
          continue;
        }

        // Separar nombre completo: "Apellidos, Nombres"
        let apellido_paterno = '';
        let apellido_materno = '';
        let nombres = '';
        
        if (nombreCompleto.includes(',')) {
          const partes = nombreCompleto.split(',');
          const apellidos = partes[0].trim().split(' ');
          apellido_paterno = apellidos[0] || '';
          apellido_materno = apellidos.slice(1).join(' ') || '';
          nombres = partes[1].trim();
        } else {
          // Fallback: intentar separar por espacios
          const nombreParts = nombreCompleto.split(' ').filter(p => p.length > 0);
          if (nombreParts.length < 2) {
            results.errors.push({
              row: rowNumber,
              dni: dni,
              error: 'Nombre Completo debe estar en formato "Apellidos, Nombres"'
            });
            continue;
          }
          apellido_paterno = nombreParts[0];
          apellido_materno = nombreParts.length > 2 ? nombreParts[1] : '';
          nombres = nombreParts.slice(nombreParts.length > 2 ? 2 : 1).join(' ');
        }

        // Validar DNI (8-12 caracteres)
        if (dni.length < 8 || dni.length > 12) {
          results.errors.push({
            row: rowNumber,
            dni: dni,
            error: 'DNI debe tener entre 8 y 12 caracteres'
          });
          continue;
        }

        // Convertir y validar fecha de nacimiento si existe
        if (fechaNacimiento) {
          try {
            // Mapa de meses en español a números
            const mesesMap: Record<string, string> = {
              'ene': '01', 'enero': '01',
              'feb': '02', 'febrero': '02',
              'mar': '03', 'marzo': '03',
              'abr': '04', 'abril': '04',
              'may': '05', 'mayo': '05',
              'jun': '06', 'junio': '06',
              'jul': '07', 'julio': '07',
              'ago': '08', 'agosto': '08',
              'sept': '09', 'septiembre': '09',
              'oct': '10', 'octubre': '10',
              'nov': '11', 'noviembre': '11',
              'dic': '12', 'diciembre': '12'
            };

            // Si ya está en formato YYYY-MM-DD, validar y continuar
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (fechaRegex.test(fechaNacimiento)) {
              // Ya está en formato correcto
            } else {
              // Intentar parsear formato "dic 29, 1993" o similar
              const formatoTexto = fechaNacimiento.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/i);
              if (formatoTexto) {
                const mesTexto = formatoTexto[1].toLowerCase();
                const dia = formatoTexto[2].padStart(2, '0');
                const anio = formatoTexto[3];
                
                const mesNumero = mesesMap[mesTexto];
                if (mesNumero) {
                  fechaNacimiento = `${anio}-${mesNumero}-${dia}`;
                } else {
                  throw new Error('Mes no reconocido');
                }
              } else {
                // Intentar parsear con Date (funciona con muchos formatos en inglés)
                const fecha = new Date(fechaNacimiento);
                
                if (!isNaN(fecha.getTime())) {
                  fechaNacimiento = fecha.toISOString().split('T')[0];
                } else {
                  throw new Error('Formato no reconocido');
                }
              }
            }
          } catch (e) {
            results.errors.push({
              row: rowNumber,
              dni: dni,
              error: 'Fecha de Nacimiento en formato inválido. Use YYYY-MM-DD o formato como "dic 29, 1993"'
            });
            continue;
          }
        }

        // Validar sistema de pensiones (solo AFP u ONP)
        if (sistemaPensiones && !['AFP', 'ONP'].includes(sistemaPensiones.toUpperCase())) {
          results.errors.push({
            row: rowNumber,
            dni: dni,
            error: 'Sistema de Pensiones solo puede ser AFP u ONP'
          });
          continue;
        }

        // Normalizar estado
        const estadoNormalizado = estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
        const estadosValidos = ['Activo', 'Inactivo', 'Cesado', 'Vacaciones', 'Licencia'];
        
        if (!estadosValidos.includes(estadoNormalizado)) {
          results.errors.push({
            row: rowNumber,
            dni: dni,
            error: `Estado debe ser: ${estadosValidos.join(', ')}`
          });
          continue;
        }

        // Fecha de ingreso por defecto es hoy
        const fechaIngreso = new Date().toISOString().split('T')[0];

        // Verificar si el DNI ya existe
        const existingDNI = await executeQuery(
          'SELECT id FROM trabajadores WHERE dni = ?',
          [dni]
        );

        if (existingDNI.success && existingDNI.data && existingDNI.data.length > 0) {
          // Si existe, actualizar los datos básicos
          await executeQuery(
            `UPDATE trabajadores 
             SET nombre_completo = ?, nombres = ?, apellido_paterno = ?, apellido_materno = ?,
                 email = ?, telefono = ?, sistema_pensiones = ?,
                 fecha_nacimiento = ?, lugar_nacimiento = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE dni = ?`,
            [
              nombreCompleto, nombres, apellido_paterno, apellido_materno,
              email, telefono, sistemaPensiones?.toUpperCase(),
              fechaNacimiento, lugarNacimiento,
              dni
            ]
          );
        } else {
          // Si no existe, insertar nuevo trabajador con datos básicos
          await executeQuery(
            `INSERT INTO trabajadores (
              dni, nombre_completo, nombres, apellido_paterno, apellido_materno,
              email, telefono, sistema_pensiones,
              fecha_nacimiento, lugar_nacimiento,
              fecha_ingreso, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              dni, nombreCompleto, nombres, apellido_paterno, apellido_materno,
              email, telefono, sistemaPensiones?.toUpperCase(),
              fechaNacimiento, lugarNacimiento,
              fechaIngreso, estadoNormalizado
            ]
          );
        }

        results.imported++;

      } catch (error: any) {
        results.errors.push({
          row: rowNumber,
          error: error.message
        });
      }
    }

    // Log de actividad
    await executeQuery(
      'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
      [user.id, 'import_trabajadores', `Importó ${results.imported} trabajadores desde Excel`]
    );

    // Retornar resultados directamente
    return {
      success: true,
      total: results.total,
      imported: results.imported,
      errors: results.errors
    };

  } catch (error: any) {
    console.error('Error importando trabajadores:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al importar trabajadores: ' + error.message
    };
  }
});

// Helper para convertir fechas de Excel
function parseExcelDate(value: any): string | null {
  try {
    if (typeof value === 'string') {
      // Si ya es un string en formato YYYY-MM-DD, retornar tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
    }
    
    if (typeof value === 'number') {
      // Excel almacena fechas como número de días desde 1900-01-01
      const date = XLSX.SSF.parse_date_code(value);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    return null;
  } catch {
    return null;
  }
}
