# Documentación Técnica y Visual: ERP ByteWave


## Índice

1.  [Resumen de Arquitectura](#1-resumen-de-arquitectura)
2.  [Estructura de Carpetas y Módulos](#2-estructura-de-carpetas-y-módulos)
3.  [Rutas y Archivos de Estilos](#3-rutas-y-archivos-de-estilos)
4.  [Guía de Colores y Temas](#4-guía-de-colores-y-temas)
5.  [Módulos Nativos Detectados](#5-módulos-nativos-detectados)

---

## 1. Resumen de Arquitectura
El sistema es una aplicación **Nuxt 3** diseñada para simular un entorno de escritorio (Web Desktop). Utiliza renderizado híbrido donde los módulos pueden ser "nativos" (compilados con la app) o cargados dinámicamente.

-   **Frontend**: Nuxt 3, Vue 3, TailwindCSS.
-   **Backend**: Nuxt Server Routes (`/server/api`).
-   **Estilos**: CSS nativo y Tailwind preseteado en variables (`var(--...)`).

---

## 2. Estructura de Carpetas y Módulos

El sistema busca módulos en dos ubicaciones principales:

### A. Módulos Nativos (Hardcoded)
Son los módulos base del sistema. Se encuentran en:
`app/pages/dashboard/`

| Carpeta/Archivo | Función |

| `users/` | Código fuente del módulo de Usuarios. |
| `modules-manager.vue` | Interfaz del Gestor de Módulos (instalador). |
| `index.vue` | **Escritorio Principal**: Carga los iconos y gestiona las ventanas. |

### B. Módulos Dinámicos (Externos)
Son los módulos que se pueden agregar o quitar. El sistema espera encontrarlos en:
`/home/proyectos/NUXT_ERP/MODULOS/`

> **Nota**: Actualmente esta carpeta parece estar vacía en el sistema de archivos, pero el tema visual (`Bytewave-theme.css`) tiene estilos preparados para: Horarios, Proyectos, Trabajadores y Logs. El módulo **facturas** tiene su propio tema local.

---

## 3. Rutas y Archivos de Estilos

El sistema visual está centralizado para permitir cambios de tema globales (Modo Claro / Modo Oscuro) y específicos por módulo.

### Archivos Principales

| Archivo | Ruta Absoluta | Función |
| :--- | :--- | :--- |
| **Tema Global** | `/home/proyectos/NUXT_ERP/app/assets/css/Bytewave-theme.css` | Define **TODAS** las variables de color (`--color-primary`, etc.) y paletas específicas por módulo. Es el archivo más importante para cambios visuales. |
| **CSS Principal** | `/home/proyectos/NUXT_ERP/app/assets/css/main.css` | Punto de entrada. Importa Tailwind y `Bytewave-theme.css`. Aplica estilos globales al `body`. |
| **Iconos Desktop** | `/home/proyectos/NUXT_ERP/app/components/DesktopIcon.vue` | Contiene la lógica para renderizar los gradientes de los iconos ("purple", "teal", "blue") basados en las props. |

---

## 4. Guía de Colores y Temas

El sistema utiliza una arquitectura híbrida para la gestión de temas.

### A. Tema Local (Arquitectura Modular) 🆕
Los nuevos módulos o aquellos refactorizados **NO dependen** de `Bytewave-theme.css` para sus colores específicos. Tienen su propio archivo de tema dentro de su carpeta.

#### 1. Módulo: Facturas (`facturasbtw`)
*   **Archivo de Tema**: `/MODULOS/facturasbtw/Facturas-theme.css`
*   **Independencia**: Total. Define sus propios colores para badges, botones y estados sin contaminar el CSS global.
*   **Variables Clave**:
    *   `--badge-emitida-bg-facturas` (Azul)
#### 2. Módulo: Trabajadores (`trabajadoresbtw`) 🆕
*   **Archivo de Tema**: `/MODULOS/trabajadoresbtw/trabajadores-theme.css`
*   **Independencia**: Total. Define colores para estados (Activo, Cesado, Vacaciones) y botones de importación.
*   **Variables Clave**:
    *   `--stat-icon-bg-activos-trabajadores` (Emerald)
    *   `--badge-cesado-bg-trabajadores` (Rojo)

---

### B. Tema Global (Arquitectura Legacy)
Módulos que aún centralizan sus variables en `Bytewave-theme.css`. Estos irán migrando gradualmente a temas locales.

#### 3. Módulo: Proyectos
*   **Color Base**: Teal (`#0AA4A4`)
*   **Estado**: Depende de `Bytewave-theme.css`.

#### 4. Módulo: Horarios
*   **Color Base**: Cyan/Teal
*   **Estado**: Depende de `Bytewave-theme.css`.

---

## 5. Módulos Nativos Detectados

Existen físicamente en el código y tienen lógica implementada:

### **Usuarios (Users)**
*   **Ruta Web**: `/dashboard/users`
*   **Archivo Vue**: `app/pages/dashboard/users.vue`
*   **Estilos**: `app/pages/dashboard/users.css`
*   **Funcionalidad**: Listado de usuarios, asignación de roles y estados, filtros por cards.

### **Gestor de Módulos (Modules Manager)**
*   **Ruta Web**: `/dashboard/modules-manager`
*   **Archivo Vue**: `app/pages/dashboard/modules-manager.vue`
*   **Estilos**: `app/pages/dashboard/modules-manager.css`
*   **Funcionalidad**: Tarjetas para activar/desactivar módulos del sistema (simulado o conectado a BD).
