<template>
  <div class="manager-layout">
    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor glassmorphism -->
    <div class="manager-container">
      <!-- Header con botón volver -->
      <header class="module-header">
        <div class="header-left">
          <button @click="goToDashboard" class="btn-back">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver
          </button>
          <h1>
            <img src="/Icons_svg/package.svg" class="title-icon" alt="Gestor">
            GESTOR DE MÓDULOS
          </h1>
        </div>
        <div class="header-right">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-container">
            <label class="theme-switch" for="darkModeToggleManager" title="Modo oscuro">
              <input type="checkbox" id="darkModeToggleManager" v-model="isDarkMode">
              <span class="slider">
                <img src="/Icons_svg/sun.svg" class="sun-icon" alt="Modo Día">
                <img src="/Icons_svg/moon.svg" class="moon-icon" alt="Modo Noche">
              </span>
            </label>
          </div>
        </div>
      </header>

      <main class="module-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>TOTAL MÓDULOS</h3>
              <p class="stat-number">{{ modules.length }}</p>
              <p class="stat-subtitle">Instalados en el sistema</p>
            </div>
          </div>

          <div class="stat-card stat-enabled">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>ACTIVOS</h3>
              <p class="stat-number">{{ enabledCount }}</p>
              <p class="stat-subtitle">Módulos habilitados</p>
            </div>
          </div>

          <div class="stat-card stat-disabled">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>INACTIVOS</h3>
              <p class="stat-number">{{ disabledCount }}</p>
              <p class="stat-subtitle">Módulos deshabilitados</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-container">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Nombre del módulo..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="w-40">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select
                v-model="filters.status"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="enabled">Activos</option>
                <option value="disabled">Inactivos</option>
              </select>
            </div>

            <div class="w-40">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nivel de Acceso</label>
              <select
                v-model="filters.accessLevel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="user">Usuario</option>
                <option value="public">Público</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>

            <button
              @click="clearFilters"
              class="btn-limpiar px-4 py-2 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        <!-- Modules Table -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Módulo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Versión</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Autor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Base de Datos</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nivel</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading">
                  <td colspan="8" class="px-6 py-12 text-center">
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando módulos...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="filteredModules.length === 0">
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                    <svg class="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>No hay módulos para mostrar</p>
                  </td>
                </tr>
                <tr
                  v-for="module in filteredModules"
                  :key="module.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img 
                        :src="`/Icons_svg/${module.icon || 'package'}.svg`" 
                        :alt="module.name"
                        class="h-8 w-8 mr-3"
                        :class="{'opacity-30': !module.enabled}"
                      />
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ module.name }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ module.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 dark:text-white truncate max-w-xs">{{ module.description }}</div>
                    <div v-if="module.statusMessage" class="text-xs text-amber-500 mt-1 font-medium">{{ module.statusMessage }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-mono text-gray-700 dark:text-gray-300">v{{ module.version }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ module.author }}</span>
                  </td>
                  <!-- Columna Base de Datos -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="module.requiresDatabase">
                       <div v-if="module.databaseInitialized">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1 w-fit">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          OK v{{ module.databaseVersion || '?' }}
                        </span>
                        <button
                           @click="initializeDatabase(module)"
                           :disabled="initializing === module.id"
                           class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-1 flex items-center gap-1"
                           title="Actualizar tablas"
                        >
                           <span v-if="initializing === module.id" class="animate-spin h-3 w-3 border-b-2 border-blue-600 rounded-full"></span>
                           Actualizar
                        </button>
                      </div>
                      <div v-else>
                         <button
                           @click="initializeDatabase(module)"
                           :disabled="initializing === module.id"
                           class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                         >
                           <svg v-if="initializing !== module.id" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                           </svg>
                           <span v-if="initializing === module.id" class="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                           {{ initializing === module.id ? 'Iniciando...' : 'Inicializar BD' }}
                         </button>
                      </div>
                    </div>
                    <span v-else class="text-xs text-gray-400">No requiere</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getAccessLevelClass(module.access_level)"
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ getAccessLevelText(module.access_level) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <!-- Deshabilitar toggle si requiere DB y no está inicializada -->
                      <button
                        @click="toggleModule(module)"
                        :disabled="toggling === module.id || (module.requiresDatabase && !module.databaseInitialized)"
                        class="toggle-switch"
                        :class="[
                          module.enabled ? 'toggle-enabled' : 'toggle-disabled',
                          (module.requiresDatabase && !module.databaseInitialized) ? 'opacity-50 cursor-not-allowed' : ''
                        ]"
                        :title="(module.requiresDatabase && !module.databaseInitialized) ? 'Debes inicializar la base de datos primero' : (module.enabled ? 'Desactivar módulo' : 'Activar módulo')"
                      >
                        <span class="toggle-slider" :class="module.enabled ? 'translate-x-5' : 'translate-x-0'"></span>
                      </button>
                      <span class="ml-3 text-sm font-medium" :class="module.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                        {{ module.enabled ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <button
                        v-if="module.hasComponent"
                        @click="navigateTo(module.route)"
                        class="btn-accion-ver p-2 rounded-lg transition-colors"
                        title="Ver módulo"
                        :disabled="!module.enabled"
                        :class="{'opacity-50 cursor-not-allowed': !module.enabled}"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <span v-else class="text-xs text-gray-400">Sin UI</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

