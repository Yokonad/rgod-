# Guía Técnica del Módulo: Trabajadores (trabajadoresbtw)

## 1. Descripción General
El módulo **TRABAJADORES** permite la gestión integral del personal de la empresa. Facilita la administración de altas, bajas, asignación de áreas y cargos, así como la importación masiva de datos desde archivos Excel.

**Ubicación del Módulo**: `/home/proyectos/NUXT_ERP/MODULOS/trabajadoresbtw/`

---

## 2. Estructura de Archivos y Funciones

### 📂 Raíz del Módulo (`/trabajadoresbtw/`)

#### `module.json`
*   **Función**: Configuración del módulo.
*   **Detalles**: Define el ID, nombre, permisos y ruta principal.

#### `index.vue`
*   **Función**: Interfaz de usuario principal.
*   **Detalles**:
    *   Muestra la tabla de trabajadores con filtros avanzados.
    *   Gestiona el modal de creación/edición.
    *   Maneja la lógica de paginación y ordenamiento.
    *   Importa `trabajadores-theme.css` para estilos específicos.

#### `schema.sql`
*   **Función**: Esquema de Base de Datos.
*   **Detalles**: Define la tabla `workers` y sus relaciones (áreas, cargos, etc.).

#### `trabajadores-theme.css`
*   **Función**: Tema visual local.
*   **Detalles**: Contiene las variables CSS exclusivas del módulo (colores de badges, botones, inputs) para mantener la independencia del tema global.

#### `trabajadores.css`
*   **Función**: Estilos estructurales.
*   **Detalles**: Reglas CSS para el layout de la tabla, tarjetas de estadísticas y componentes visuales específicos.

---

## 3. API Backend (`/trabajadoresbtw/api/`)

Endpoints para la gestión de datos:

| Archivo | Método | Función |
| :--- | :--- | :--- |
| `list.get.ts` | **GET** | Obtiene la lista paginada de trabajadores. |
| `create.post.ts` | **POST** | Registra un nuevo trabajador. |
| `[id]/update.put.ts` | **PUT** | Actualiza los datos de un trabajador. |
| `[id]/delete.delete.ts` | **DELETE** | Elimina (o desactiva) un trabajador. |
| `upload-files.post.ts` | **POST** | Procesa la carga masiva de trabajadores desde Excel. |

---

## 4. Personalización Visual

Para modificar colores específicos de este módulo (ej. color de "Activo" o "Cesado"), edite:
`/home/proyectos/NUXT_ERP/MODULOS/trabajadoresbtw/trabajadores-theme.css`

Este archivo anula o define variables que antes residían en el tema global, garantizando que los cambios aquí no afecten a otros módulos.
