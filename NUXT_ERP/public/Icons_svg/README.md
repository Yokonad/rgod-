# 📦 Iconos SVG - ByteWave ERP

Esta carpeta contiene todos los iconos SVG disponibles para usar en los módulos y componentes de ByteWave ERP.

## 📍 Ubicación
`/public/Icons_svg/`

## 🎨 Iconos Disponibles (35 total)

### 👥 Usuarios y Autenticación
- `user.svg` - Usuario individual
- `users.svg` - Múltiples usuarios
- `user-badge.svg` - Usuario con insignia
- `lock.svg` - Candado/seguridad
- `log-out.svg` - Cerrar sesión
- `shield.svg` - Escudo/protección
- `eye.svg` - Ver/mostrar
- `eye-off.svg` - Ocultar

### 💰 Finanzas y Facturas
- `invoice.svg` - Factura
- `dollar-sign.svg` - Símbolo de dólar
- `money.svg` - Dinero
- `credit-card.svg` - Tarjeta de crédito
- `wallet.svg` - Billetera
- `piggy-bank.svg` - Alcancía/ahorros

### 📊 Gestión y Administración
- `briefcase.svg` - Maletín/negocios
- `package.svg` - Paquete/inventario
- `inbox.svg` - Bandeja de entrada
- `list.svg` - Lista
- `filter.svg` - Filtro
- `search.svg` - Búsqueda
- `settings.svg` - Configuración

### ✅ Acciones y Estados
- `check-circle.svg` - Verificado/completado
- `alert-circle.svg` - Alerta/advertencia
- `plus.svg` - Agregar/más
- `edit.svg` - Editar
- `trash.svg` - Eliminar
- `x.svg` - Cerrar/cancelar
- `x-close.svg` - Cerrar alternativo
- `power.svg` - Encendido/apagado

### 🎫 Módulos Específicos
- `ticket.svg` - Ticket/soporte
- `trending-up.svg` - Tendencia ascendente
- `editor-badge.svg` - Insignia de editor

### 🌓 Tema
- `sun.svg` - Modo claro
- `moon.svg` - Modo oscuro

### 🔗 Navegación
- `arrow-left.svg` - Flecha izquierda/volver

## 💡 Cómo Usar

### Opción 1: Componente Icon.vue (Recomendado)
```vue
<Icon name="users" size="md" />
<Icon name="invoice" size="lg" />
<Icon name="settings" :size="32" />
```

### Opción 2: Directamente en img tag
```vue
<img src="/Icons_svg/users.svg" alt="Usuarios" />
```

### Opción 3: En CSS como background
```css
.my-button {
  background-image: url('/Icons_svg/users.svg');
}
```

### Opción 4: En module.json
```json
{
  "name": "Mi Módulo",
  "icon": "users.svg",
  "route": "/dashboard/mi-modulo"
}
```

## 📏 Tamaños Disponibles (Componente Icon.vue)
- `xs` - 12px
- `sm` - 16px
- `md` - 24px (default)
- `lg` - 32px
- `xl` - 48px
- O cualquier número personalizado: `:size="64"`

## ✨ Agregar Nuevos Iconos

1. Guarda el archivo SVG en esta carpeta
2. Usa formato kebab-case: `mi-icono.svg`
3. Asegúrate que el SVG sea válido y optimizado
4. Actualiza este README

## 🔗 Recursos

- **Iconos originales:** Copiados de ERP Flask (`/ERP/static/icons/`)
- **Fuente sugerida:** [Heroicons](https://heroicons.com/), [Feather Icons](https://feathericons.com/)
- **Optimización SVG:** [SVGOMG](https://jakearchibald.github.io/svgomg/)

---

**Última actualización:** 15 de noviembre de 2025  
**Total de iconos:** 35