definePageMeta({
  layout: false,
});

// Verificar que el usuario sea admin
const { user } = useAuth();
if (user.value?.role !== 'admin') {
  navigateTo('/dashboard');
}

// Helper para navegación
const goToDashboard = () => {
  navigateTo('/dashboard');
};

// Estado
const modules = ref<any[]>([]);
const loading = ref(false);
const toggling = ref<string | null>(null);
const initializing = ref<string | null>(null);

// Dark mode
const { isDarkMode } = useTheme();

const filters = ref({
  search: '',
  status: '',
  accessLevel: ''
});

// Computed
const enabledCount = computed(() => modules.value.filter(m => m.enabled).length);
const disabledCount = computed(() => modules.value.filter(m => !m.enabled).length);

const filteredModules = computed(() => {
  return modules.value.filter(module => {
    // Filtro de búsqueda
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase();
      const matchName = module.name.toLowerCase().includes(search);
      const matchId = module.id.toLowerCase().includes(search);
      const matchDesc = module.description?.toLowerCase().includes(search);
      if (!matchName && !matchId && !matchDesc) return false;
    }

    // Filtro de estado
    if (filters.value.status) {
      if (filters.value.status === 'enabled' && !module.enabled) return false;
      if (filters.value.status === 'disabled' && module.enabled) return false;
    }

    // Filtro de nivel de acceso
    if (filters.value.accessLevel && module.access_level !== filters.value.accessLevel) {
      return false;
    }

    return true;
  });
});

// Métodos
const loadModules = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('bytewave_auth_token');
    
    // Usamos timestamp para evitar cache agresivo del navegador
    const response = await fetch(`/api/modules/manage/list?t=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json());

    if (response.success) {
      modules.value = response.modules;
    }
  } catch (error) {
    console.error('Error cargando módulos:', error);
    alert('Error al cargar módulos');
  } finally {
    loading.value = false;
  }
};

const initializeDatabase = async (module: any) => {
  if (initializing.value) return;

  const confirmMsg = module.databaseInitialized 
    ? `¿Estás seguro de actualizar la base de datos del módulo "${module.name}"? Esto podría modificar las tablas existentes.`
    : `¿Inicializar la base de datos para el módulo "${module.name}"?`;

  if (!confirm(confirmMsg)) return;

  try {
    initializing.value = module.id;
    const token = localStorage.getItem('bytewave_auth_token');

    const response = await fetch(`/api/modules/manage/${module.id}/initialize-db`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json());

    if (response.success) {
      alert(`Base de datos inicializada correctamente.\nTablas creadas: ${response.details.tablesCreated}\nTablas eliminadas: ${response.details.tablesDeleted}`);
      await loadModules(); // Recargar para actualizar estado
    } else {
      alert(response.message || 'Error al inicializar base de datos');
    }
  } catch (error) {
    console.error('Error inicializando DB:', error);
    alert('Error al conectar con el servidor');
  } finally {
    initializing.value = null;
  }
};

const toggleModule = async (module: any) => {
  if (toggling.value) return;

  // Validación extra por seguridad
  if (module.requiresDatabase && !module.databaseInitialized) {
    alert('Debes inicializar la base de datos antes de activar este módulo.');
    return;
  }

  const newState = !module.enabled;
  const confirmMsg = newState 
    ? `¿Activar el módulo "${module.name}"?`
    : `¿Desactivar el módulo "${module.name}"? Los usuarios no podrán acceder a él.`;

  if (!confirm(confirmMsg)) return;

  try {
    toggling.value = module.id;
    const token = localStorage.getItem('bytewave_auth_token');

    const response = await fetch(`/api/modules/manage/${module.id}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ enabled: newState })
    }).then(r => r.json());

    if (response.success) {
      module.enabled = newState;
      alert(response.message);
    } else {
      alert(response.message || 'Error al cambiar estado del módulo');
    }
  } catch (error) {
    console.error('Error cambiando estado:', error);
    alert('Error al cambiar estado del módulo');
  } finally {
    toggling.value = null;
  }
};

const clearFilters = () => {
  filters.value = { search: '', status: '', accessLevel: '' };
};

const getAccessLevelClass = (level: string) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    public: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    mixed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  };
  return classes[level as keyof typeof classes] || classes.user;
};

const getAccessLevelText = (level: string) => {
  const texts = {
    admin: 'Admin',
    user: 'Usuario',
    public: 'Público',
    mixed: 'Mixto'
  };
  return texts[level as keyof typeof texts] || level;
};

// Inicialización
onMounted(() => {
  loadModules();
});
</script>

<style scoped>
@import './modules-manager.css';
</style>
