# Nuxt ERP - Guía General del Sistema

## Introducción

**Nuxt ERP** es un sistema de gestión empresarial (ERP) desarrollado para **EJE Soluciones** que permite administrar y centralizar las operaciones diarias de una empresa desde una interfaz web moderna.

El sistema presenta un entorno de escritorio virtual donde los usuarios pueden acceder a diferentes módulos según sus permisos, organizar sus herramientas en carpetas personalizadas y visualizar información relevante de manera inmediata.

---

## Descripción del Entorno

### Escritorio Virtual

Al iniciar sesión, el usuario accede a un escritorio similar al de un sistema operativo tradicional. Este escritorio contiene:

- **Iconos de módulos**: Representan las aplicaciones disponibles. Cada icono tiene un color distintivo que facilita su identificación.
- **Carpetas personalizables**: Permiten agrupar módulos relacionados para una mejor organización.
- **Barra de estado**: Muestra la hora actual, fecha y opciones de configuración visual.
- **Botón de cierre de sesión**: Ubicado en la esquina inferior, permite salir del sistema de forma segura.

Los administradores tienen la capacidad de reorganizar los iconos mediante arrastrar y soltar, y el sistema recuerda estas posiciones para cada usuario individualmente.

### Modos de Visualización

El sistema ofrece dos modos de color:

- **Modo claro**: Fondo predominantemente blanco, ideal para ambientes con buena iluminación.
- **Modo oscuro**: Fondo en tonos oscuros, reduce la fatiga visual en ambientes con poca luz.

El usuario puede alternar entre ambos modos en cualquier momento desde la barra de estado.

---

## Módulos del Sistema

### Módulo de Usuarios

Permite la administración completa de los usuarios del sistema:

- **Creación de usuarios**: Registro de nuevos empleados con nombre, correo electrónico y contraseña.
- **Asignación de roles**: Cada usuario puede ser Administrador (acceso total) o Usuario (acceso limitado).
- **Gestión de áreas**: Los usuarios se pueden asignar a departamentos o áreas específicas de la empresa.
- **Estados de cuenta**: Activar o desactivar cuentas de usuario según sea necesario.
- **Importación de trabajadores**: Posibilidad de convertir registros de trabajadores existentes en usuarios del sistema.

### Módulo de Facturas

Sistema completo para el control de facturación:

- **Facturas emitidas**: Registro de facturas generadas a clientes con número, monto, fecha e impuestos.
- **Facturas recibidas**: Control de facturas de proveedores.
- **Cálculo automático de IVA**: El sistema calcula los impuestos basándose en el monto base.
- **Estados de pago**: Seguimiento del estado de cada factura (pendiente, pagada, vencida).
- **Panel de estadísticas**: Visualización de totales emitidos, recibidos y montos pendientes.

### Módulo de Logs

Registro centralizado de la actividad del sistema, disponible únicamente para administradores:

- **Historial de eventos**: Registro de todas las acciones realizadas en el sistema.
- **Filtros de búsqueda**: Por usuario, módulo, tipo de evento, severidad y fecha.
- **Tipos de evento**: Creación, lectura, actualización, eliminación, autenticación, errores y advertencias.
- **Niveles de severidad**: Bajo, medio, alto y crítico.
- **Información detallada**: Cada registro incluye IP de origen, navegador utilizado y descripción.

### Gestor de Módulos

Herramienta de administración para controlar qué funcionalidades están activas:

- **Vista de módulos**: Lista todos los módulos disponibles con su estado actual.
- **Activación y desactivación**: Habilitar o deshabilitar módulos según las necesidades.
- **Información de módulos**: Nombre, descripción, versión y autor de cada módulo.
- **Estado de base de datos**: Indica si un módulo requiere inicialización de tablas.
- **Nivel de acceso**: Muestra si el módulo es accesible para todos los usuarios o solo administradores.

---

## Roles y Permisos

### Administrador

- Acceso completo a todos los módulos del sistema
- Capacidad de crear, editar y eliminar usuarios
- Gestión de áreas y departamentos
- Activación y desactivación de módulos
- Visualización de logs del sistema
- Organización del escritorio y creación de carpetas

### Usuario

- Acceso a módulos asignados según su rol y área
- Visualización de su perfil personal
- Uso de los módulos habilitados para su nivel de acceso
- Personalización de la posición de iconos en su escritorio

---

## Acceso al Sistema

### Inicio de Sesión

1. Abrir el navegador web e ingresar a la dirección del sistema.
2. Introducir el correo electrónico registrado.
3. Introducir la contraseña.
4. Presionar el botón "Iniciar Sesión".

El sistema recordará la sesión activa. Si el usuario cierra el navegador sin cerrar sesión, al volver podrá continuar donde lo dejó.

### Cierre de Sesión

Para salir del sistema de forma segura:

1. Ubicar el botón "Salir" en la esquina inferior del escritorio.
2. Hacer clic en el botón.
3. El sistema cerrará la sesión y redirigirá a la pantalla de inicio de sesión.

---

## Seguridad

El sistema implementa las siguientes medidas de seguridad:

- **Contraseñas encriptadas**: Las contraseñas se almacenan utilizando algoritmos de encriptación seguros (bcrypt).
- **Tokens de sesión**: Cada sesión activa tiene un identificador único que expira automáticamente después de 24 horas.
- **Control de acceso por rol**: Los usuarios solo pueden acceder a las funciones autorizadas para su rol.
- **Registro de actividad**: Todas las acciones quedan registradas para auditoría.
- **Validación de datos**: El sistema verifica la información ingresada antes de procesarla.

---

## Beneficios Operativos

- **Centralización**: Toda la información de la empresa accesible desde un solo punto.
- **Organización**: Estructura modular que separa cada área funcional.
- **Trazabilidad**: Historial completo de quién realizó cada acción y cuándo.
- **Flexibilidad**: Solo se activan los módulos que la empresa necesita.
- **Accesibilidad**: Disponible desde cualquier dispositivo con navegador web.
- **Personalización**: Cada usuario puede organizar su espacio de trabajo.

---

## Contacto

Para consultas, soporte técnico o solicitud de nuevas funcionalidades, contactar al equipo de desarrollo de **EJE Soluciones**.

---

*Documento actualizado: Enero 2026*
