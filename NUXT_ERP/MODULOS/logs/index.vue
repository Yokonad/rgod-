<template>
  <div class="logs-layout">
    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor glassmorphism -->
    <div class="logs-container">
      <!-- Header -->
      <header class="module-header">
        <div class="header-left">
          <button @click="goToDashboard" class="btn-back">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver
          </button>
          <h1>
            <img src="/Icons_svg/document-text.svg" class="title-icon" alt="Logs">
            HISTORIAL DE LOGS
          </h1>
        </div>
        
        <div class="header-right">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-container">
            <label class="theme-switch" for="darkModeToggleLogs" title="Modo oscuro">
              <input type="checkbox" id="darkModeToggleLogs" v-model="isDarkMode">
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
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>TOTAL DE LOGS</h3>
              <p class="stat-number">{{ stats.total.toLocaleString() }}</p>
              <p class="stat-subtitle">Últimos 7 días: {{ stats.last_7days.toLocaleString() }}</p>
            </div>
          </div>

          <div class="stat-card stat-errors">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>ERRORES</h3>
              <p class="stat-number">{{ stats.total_errors }}</p>
              <p class="stat-subtitle">Últimas 24h: {{ stats.last_24h }}</p>
            </div>
          </div>

          <div class="stat-card stat-warnings">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>ADVERTENCIAS</h3>
              <p class="stat-number">{{ stats.total_warnings }}</p>
              <p class="stat-subtitle">Requieren atención</p>
            </div>
          </div>

          <div class="stat-card stat-critical">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>CRÍTICOS</h3>
              <p class="stat-number">{{ stats.critical_events }}</p>
              <p class="stat-subtitle">Atención inmediata</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filters-grid">
            <div class="filter-item filter-search">
              <label>Buscar</label>
              <input 
                type="text" 
                v-model="filters.search" 
                @input="debounceSearch"
                placeholder="Buscar en descripción..."
              >
            </div>
            
            <div class="filter-item">
              <label>Módulo</label>
              <select 
                v-model="filters.module" 
                @change="applyFilters"
              >
                <option value="">Todos</option>
                <option v-for="module in availableFilters.modules" :key="module" :value="module">
                  {{ module }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>Tipo</label>
              <select 
                v-model="filters.event_type" 
                @change="applyFilters"
              >
                <option value="">Todos</option>
                <option v-for="type in availableFilters.event_types" :key="type" :value="type">
                  {{ formatEventType(type) }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>Severidad</label>
              <select 
                v-model="filters.severity" 
                @change="applyFilters"
              >
                <option value="">Todas</option>
                <option v-for="sev in availableFilters.severities" :key="sev" :value="sev">
                  {{ formatSeverity(sev) }}
                </option>
              </select>
            </div>

            <div class="filter-actions">
              <button @click="applyFilters" class="btn-refresh">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Filtrar
              </button>
              
              <button v-if="hasActiveFilters" @click="clearFilters" class="btn-clear">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="logs-table-container">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-500">Cargando logs...</p>
          </div>

          <div v-else-if="logs.length === 0" class="p-12 text-center text-gray-500">
            <svg class="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No se encontraron logs</p>
          </div>

          <div v-else class="overflow-x-auto table-scroll-area">
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Usuario</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Tipo</th>
                  <th>Severidad</th>
                  <th>Descripción</th>
                  <th>IP</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td>{{ formatDate(log.created_at) }}</td>
                  <td>{{ log.user_name || 'Sistema' }}</td>
                  <td>
                    <span class="module-badge">{{ log.module }}</span>
                  </td>
                  <td>{{ log.action }}</td>
                  <td>
                    <span :class="'type-badge type-' + log.event_type">
                      {{ formatEventType(log.event_type) }}
                    </span>
                  </td>
                  <td>
                    <span :class="'severity-badge severity-' + log.severity">
                      {{ formatSeverity(log.severity) }}
                    </span>
                  </td>
                  <td class="description-cell" :title="log.description">{{ log.description || '-' }}</td>
                  <td>{{ log.ip_address || '-' }}</td>
                  <td>
                    <button @click="viewDetails(log)" class="btn-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginación -->
        <div class="mt-4 flex items-center justify-between" v-if="pagination.totalPages > 1">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Mostrando página <span class="font-medium">{{ pagination.page }}</span> de <span class="font-medium">{{ pagination.totalPages }}</span> ({{ pagination.total }} logs)
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="[page === pagination.page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50', 'relative inline-flex items-center px-4 py-2 border text-sm font-medium']"
                >
                  {{ page }}
                </button>
                <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Detalles -->
      <Teleport to="body">
        <div v-if="selectedLog" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>Detalles del Log #{{ selectedLog.id }}</h2>
              <button @click="closeModal" class="modal-close-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="modal-body p-6 space-y-6">
              <!-- Content remains structured but uses new classes via CSS -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Fecha/Hora</p>
                  <p class="text-gray-900 dark:text-white">{{ formatDateFull(selectedLog.created_at) }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Usuario</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedLog.user_name || 'Sistema' }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Módulo</p>
                  <span class="module-badge inline-block px-2 py-1 rounded bg-gray-100 text-sm">{{ selectedLog.module }}</span>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-500">Acción</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedLog.action }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-500">Descripción</p>
                <p class="description-text">{{ selectedLog.description || '-' }}</p>
              </div>

              <div v-if="selectedLog.metadata" class="space-y-2">
                <p class="text-sm font-medium text-gray-500">Metadata</p>
                <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre class="text-xs text-green-400 font-mono">{{ formatJSON(selectedLog.metadata) }}</pre>
                </div>
              </div>

              <div v-if="selectedLog.error_message" class="space-y-2">
                 <p class="text-sm font-medium text-red-500">Error</p>
                 <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p class="text-red-700 dark:text-red-300 font-medium">{{ selectedLog.error_message }}</p>
                    <pre v-if="selectedLog.stack_trace" class="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">{{ selectedLog.stack_trace }}</pre>
                 </div>
              </div>
            </div>
            
            <div class="modal-footer p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button @click="closeModal" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { navigateTo } from '#app';
import { useTheme } from '~/composables/useTheme';

// Interfaces
interface User {
  user_id: number;
  user_name: string;
}

interface AvailableFilters {
  modules: string[];
  event_types: string[];
  severities: string[];
  users: User[];
}

// Composables (auto-importados por Nuxt)
const { isDarkMode } = useTheme();

// Estado
const logs = ref<any[]>([]);
const stats = ref({
  total: 0,
  last_24h: 0,
  last_7days: 0,
  total_errors: 0,
  total_warnings: 0,
  critical_events: 0
});
const availableFilters = ref<AvailableFilters>({
  modules: [],
  event_types: [],
  severities: [],
  users: []
});
const filters = ref({
  module: '',
  event_type: '',
  severity: '',
  user_id: '',
  search: ''
});
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1
});
const loading = ref(false);
const selectedLog = ref<any>(null);
let searchTimeout: any = null;

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.module ||
    filters.value.event_type ||
    filters.value.severity ||
    filters.value.user_id ||
    filters.value.search
  );
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1, total);
    } else if (current >= total - 3) {
      pages.push(1, -1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1, -1);
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push(-1, total);
    }
  }
  
  return pages;
});

