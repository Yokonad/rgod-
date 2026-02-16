<template>
  <div class="facturas-layout">
    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor glassmorphism -->
    <div class="facturas-container">
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
            <img src="/Icons_svg/invoice.svg" class="title-icon" alt="Facturas">
            GESTIÓN DE FACTURAS
          </h1>
        </div>
        <div class="header-right">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-container">
            <label class="theme-switch" for="darkModeToggleFacturas" title="Modo oscuro">
              <input type="checkbox" id="darkModeToggleFacturas" v-model="isDarkMode">
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
        <div class="stat-card stat-emitidas">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>FACTURAS EMITIDAS</h3>
            <p class="stat-number">{{ stats.emitidas.count }}</p>
            <p class="stat-amount">Total: ${{ formatNumber(stats.emitidas.total) }}</p>
            <p class="stat-pending">Pendiente: ${{ formatNumber(stats.emitidas.pending) }}</p>
          </div>
        </div>

        <div class="stat-card stat-recibidas">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>FACTURAS RECIBIDAS</h3>
            <p class="stat-number">{{ stats.recibidas.count }}</p>
            <p class="stat-amount">Total: ${{ formatNumber(stats.recibidas.total) }}</p>
            <p class="stat-pending">Pendiente: ${{ formatNumber(stats.recibidas.pending) }}</p>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="filters-container">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
            <input
              v-model="filters.search"
              @keyup.enter="loadInvoices"
              type="text"
              placeholder="Número, cliente..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="w-40">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="emitida">Emitidas</option>
              <option value="recibida">Recibidas</option>
            </select>
          </div>

          <div class="w-40">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ESTADO</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="cancelada">Cancelada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>

          <button
            @click="loadInvoices"
            class="btn-filtrar px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar
          </button>

          <button
            @click="clearFilters"
            class="btn-limpiar px-4 py-2 rounded-lg transition-colors"
          >
            Limpiar
          </button>

          <button
            @click="openModal()"
            class="btn-nueva-factura px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura
          </button>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Número</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Emisión</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="8" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando facturas...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="invoices.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  <svg class="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay facturas para mostrar</p>
                  <p class="text-sm mt-2">Comienza agregando tu primera factura</p>
                </td>
              </tr>
              <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="font-medium text-gray-900 dark:text-white">{{ invoice.invoice_number }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="invoice.type === 'emitida' ? 'badge-tipo-emitida' : 'badge-tipo-recibida'"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ invoice.type === 'emitida' ? 'Emitida' : 'Recibida' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">{{ invoice.client_name }}</div>
                  <div v-if="invoice.client_rfc" class="text-xs text-gray-500 dark:text-gray-400">{{ invoice.client_rfc }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white truncate max-w-xs">{{ invoice.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="font-semibold text-gray-900 dark:text-white">${{ formatNumber(invoice.total) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(invoice.status)"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ getStatusText(invoice.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(invoice.issue_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openModal(invoice)"
                      class="btn-accion-editar p-2 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="deleteInvoice(invoice.id, invoice.invoice_number)"
                      class="btn-accion-eliminar p-2 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2>
              {{ editingInvoice ? 'EDITAR FACTURA' : 'NUEVA FACTURA' }}
            </h2>
            <button
              @click="closeModal"
              class="modal-close-btn p-2 rounded-lg transition-colors"
            >
              <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <form @submit.prevent="saveInvoice" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">NÚMERO DE FACTURA *</label>
                  <input
                    v-model="form.invoice_number"
                    type="text"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">TIPO *</label>
                  <select
                    v-model="form.type"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="emitida">Emitida</option>
                    <option value="recibida">Recibida</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">CLIENTE/PROVEEDOR *</label>
                  <input
                    v-model="form.client_name"
                    type="text"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">RFC</label>
                  <input
                    v-model="form.client_rfc"
                    type="text"
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 label-modal">DESCRIPCIÓN *</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  required
                  class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">SUBTOTAL *</label>
                  <input
                    v-model.number="form.subtotal"
                    @input="calculateTax"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">IVA (16%) *</label>
                  <input
                    v-model.number="form.tax"
                    @input="calculateTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">TOTAL *</label>
                  <input
                    v-model.number="form.total"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    readonly
                    class="input-total w-full px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">ESTADO *</label>
                  <select
                    v-model="form.status"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">FECHA EMISIÓN *</label>
                  <input
                    v-model="form.issue_date"
                    type="date"
                    required
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1 label-modal">FECHA VENCIMIENTO</label>
                  <input
                    v-model="form.due_date"
                    type="date"
                    class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1 label-modal">NOTAS</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="input-modal w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
              </div>

              <!-- Modal Footer -->
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="modal-btn-cancelar px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="modal-btn-guardar px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ saving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

// Composables de Nuxt
const { user } = useAuth();

// Helper para navegación  
const goToDashboard = () => {
  navigateTo('/dashboard');
};

// Estado
const invoices = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editingInvoice = ref<any>(null);
const errorMessage = ref('');

// Dark mode
const { isDarkMode, toggleDarkMode, initTheme } = useTheme();

const stats = ref({
  emitidas: { count: 0, total: 0, paid: 0, pending: 0 },
  recibidas: { count: 0, total: 0, paid: 0, pending: 0 }
});

const filters = ref({
  search: '',
  type: '',
  status: ''
});

const form = ref({
  invoice_number: '',
  type: '',
  client_name: '',
  client_rfc: '',
  description: '',
  subtotal: 0,
  tax: 0,
  total: 0,
  status: 'pendiente',
  issue_date: '',
  due_date: '',
  notes: ''
});

// Métodos
const loadInvoices = async () => {
  try {
    loading.value = true;
    const queryParams = new URLSearchParams();
    
    if (filters.value.type) queryParams.append('type', filters.value.type);
    if (filters.value.status) queryParams.append('status', filters.value.status);
    if (filters.value.search) queryParams.append('search', filters.value.search);

    const response = await window.fetch(`/api/modules/facturas/list?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.json());

    if (response.success) {
      invoices.value = response.invoices;
    }
  } catch (error) {
    console.error('Error cargando facturas:', error);
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const response = await fetch('/api/modules/facturas/statistics', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.json());

    if (response.success) {
      stats.value = response.statistics;
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
};

const clearFilters = () => {
  filters.value = { search: '', type: '', status: '' };
  loadInvoices();
};

const openModal = (invoice: any = null) => {
  editingInvoice.value = invoice;
  errorMessage.value = '';
  
  if (invoice) {
    form.value = {
      invoice_number: invoice.invoice_number,
      type: invoice.type,
      client_name: invoice.client_name,
      client_rfc: invoice.client_rfc || '',
      description: invoice.description,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date || '',
      notes: invoice.notes || ''
    };
  } else {
    form.value = {
      invoice_number: '',
      type: '',
      client_name: '',
      client_rfc: '',
      description: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'pendiente',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: ''
    };
  }
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingInvoice.value = null;
  errorMessage.value = '';
};

const calculateTax = () => {
  form.value.tax = Number((form.value.subtotal * 0.16).toFixed(2));
  calculateTotal();
};

const calculateTotal = () => {
  form.value.total = Number((form.value.subtotal + form.value.tax).toFixed(2));
};

const saveInvoice = async () => {
  try {
    saving.value = true;
    errorMessage.value = '';

    let url = '/api/modules/facturas/create';
    let method = 'POST';

    if (editingInvoice.value) {
      url = `/api/modules/facturas/${editingInvoice.value.id}/update`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      },
      body: JSON.stringify(form.value)
    }).then(r => r.json());

    if (response.success) {
      closeModal();
      await loadInvoices();
      await loadStatistics();
      alert(response.message);
    } else {
      errorMessage.value = response.message;
    }
  } catch (error: any) {
    console.error('Error guardando factura:', error);
    errorMessage.value = error.data?.message || 'Error al guardar la factura';
  } finally {
    saving.value = false;
  }
};

const deleteInvoice = async (id: number, invoiceNumber: string) => {
  if (!confirm(`¿Estás seguro de eliminar la factura ${invoiceNumber}?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/modules/facturas/${id}/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.json());

    if (response.success) {
      alert('Factura eliminada exitosamente');
      await loadInvoices();
      await loadStatistics();
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error('Error eliminando factura:', error);
    alert('Error al eliminar la factura');
  }
};

// Utilidades
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status: string) => {
  const classes = {
    pendiente: 'badge-estado-pendiente',
    pagada: 'badge-estado-pagada',
    cancelada: 'badge-estado-cancelada',
    vencida: 'badge-estado-vencida'
  };
  return classes[status as keyof typeof classes] || '';
};

const getStatusText = (status: string) => {
  const texts = {
    pendiente: 'Pendiente',
    pagada: 'Pagada',
    cancelada: 'Cancelada',
    vencida: 'Vencida'
  };
  return texts[status as keyof typeof texts] || status;
};

// Inicialización
onMounted(() => {
// Inicializar tema
  // initTheme(); // Ya se inicializa en app.vue
  
  loadInvoices();
  loadStatistics();
});
</script>

<style scoped>
/* ============================================
   IMPORTAR ESTILOS DEL MÓDULO
   Nota: eje-theme.css ya está importado globalmente en main.css
   ============================================ */
@import './Facturas-theme.css';
@import './Facturas-Base.css';
</style>
