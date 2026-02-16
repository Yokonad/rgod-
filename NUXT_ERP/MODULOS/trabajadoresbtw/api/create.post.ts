import { executeQuery } from '../../../server/utils/db';
import { getUserFromRequest } from '../../../server/utils/session';
import { logCRUD, logError } from '../../../server/utils/logger';

/**
 * POST /api/modules/trabajadoresbtw/create
 * Crea un nuevo trabajador
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
      return { success: false, message: 'Solo los administradores pueden crear trabajadores' };
    }

    const body = await readBody(event);
    
    // Validaciones básicas
    if (!body.dni || !body.nombres || !body.apellido_paterno || !body.fecha_ingreso) {
      setResponseStatus(event, 400);
      return { success: false, message: 'Datos incompletos: DNI, nombres, apellido paterno y fecha de ingreso son obligatorios' };
    }

    // Verificar DNI duplicado
    const existingDNI = await executeQuery(
      'SELECT id FROM trabajadores WHERE dni = ?',
      [body.dni]
    );

    if (existingDNI.success && existingDNI.data && existingDNI.data.length > 0) {
      setResponseStatus(event, 409);
      return { success: false, message: 'Ya existe un trabajador con ese DNI' };
    }

    // Preparar datos
    const trabajadorData = {
      dni: body.dni,
      nombres: body.nombres || '',
      apellido_paterno: body.apellido_paterno || '',
      apellido_materno: body.apellido_materno || '',
      nombre_completo: body.nombre_completo || `${body.apellido_paterno || ''} ${body.apellido_materno || ''}, ${body.nombres || ''}`,
      fecha_nacimiento: body.fecha_nacimiento || null,
      lugar_nacimiento: body.lugar_nacimiento || null,
      nacionalidad: body.nacionalidad || 'Peruana',
      sexo: body.sexo || body.genero || 'M',
      estado_civil: body.estado_civil || 'Soltero',
      telefono: body.telefono || null,
      celular: body.celular || null,
      email: body.email || null,
      direccion: body.direccion || null,
      distrito: body.distrito || null,
      provincia: body.provincia || null,
      departamento: body.departamento || null,
      area_id: body.area_id || null,
      puesto: body.puesto || body.cargo || null,
      fecha_ingreso: body.fecha_ingreso,
      fecha_cese: body.fecha_cese || null,
      tipo_contrato: body.tipo_contrato || 'Indefinido',
      estado: body.estado || 'Activo',
      observaciones: body.observaciones || null,
      emergencia_nombre: body.emergencia_nombre || body.contacto_emergencia_nombre || null,
      emergencia_telefono: body.emergencia_telefono || body.contacto_emergencia_telefono || null,
      emergencia_parentesco: body.emergencia_parentesco || body.contacto_emergencia_parentesco || null,
      created_by: user.id
    };

    const columns = Object.keys(trabajadorData).join(', ');
    const placeholders = Object.keys(trabajadorData).map(() => '?').join(', ');
    const values = Object.values(trabajadorData);

    const result = await executeQuery(
      `INSERT INTO trabajadores (${columns}) VALUES (${placeholders})`,
      values
    );

    // Registrar en logs
    await logCRUD(
      event,
      'trabajadores',
      'create_worker',
      'create',
      user,
      `Trabajador creado: ${body.nombres} ${body.apellido_paterno} (${body.dni})`,
      {
        trabajador_id: result.success && result.data ? result.data.insertId : null,
        dni: body.dni,
        nombre_completo: trabajadorData.nombre_completo,
        cargo: body.cargo,
        area_id: body.area_id
      }
    );

    return {
      success: true,
      message: 'Trabajador creado exitosamente',
      trabajador_id: result.success && result.data ? result.data.insertId : null
    };

  } catch (error: any) {
    console.error('Error creando trabajador:', error);
    
    // Registrar error en logs
    await logError(event, error, 'trabajadores', 'create_worker', user);
    
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Error al crear trabajador: ' + error.message
    };
  }
});