// Métodos
const goToDashboard = () => {
  navigateTo('/dashboard');
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const queryParams = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.module && { module: filters.value.module }),
      ...(filters.value.event_type && { event_type: filters.value.event_type }),
      ...(filters.value.severity && { severity: filters.value.severity }),
      ...(filters.value.user_id && { user_id: filters.value.user_id }),
      ...(filters.value.search && { search: filters.value.search })
    });

    const response = await fetch(`/api/modules/logs/list?${queryParams}`);
    const data = await response.json();

    if (data.success) {
      logs.value = data.logs;
      pagination.value = data.pagination;
    } else {
      console.error('Error al cargar logs:', data.message);
    }
  } catch (error) {
    console.error('Error al cargar logs:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const response = await fetch('/api/modules/logs/statistics');
    const data = await response.json();

    if (data.success) {
      stats.value = data.statistics;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
};

const fetchFilters = async () => {
  try {
    const response = await fetch('/api/modules/logs/filters');
    const data = await response.json();

    if (data.success) {
      availableFilters.value = data.filters;
    }
  } catch (error) {
    console.error('Error al cargar filtros:', error);
  }
};

const applyFilters = () => {
  pagination.value.page = 1;
  fetchLogs();
};

const clearFilters = () => {
  filters.value = {
    module: '',
    event_type: '',
    severity: '',
    user_id: '',
    search: ''
  };
  applyFilters();
};

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const refreshLogs = () => {
  fetchLogs();
  fetchStatistics();
};

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  fetchLogs();
};

const viewDetails = (log: any) => {
  selectedLog.value = log;
};

const closeModal = () => {
  selectedLog.value = null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatDateFull = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatEventType = (type: string) => {
  const types: Record<string, string> = {
    create: 'Crear',
    read: 'Leer',
    update: 'Actualizar',
    delete: 'Eliminar',
    auth: 'Autenticación',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información'
  };
  return types[type] || type;
};

const formatSeverity = (severity: string) => {
  const severities: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica'
  };
  return severities[severity] || severity;
};

const formatJSON = (json: any) => {
  try {
    if (typeof json === 'string') {
      return JSON.stringify(JSON.parse(json), null, 2);
    }
    return JSON.stringify(json, null, 2);
  } catch {
    return json;
  }
};

// Lifecycle
onMounted(() => {
  fetchLogs();
  fetchStatistics();
  fetchFilters();
});
</script>

<style src="./logs.css" scoped></style>
