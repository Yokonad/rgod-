# Guía Técnica del Módulo: Facturas (facturasbtw)

## 1. Descripción General
El módulo **FACTURAS** es un sistema completo de gestión de facturación integrado en el ERP ByteWave. Permite a los usuarios administrar el ciclo de vida de las facturas (emitidas y recibidas), calcular impuestos automáticamente y visualizar estadísticas financieras en tiempo real.

**Ubicación del Módulo**: `/home/proyectos/NUXT_ERP/MODULOS/facturasbtw/`

---

## 2. Estructura de Archivos y Funciones

### 📂 Raíz del Módulo (`/facturasbtw/`)

#### `module.json`
*   **Función**: Archivo de configuración principal del módulo.
*   **Detalles**: Define el ID único (`facturasbtw`), nombre, versión, autor y, crucialmente, la ruta de acceso (`/modules/facturasbtw`). El sistema usa este archivo para registrar el módulo en el Dashboard.

#### `index.vue`
*   **Función**: Componente principal de la interfaz de usuario (Frontend).
*   **Detalles**:
    *   Contiene la lógica visual (Vue 3 + Composition API).
    *   Gestiona el estado local (lista de facturas, filtros, modal de edición).
    *   Realiza las llamadas a la API (`fetch`) para obtener y guardar datos.
    *   Importa los estilos locales (`Facturas-theme.css` y `Facturas-Base.css`).

#### `schema.sql`
*   **Función**: Definición de la Base de Datos.
*   **Detalles**: Contiene la sentencia `CREATE TABLE invoices` que define la estructura de datos necesaria (campos como `invoice_number`, `amount`, `status`, etc.). El sistema usa este archivo para inicializar la base de datos automáticamente.

#### `Facturas-theme.css`
*   **Función**: Tema visual específico (Local).
*   **Detalles**: Define las **variables CSS de colores** exclusivas para este módulo.
    *   Desacopla los colores del tema global (`Bytewave-theme.css`).
    *   Controla colores de badges (Emitida=Azul, Recibida=Púrpura, Vencida=Rojo).

#### `Facturas-Base.css`
*   **Función**: Estilos estructurales base.
*   **Detalles**: Contiene las reglas CSS para la maquetación (layout), tarjetas, tablas y modales. Es la hoja de estilos "funcional" renombrada desde el original `facturas.css`.

---

## 3. API Backend (`/facturasbtw/api/`)

Esta carpeta contiene los endpoints del servidor (Nuxt Server Routes) que manejan la lógica de negocio y la conexión a la base de datos.

| Archivo | Método HTTP | Función |
| :--- | :--- | :--- |
| `list.get.ts` | **GET** | Obtiene el listado de facturas. Soporta filtros por búsqueda, estado y tipo. |
| `create.post.ts` | **POST** | Crea una nueva factura en la base de datos tras validar los datos. |
| `statistics.get.ts` | **GET** | Calcula los totales financieros (emitidas, recibidas, pendientes) para las tarjetas de estadísticas. |
| `[id]/update.put.ts` | **PUT** | Actualiza una factura existente identificada por su ID. |
| `[id]/delete.delete.ts` | **DELETE** | Elimina una factura de la base de datos. |

---

## 4. Flujo de Datos

1.  **Frontend**: El usuario interactúa con `index.vue` (ej. crea una factura).
2.  **API**: `index.vue` envía un POST a `/api/modules/facturas/create`.
3.  **Backend**: El endpoint `create.post.ts` recibe los datos, valida y ejecuta un `INSERT` en la tabla `invoices`.
4.  **Base de Datos**: Los datos se persisten en MySQL.
5.  **Respuesta**: El backend confirma el éxito y el frontend actualiza la lista.

---

## 5. Personalización

Para cambiar los colores de las etiquetas (badges) o botones específicos de este módulo, edite únicamente:
`/home/proyectos/NUXT_ERP/MODULOS/facturasbtw/Facturas-theme.css`

No edite el tema global (`Bytewave-theme.css`) para cambios exclusivos de Facturas.
