<template>
  <div class="trabajadores-layout">
    <!-- Toast Notification -->
    <Transition name="slide-fade">
      <div v-if="showToast" :class="['toast-notification', `toast-${toastType}`]">
        <div class="toast-icon">
          <svg v-if="toastType === 'success'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toastType === 'error'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="toast-message">{{ toastMessage }}</div>
        <button @click="showToast = false" class="toast-close">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor glassmorphism -->
    <div class="trabajadores-container">
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
            <img src="/Icons_svg/users.svg" class="title-icon" alt="Trabajadores">
            GESTIÓN DE TRABAJADORES
          </h1>
        </div>
        <div class="header-right">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-container">
            <label class="theme-switch" for="darkModeToggleTrabajadores" title="Modo oscuro">
              <input type="checkbox" id="darkModeToggleTrabajadores" v-model="isDarkMode">
              <span class="slider">
                <img src="/Icons_svg/sun.svg" class="sun-icon" alt="Modo Día">
                <img src="/Icons_svg/moon.svg" class="moon-icon" alt="Modo Noche">
              </span>
            </label>
          </div>
        </div>
      </header>

      <!-- Tabs -->
      <div class="tabs-container">
        <button 
          :class="['tab-button', { 'tab-active': activeTab === 'list' }]"
          @click="activeTab = 'list'"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Listado
        </button>
        <button 
          :class="['tab-button', { 'tab-active': activeTab === 'import' }]"
          @click="activeTab = 'import'"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Importar Excel
        </button>
      </div>

      <main class="module-content">
        <!-- TAB: LISTADO -->
        <div v-show="activeTab === 'list'">
          <!-- Statistics Cards -->
          <div class="stats-grid">
            <div class="stat-card stat-total">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8zm8 10v-2a4 4 0 00-3-3.87m3.87 0a4 4 0 100-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>TOTAL TRABAJADORES</h3>
                <p class="stat-number">{{ totalTrabajadores }}</p>
                <p class="stat-subtitle">Registrados en el sistema</p>
              </div>
            </div>

            <div class="stat-card stat-active">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>ACTIVOS</h3>
                <p class="stat-number">{{ totalActivos }}</p>
                <p class="stat-subtitle">En planilla activa</p>
              </div>
            </div>

            <div class="stat-card stat-inactive">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>INACTIVOS</h3>
                <p class="stat-number">{{ totalInactivos }}</p>
                <p class="stat-subtitle">Cesados o licencia</p>
              </div>
            </div>
          </div>

          <!-- Filters and Actions -->
          <div class="filters-container">
            <div class="flex flex-wrap gap-4 items-end">
              <!-- Search -->
              <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium mb-1">Buscar</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="DNI, nombre, email..."
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <!-- BOTÓN FILTRAR (Desplegable) -->
              <div class="relative">
                <button 
                  @click="toggleFilters"
                  class="btn-filtrar px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 h-[42px]"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </button>

                <!-- Panel de Filtros (Popover) -->
                <div v-if="showFilters" class="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in-down filters-popover">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-gray-700">Filtros</h3>
                  </div>
                  
                  <div class="space-y-4 mb-6">
                    <!-- Filtro Estado -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado</label>
                      <select v-model="tempFilterEstado" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                        <option value="">Todos</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Cesado">Cesado</option>
                        <option value="Vacaciones">Vacaciones</option>
                        <option value="Licencia">Licencia</option>
                      </select>
                    </div>

                    <!-- Filtro Área -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Área</label>
                      <select v-model="tempFilterArea" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                        <option value="">Todas las áreas</option>
                        <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
                      </select>
                    </div>

                    <!-- Filtro Cargo -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cargo</label>
                      <select v-model="tempFilterCargo" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                        <option value="">Todos los cargos</option>
                        <option v-for="cargo in uniqueCargos" :key="cargo" :value="cargo">{{ cargo }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Footer Actions -->
                  <div class="flex items-center gap-2 pt-3">
                    <button @click="restoreFilters" class="btn-restaurar flex-1 flex justify-center items-center py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors shadow-sm">
                      RESTAURAR
                    </button>
                    <button @click="applyFilters" class="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs font-bold uppercase tracking-wider flex justify-center items-center shadow-sm transition-colors">
                      APLICAR
                    </button>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 ml-auto">
                <button
                  @click="downloadExcel"
                  :disabled="exporting"
                  class="btn-export px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 h-[42px]"
                >
                  <div v-if="exporting" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ exporting ? 'Exportando...' : 'Exportar' }}
                </button>

                <button
                  @click="showCreateModal = true"
                  class="btn-nuevo px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 h-[42px]"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo
                </button>
              </div>
            </div>
          </div>

          <!-- Workers Table -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden trabajadores-table">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Trabajador</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">DNI</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Área</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cargo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Ingreso</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="loading">
                    <td colspan="7" class="px-6 py-12 text-center">
                      <div class="flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-3">Cargando trabajadores...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="filteredTrabajadores.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center">
                      <p>No se encontraron trabajadores</p>
                    </td>
                  </tr>
                  <tr v-for="trabajador in filteredTrabajadores" :key="trabajador.id" class="transition-colors hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full avatar-initials text-white font-semibold">
                          {{ trabajador.nombres.charAt(0) }}{{ trabajador.apellido_paterno.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-medium">{{ trabajador.nombre_completo }}</div>
                          <div class="text-sm text-gray-500">{{ trabajador.email || 'Sin email' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {{ trabajador.dni }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        v-if="trabajador.area_nombre" 
                        class="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1"
                        :style="{ backgroundColor: trabajador.area_color + '20', color: trabajador.area_color, border: '1px solid ' + trabajador.area_color }"
                      >
                        {{ trabajador.area_nombre }}
                      </span>
                      <span v-else class="text-xs text-gray-400">Sin área</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      {{ trabajador.cargo || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      {{ formatDate(trabajador.fecha_ingreso) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getEstadoBadge(trabajador.estado)">
                        {{ trabajador.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="openDocumentsModal(trabajador)"
                          class="btn-accion-documentos p-2 rounded-lg transition-colors"
                          title="Gestionar documentos"
                        >
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          @click="openEditModal(trabajador)"
                          class="btn-accion-editar p-2 rounded-lg transition-colors"
                          title="Editar trabajador"
                        >
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          @click="confirmDelete(trabajador)"
                          class="btn-accion-eliminar p-2 rounded-lg transition-colors"
                          title="Eliminar trabajador"
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
        </div>

        <!-- TAB: IMPORTAR EXCEL -->
        <div v-show="activeTab === 'import'" class="import-section">
          <div class="import-card">
            <h2 class="text-2xl font-bold mb-6">Importación Masiva de Trabajadores</h2>
            
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Descargar Plantilla</h3>
                  <p>Descarga la plantilla Excel con el formato requerido</p>
                  <button @click="downloadTemplate" :disabled="downloadingTemplate" class="btn-download">
                    <div v-if="downloadingTemplate" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ downloadingTemplate ? 'Descargando...' : 'Descargar Plantilla' }}
                  </button>
                </div>
              </div>

              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Completar Datos</h3>
                  <p>Rellena la plantilla con los datos de los trabajadores</p>
                  <ul class="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• DNI (8 dígitos), Nombre Completo y Estado son obligatorios</li>
                    <li>• Nombre Completo: Escribe apellidos y nombres en una sola celda</li>
                    <li>• Estado debe ser: Activo o Cesado</li>
                    <li>• Cargo es opcional</li>
                  </ul>
                </div>
              </div>

              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>Subir Archivo</h3>
                  <p>Selecciona el archivo Excel completado y súbelo</p>
                  
                  <div class="upload-area" :class="{ 'dragging': dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="handleDrop">
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".xlsx,.xls"
                      @change="handleFileSelect"
                      class="hidden"
                    />
                    <div v-if="!selectedFile" class="upload-placeholder" @click="$refs.fileInput.click()">
                      <svg class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="text-sm text-gray-600">Arrastra el archivo aquí o haz clic para seleccionar</p>
                      <p class="text-xs text-gray-400 mt-1">Solo archivos .xlsx o .xls</p>
                    </div>
                    <div v-else class="upload-file-info">
                      <svg class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p class="font-medium">{{ selectedFile.name }}</p>
                      <p class="text-sm text-gray-500">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
                      <button @click="selectedFile = null" class="text-red-600 hover:text-red-700 text-sm mt-2">Cambiar archivo</button>
                    </div>
                  </div>

                  <button
                    v-if="selectedFile"
                    @click="importExcel"
                    :disabled="importing"
                    class="btn-import mt-4"
                  >
                    <div v-if="importing" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {{ importing ? 'Importando...' : 'Importar Trabajadores' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Resultados de Importación -->
            <div v-if="importResults" class="import-results mt-6">
              <div class="result-summary" :class="{ 'has-errors': importResults.errors && importResults.errors.length > 0 }">
                <h3 class="font-bold text-lg mb-2">Resultados de Importación</h3>
                <p class="text-sm">
                  <span class="font-semibold text-green-600">{{ importResults.imported || 0 }}</span> de 
                  <span class="font-semibold">{{ importResults.total || 0 }}</span> registros importados correctamente
                </p>
              </div>
              
              <div v-if="importResults.errors && importResults.errors.length > 0" class="errors-list mt-4">
                <h4 class="font-semibold text-red-600 mb-2">Errores encontrados:</h4>
                <div class="max-h-60 overflow-y-auto">
                  <div v-for="(error, index) in importResults.errors" :key="index" class="error-item">
                    <span class="font-mono text-sm">Fila {{ error.row }}</span>
                    <span v-if="error.dni" class="font-mono text-xs">(DNI: {{ error.dni }})</span>
                    <span class="text-sm">{{ error.error }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- CREATE Modal - Nuevo Diseño -->
      <div v-if="showCreateModal" class="modal-overlay-new" @click.self="closeModal">
        <div class="modal-container-new">
          <div class="modal-header-new">
            <div class="header-title-section">
              <h2 class="modal-title-new">INGRESO DEL PERSONAL - EJE SOLUCIONES</h2>
              <p class="modal-subtitle-new">Este formulario tiene como objetivo recopilar la información básica necesaria para el registro de un nuevo trabajador en la empresa. Es obligatorio para el ingreso y el primer paso para el registro del mismo.</p>
            </div>
            <button @click="closeModal" class="btn-close-new">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="modal-body-new">
            <form @submit.prevent="saveTrabajador" class="form-new">
              <!-- Apellidos y Nombres -->
              <div class="form-field-new">
                <label class="form-label-new">
                  APELLIDOS Y NOMBRES DEL TRABAJADOR INGRESANTE
                  <span class="required">*</span>
                </label>
                <input 
                  v-model="formData.nombre_completo" 
                  type="text" 
                  class="form-input-new" 
                  placeholder="Apellido Paterno Apellido Materno, Nombres"
                  required 
                />
              </div>

              <!-- DNI/CE -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">
                    DNI/CE
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.dni" 
                    type="text" 
                    class="form-input-new" 
                    placeholder="12345678"
                    maxlength="12"
                    required 
                  />
                </div>

                <!-- Email -->
                <div class="form-field-new">
                  <label class="form-label-new">Email</label>
                  <input 
                    v-model="formData.email" 
                    type="email" 
                    class="form-input-new" 
                    placeholder="ejemplo@ejemplo.com"
                  />
                </div>
              </div>

              <!-- Teléfono y Sistema de Pensiones -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">Número de teléfono</label>
                  <input 
                    v-model="formData.telefono" 
                    type="tel" 
                    class="form-input-new" 
                    placeholder="000-000-000"
                  />
                  <p class="form-hint-new">Favor ingrese un número de teléfono válido.</p>
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">SISTEMA DE PENSIONES</label>
                  <select v-model="formData.sistema_pensiones" class="form-input-new">
                    <option value="">Seleccionar</option>
                    <option value="AFP">AFP</option>
                    <option value="ONP">ONP</option>
                  </select>
                </div>
              </div>

              <!-- Fecha de Nacimiento y Lugar -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">
                    FECHA DE NACIMIENTO
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.fecha_nacimiento" 
                    type="date" 
                    class="form-input-new" 
                    required 
                  />
                  <p class="form-hint-new">DD-MM-AAAA</p>
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">
                    LUGAR DE NACIMIENTO
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.lugar_nacimiento" 
                    type="text" 
                    class="form-input-new" 
                    placeholder="Ciudad, Departamento"
                    required 
                  />
                </div>
              </div>

              <!-- Suba su DNI -->
              <div class="form-field-new">
                <label class="form-label-new">
                  SUBA UNA FOTO DE SU DNI - AMBOS LADOS
                  <span class="required">*</span>
                </label>
                <div class="file-upload-area" @drop.prevent="handleFileDrop($event, 'dni')" @dragover.prevent>
                  <input 
                    type="file" 
                    ref="dniFileInput" 
                    @change="handleFileUpload($event, 'dni')" 
                    accept="image/*,application/pdf"
                    multiple
                    class="file-input-hidden"
                  />
                  <div class="file-upload-content" @click="$refs.dniFileInput.click()">
                    <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="file-upload-text">Arrastre y suelte archivos aquí</p>
                    <p class="file-upload-subtext">o haga clic para seleccionar</p>
                  </div>
                  <div v-if="uploadedFiles.dni && uploadedFiles.dni.length" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.dni" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button type="button" @click.stop="removeFile('dni', idx)" class="btn-remove-file">×</button>
                    </div>
                  </div>
                </div>
                <p class="form-warning-new">EL DNI DEBE ESTAR LO MAS LEGIBLE POSIBLE, DE OTRA MANERA SE RECHAZARÁ EL ENVÍO</p>
              </div>

              <!-- Suba su CV -->
              <div class="form-field-new">
                <label class="form-label-new">SUBA SU CV DOCUMENTADO</label>
                <div class="file-upload-area" @drop.prevent="handleFileDrop($event, 'cv')" @dragover.prevent>
                  <input 
                    type="file" 
                    ref="cvFileInput" 
                    @change="handleFileUpload($event, 'cv')" 
                    accept=".pdf,.doc,.docx"
                    class="file-input-hidden"
                  />
                  <div class="file-upload-content" @click="$refs.cvFileInput.click()">
                    <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="file-upload-text">Arrastre y suelte archivos aquí</p>
                    <p class="file-upload-subtext">o haga clic para seleccionar</p>
                  </div>
                  <div v-if="uploadedFiles.cv && uploadedFiles.cv.length" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.cv" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button type="button" @click.stop="removeFile('cv', idx)" class="btn-remove-file">×</button>
                    </div>
                  </div>
                </div>
                <p class="form-info-new">
                  EN CASO DE NO TENER UN CV AQUI UN FORMATO DE CV PARA MODIFICAR Y ENVIAR<br>
                  <a href="https://docs.google.com/document/d/1n3xEalZ0NZHgRv6ELyMq-ng8kPu2R64E/edit?usp=drive_link&ouid=114849853711192767550&rtpof=true&sd=true" target="_blank" class="form-link-new">LINK DE CV DE EJEMPLO</a>
                </p>
              </div>

              <!-- Certificado Único Laboral -->
              <div class="form-field-new">
                <label class="form-label-new">
                  SUBA SU CERTIFICADO ÚNICO LABORAL
                  <span class="required">*</span>
                </label>
                <div class="file-upload-area" @drop.prevent="handleFileDrop($event, 'certificado')" @dragover.prevent>
                  <input 
                    type="file" 
                    ref="certificadoFileInput" 
                    @change="handleFileUpload($event, 'certificado')" 
                    accept=".pdf,image/*"
                    class="file-input-hidden"
                  />
                  <div class="file-upload-content" @click="$refs.certificadoFileInput.click()">
                    <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="file-upload-text">Arrastre y suelte archivos aquí</p>
                    <p class="file-upload-subtext">o haga clic para seleccionar</p>
                  </div>
                  <div v-if="uploadedFiles.certificado && uploadedFiles.certificado.length" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.certificado" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button type="button" @click.stop="removeFile('certificado', idx)" class="btn-remove-file">×</button>
                    </div>
                  </div>
                </div>
                <div class="form-info-new">
                  <p><strong>GUÍA DE COMO OBTENER SU CERTIFICADO ÚNICO LABORAL:</strong></p>
                  <a href="https://www.youtube.com/watch?v=wqRbrYOdHRY" target="_blank" class="form-link-new">VIDEO TUTORIAL</a><br>
                  <a href="https://www.empleosperu.gob.pe/CertificadoUnicoLaboral/irIndex.html" target="_blank" class="form-link-new">LINK DE PÁGINA PARA OBTENER CERTIADULTO O CERTIJOVEN</a>
                  <p class="mt-2">EN CASO DE QUE EN EL CERTIFICADO NO SE LOGRE VISUALIZAR LOS ANTECEDENTES POLICIALES Y PENALES DESPUÉS DE VARIOS INTENTOS ESCRIBA UN WHATSAPP AL SIGUIENTE NÚMERO <strong>968 467 840</strong></p>
                </div>
              </div>

              <!-- Firma Escaneada -->
              <div class="form-field-new">
                <label class="form-label-new">
                  SUBIR FIRMA ESCANEADA
                  <span class="required">*</span>
                </label>
                <div class="file-upload-area" @drop.prevent="handleFileDrop($event, 'firma')" @dragover.prevent>
                  <input 
                    type="file" 
                    ref="firmaFileInput" 
                    @change="handleFileUpload($event, 'firma')" 
                    accept="image/*"
                    class="file-input-hidden"
                  />
                  <div class="file-upload-content" @click="$refs.firmaFileInput.click()">
                    <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="file-upload-text">Arrastre y suelte archivos aquí</p>
                    <p class="file-upload-subtext">o haga clic para seleccionar</p>
                  </div>
                  <div v-if="uploadedFiles.firma && uploadedFiles.firma.length" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.firma" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button type="button" @click.stop="removeFile('firma', idx)" class="btn-remove-file">×</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Foto del Empleado -->
              <div class="form-field-new">
                <label class="form-label-new">
                  SUBA UNA FOTO
                  <span class="required">*</span>
                </label>
                <div class="file-upload-area" @drop.prevent="handleFileDrop($event, 'foto')" @dragover.prevent>
                  <input 
                    type="file" 
                    ref="fotoFileInput" 
                    @change="handleFileUpload($event, 'foto')" 
                    accept="image/*"
                    class="file-input-hidden"
                  />
                  <div class="file-upload-content" @click="$refs.fotoFileInput.click()">
                    <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p class="file-upload-text">Arrastre y suelte archivos aquí</p>
                    <p class="file-upload-subtext">o haga clic para seleccionar</p>
                  </div>
                  <div v-if="uploadedFiles.foto && uploadedFiles.foto.length" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.foto" :key="idx" class="uploaded-file-item">
                      <img v-if="getFilePreview(uploadedFiles.foto[idx])" :src="getFilePreview(uploadedFiles.foto[idx])" class="file-preview-thumb" />
                      <span>{{ file.name }}</span>
                      <button type="button" @click.stop="removeFile('foto', idx)" class="btn-remove-file">×</button>
                    </div>
                  </div>
                </div>
                <p class="form-info-new">
                  Cargue una fotografía reciente del empleado, preferentemente en formato JPEG o PNG. La imagen debe ser de buena calidad y en un fondo neutro.
                </p>
              </div>

              <!-- Botones de acción -->
              <div class="modal-footer-new">
                <button type="button" @click="closeModal" class="btn-cancel-new">Cancelar</button>
                <button type="submit" :disabled="saving" class="btn-save-new">
                  <div v-if="saving" class="spinner-new"></div>
                  <span v-else>Registrar Trabajador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- EDIT Modal - Nuevo Diseño -->
      <div v-else-if="showEditModal" class="modal-overlay-new" @click.self="closeModal">
        <div class="modal-container-new">
          <div class="modal-header-new">
            <div class="header-title-section">
              <h2 class="modal-title-new">EDITAR DATOS DEL TRABAJADOR</h2>
              <p class="modal-subtitle-new">Actualiza la información del trabajador. Los campos marcados con asterisco (*) son obligatorios.</p>
            </div>
            <button @click="closeModal" class="btn-close-new">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="modal-body-new">
            <form @submit.prevent="saveTrabajador" class="form-new">
              <!-- Apellidos y Nombres -->
              <div class="form-field-new">
                <label class="form-label-new">
                  APELLIDOS Y NOMBRES DEL TRABAJADOR
                  <span class="required">*</span>
                </label>
                <input 
                  v-model="formData.nombre_completo" 
                  type="text" 
                  class="form-input-new" 
                  placeholder="Apellido Paterno Apellido Materno, Nombres"
                  required 
                />
              </div>

              <!-- DNI/CE y Email -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">
                    DNI/CE
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.dni" 
                    type="text" 
                    class="form-input-new" 
                    placeholder="12345678"
                    maxlength="12"
                    required 
                  />
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">Email</label>
                  <input 
                    v-model="formData.email" 
                    type="email" 
                    class="form-input-new" 
                    placeholder="ejemplo@ejemplo.com"
                  />
                </div>
              </div>

              <!-- Teléfono y Sistema de Pensiones -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">Número de teléfono</label>
                  <input 
                    v-model="formData.telefono" 
                    type="tel" 
                    class="form-input-new" 
                    placeholder="000-000-000"
                  />
                  <p class="form-hint-new">Favor ingrese un número de teléfono válido.</p>
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">SISTEMA DE PENSIONES</label>
                  <select v-model="formData.sistema_pensiones" class="form-input-new">
                    <option value="">Seleccionar</option>
                    <option value="AFP">AFP</option>
                    <option value="ONP">ONP</option>
                  </select>
                </div>
              </div>

              <!-- Fecha de Nacimiento y Lugar -->
              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">
                    FECHA DE NACIMIENTO
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.fecha_nacimiento" 
                    type="date" 
                    class="form-input-new" 
                    required 
                  />
                  <p class="form-hint-new">DD-MM-AAAA</p>
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">
                    LUGAR DE NACIMIENTO
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.lugar_nacimiento" 
                    type="text" 
                    class="form-input-new" 
                    placeholder="Ciudad, Departamento"
                    required 
                  />
                </div>
              </div>



              <!-- DATOS LABORALES -->
              <div class="form-section-divider">
                <h3 class="form-section-title-new">DATOS LABORALES</h3>
              </div>

              <div class="form-row-new">
                <div class="form-field-new">
                  <label class="form-label-new">
                    FECHA DE INGRESO
                    <span class="required">*</span>
                  </label>
                  <input 
                    v-model="formData.fecha_ingreso" 
                    type="date" 
                    class="form-input-new" 
                    required 
                  />
                </div>

                <div class="form-field-new">
                  <label class="form-label-new">CARGO</label>
                  <input 
                    v-model="formData.cargo" 
                    type="text" 
                    class="form-input-new"
                    placeholder="Ej: Ingeniero, Administrador, etc."
                  />
                </div>
              </div>

              <div class="form-field-new">
                <label class="form-label-new">ESTADO</label>
                <select v-model="formData.estado" class="form-input-new">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Cesado">Cesado</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Licencia">Licencia</option>
                </select>
              </div>



              <!-- Documentos Actuales (Solo lectura/visualización) -->
              <div class="form-section-divider">
                <h3 class="form-section-title-new">DOCUMENTOS ADJUNTOS</h3>
              </div>

              <div class="form-info-new">
                <p><strong>Nota:</strong> Para actualizar los documentos del trabajador (DNI, CV, certificados, etc.), utilice la opción de gestión de documentos desde el listado principal.</p>
              </div>

              <!-- Botones de acción -->
              <div class="modal-footer-new">
                <button type="button" @click="closeModal" class="btn-cancel-new">Cancelar</button>
                <button type="submit" :disabled="saving" class="btn-save-new">
                  <div v-if="saving" class="spinner-new"></div>
                  <span v-else>Actualizar Trabajador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Gestión de Documentos -->
      <div v-if="showDocumentsModal" class="modal-overlay-new" @click.self="closeDocumentsModal">
        <div class="modal-container-new" style="max-width: 900px;">
          <div class="modal-header-new">
            <div class="header-title-section">
              <h2 class="modal-title-new">GESTIÓN DE DOCUMENTOS</h2>
              <p class="modal-subtitle-new">
                Trabajador: <strong>{{ selectedTrabajador?.nombre_completo || 'N/A' }}</strong>
              </p>
            </div>
            <button @click="closeDocumentsModal" class="btn-close-new">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body-new">
            <!-- Lista de documentos existentes -->
            <div class="documents-list-section">
              <h3 class="section-title-docs">Documentos Actuales</h3>
              
              <div v-if="loadingDocuments" class="flex items-center justify-center py-8">
                <div class="spinner-new"></div>
                <span class="ml-3">Cargando documentos...</span>
              </div>

              <div v-else-if="trabajadorDocuments.length === 0" class="empty-documents">
                <svg class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-gray-500">No hay documentos cargados para este trabajador</p>
              </div>

              <div v-else class="documents-grid">
                <div v-for="doc in trabajadorDocuments" :key="doc.id" class="document-card">
                  <div class="document-icon">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="document-info">
                    <h4 class="document-type">{{ doc.tipo_documento }}</h4>
                    <p class="document-name">{{ doc.nombre_archivo }}</p>
                    <p class="document-date">{{ formatDate(doc.fecha_subida) }}</p>
                  </div>
                  <div class="document-actions">
                    <a :href="`/${doc.ruta_archivo}`" target="_blank" class="btn-doc-view" title="Ver documento">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    <button @click="confirmDeleteDocument(doc)" class="btn-doc-delete" title="Eliminar documento">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario para subir nuevos documentos -->
            <div class="upload-documents-section">
              <h3 class="section-title-docs">Subir Nuevos Documentos</h3>
              
              <div class="upload-grid">
                <!-- DNI -->
                <div class="upload-field">
                  <label class="upload-label">DNI (ambos lados)</label>
                  <input 
                    type="file" 
                    @change="handleFileChange($event, 'dni')" 
                    accept="image/*,application/pdf"
                    multiple
                    class="file-input-hidden"
                    :id="'upload-dni-' + selectedTrabajador?.id"
                  />
                  <label :for="'upload-dni-' + selectedTrabajador?.id" class="file-upload-button">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar archivos
                  </label>
                  <div v-if="uploadedFiles.dni?.length > 0" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.dni" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button @click="removeFile('dni', idx)" class="remove-file-btn">×</button>
                    </div>
                  </div>
                </div>

                <!-- CV -->
                <div class="upload-field">
                  <label class="upload-label">Currículum Vitae</label>
                  <input 
                    type="file" 
                    @change="handleFileChange($event, 'cv')" 
                    accept="image/*,application/pdf"
                    multiple
                    class="file-input-hidden"
                    :id="'upload-cv-' + selectedTrabajador?.id"
                  />
                  <label :for="'upload-cv-' + selectedTrabajador?.id" class="file-upload-button">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar archivos
                  </label>
                  <div v-if="uploadedFiles.cv?.length > 0" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.cv" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button @click="removeFile('cv', idx)" class="remove-file-btn">×</button>
                    </div>
                  </div>
                </div>

                <!-- Certificado -->
                <div class="upload-field">
                  <label class="upload-label">Certificado Único Laboral</label>
                  <input 
                    type="file" 
                    @change="handleFileChange($event, 'certificado')" 
                    accept="image/*,application/pdf"
                    multiple
                    class="file-input-hidden"
                    :id="'upload-cert-' + selectedTrabajador?.id"
                  />
                  <label :for="'upload-cert-' + selectedTrabajador?.id" class="file-upload-button">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar archivos
                  </label>
                  <div v-if="uploadedFiles.certificado?.length > 0" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.certificado" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button @click="removeFile('certificado', idx)" class="remove-file-btn">×</button>
                    </div>
                  </div>
                </div>

                <!-- Firma -->
                <div class="upload-field">
                  <label class="upload-label">Firma Escaneada</label>
                  <input 
                    type="file" 
                    @change="handleFileChange($event, 'firma')" 
                    accept="image/*"
                    class="file-input-hidden"
                    :id="'upload-firma-' + selectedTrabajador?.id"
                  />
                  <label :for="'upload-firma-' + selectedTrabajador?.id" class="file-upload-button">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar archivo
                  </label>
                  <div v-if="uploadedFiles.firma?.length > 0" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.firma" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button @click="removeFile('firma', idx)" class="remove-file-btn">×</button>
                    </div>
                  </div>
                </div>

                <!-- Foto -->
                <div class="upload-field">
                  <label class="upload-label">Foto del Trabajador</label>
                  <input 
                    type="file" 
                    @change="handleFileChange($event, 'foto')" 
                    accept="image/*"
                    class="file-input-hidden"
                    :id="'upload-foto-' + selectedTrabajador?.id"
                  />
                  <label :for="'upload-foto-' + selectedTrabajador?.id" class="file-upload-button">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar archivo
                  </label>
                  <div v-if="uploadedFiles.foto?.length > 0" class="uploaded-files-list">
                    <div v-for="(file, idx) in uploadedFiles.foto" :key="idx" class="uploaded-file-item">
                      <span>{{ file.name }}</span>
                      <button @click="removeFile('foto', idx)" class="remove-file-btn">×</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer-new" style="margin-top: 24px;">
                <button type="button" @click="closeDocumentsModal" class="btn-cancel-new">Cerrar</button>
                <button 
                  type="button" 
                  @click="uploadNewDocuments" 
                  :disabled="uploadingDocuments || !hasFilesToUpload"
                  class="btn-save-new"
                >
                  <div v-if="uploadingDocuments" class="spinner-new"></div>
                  <span v-else>Subir Documentos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '~/composables/useTheme'

const router = useRouter()

// Dark Mode
const { isDarkMode } = useTheme()

// State
const activeTab = ref('list')
const trabajadores = ref([])
const areas = ref([])
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const downloadingTemplate = ref(false)
const exporting = ref(false)

// Toast notifications
const toastMessage = ref('')
const toastType = ref('success') // 'success' | 'error' | 'info'
const showToast = ref(false)

// Filters
const searchQuery = ref('')
const filterEstado = ref('')
const filterArea = ref('')
const filterCargo = ref('')
// Temp filters for deferred application
const tempFilterEstado = ref('')
const tempFilterArea = ref('')
const tempFilterCargo = ref('')

const showFilters = ref(false) // Toggle para popover

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDocumentsModal = ref(false)
const editingId = ref(null)
const selectedTrabajador = ref(null)
const trabajadorDocuments = ref([])
const loadingDocuments = ref(false)
const uploadingDocuments = ref(false)

// Form Data
const formData = ref({
  nombre_completo: '',
  dni: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  fecha_nacimiento: '',
  lugar_nacimiento: '',
  sistema_pensiones: '',
  sexo: '',
  estado_civil: '',
  telefono: '',
  email: '',
  direccion: '',
  distrito: '',
  provincia: '',
  departamento: '',
  fecha_ingreso: '',
  fecha_cese: '',
  area_id: '',
  cargo: '',
  tipo_contrato: '',
  regimen_laboral: '',
  salario_base: null,
  estado: 'Activo',
  contacto_emergencia_nombre: '',
  contacto_emergencia_parentesco: '',
  contacto_emergencia_telefono: ''
})

// Archivos subidos
const uploadedFiles = ref({
  dni: [],
  cv: [],
  certificado: [],
  firma: [],
  foto: []
})

// Referencias de inputs de archivo
const dniFileInput = ref(null)
const cvFileInput = ref(null)
const certificadoFileInput = ref(null)
const firmaFileInput = ref(null)
const fotoFileInput = ref(null)

// Import
const selectedFile = ref(null)
const dragging = ref(false)
const importResults = ref(null)
const fileInput = ref(null)

// Computed
const uniqueCargos = computed(() => {
  const cargos = trabajadores.value
    .map(t => t.cargo)
    .filter(c => c && c.trim() !== '') // Filtrar vacíos
  return [...new Set(cargos)].sort() // Únicos y ordenados
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterEstado.value) count++
  if (filterArea.value) count++
  if (filterCargo.value) count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

// Methods for deferred filtering
const toggleFilters = () => {
  if (!showFilters.value) {
    // Opening: Sync temp with real
    tempFilterEstado.value = filterEstado.value
    tempFilterArea.value = filterArea.value
    tempFilterCargo.value = filterCargo.value
  }
  showFilters.value = !showFilters.value
}

const restoreFilters = () => {
  tempFilterEstado.value = ''
  tempFilterArea.value = ''
  tempFilterCargo.value = ''
  // Standard UX: Restore usually clears the form but user must click Apply to commit.
  // User asked for "Restaurar que deje todo como estaba antes" (which could mean Reset to Initial/Empty or Reset to Last Applied?)
  // User said "boton limpiar todo no sirve, cambiar a Restaurar". Usually implies Resetting the form.
}

const applyFilters = () => {
  filterEstado.value = tempFilterEstado.value
  filterArea.value = tempFilterArea.value
  filterCargo.value = tempFilterCargo.value
  showFilters.value = false
}

const filteredTrabajadores = computed(() => {
  // Asegurar que trabajadores sea un array
  if (!Array.isArray(trabajadores.value)) {
    return []
  }

  return trabajadores.value.filter(trabajador => {
    // Search Filter
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      trabajador.nombres.toLowerCase().includes(searchLower) ||
      trabajador.apellido_paterno.toLowerCase().includes(searchLower) ||
      trabajador.apellido_materno.toLowerCase().includes(searchLower) ||
      trabajador.dni.includes(searchLower) ||
      (trabajador.email && trabajador.email.toLowerCase().includes(searchLower))

    // Estado Filter
    const matchesEstado = !filterEstado.value || trabajador.estado === filterEstado.value

    // Área Filter
    const matchesArea = !filterArea.value || trabajador.area_id === filterArea.value

    // Cargo Filter
    const matchesCargo = !filterCargo.value || trabajador.cargo === filterCargo.value

    return matchesSearch && matchesEstado && matchesArea && matchesCargo
  })
})

// Stats computed
const totalTrabajadores = computed(() => {
  return Array.isArray(trabajadores.value) ? trabajadores.value.length : 0
})

const totalActivos = computed(() => {
  if (!Array.isArray(trabajadores.value)) return 0
  return trabajadores.value.filter(t => t.estado === 'Activo').length
})

const totalInactivos = computed(() => {
  if (!Array.isArray(trabajadores.value)) return 0
  return trabajadores.value.filter(t => t.estado !== 'Activo').length
})

// Lifecycle
onMounted(() => {
  loadData()
  // Theme managed by useTheme
})

// Watch dark mode
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})

// Methods
async function loadData() {
  loading.value = true
  try {
    const [trabajadoresRes, areasRes] = await Promise.all([
      window.fetch('/api/modules/trabajadoresbtw/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
        }
      }).then(r => r.json()),
      window.fetch('/api/areas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
        }
      }).then(r => r.json())
    ])
    
    // Manejar respuesta de trabajadores (puede ser array directo o objeto)
    if (Array.isArray(trabajadoresRes)) {
      trabajadores.value = trabajadoresRes
    } else if (trabajadoresRes && Array.isArray(trabajadoresRes.workers)) {
      trabajadores.value = trabajadoresRes.workers
    } else if (trabajadoresRes && Array.isArray(trabajadoresRes.trabajadores)) {
      trabajadores.value = trabajadoresRes.trabajadores
    } else {
      trabajadores.value = []
    }
    
    // Manejar respuesta de áreas (objeto con propiedad areas)
    if (Array.isArray(areasRes)) {
      areas.value = areasRes
    } else if (areasRes && Array.isArray(areasRes.areas)) {
      areas.value = areasRes.areas
    } else {
      areas.value = []
    }
  } catch (error) {
    console.error('Error loading data:', error)
    // Establecer arrays vacíos en caso de error
    trabajadores.value = []
    areas.value = []
    alert('Error al cargar datos: ' + (error.message || 'Error desconocido'))
  } finally {
    loading.value = false
  }
}

function goToDashboard() {
  router.push('/dashboard')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function getEstadoBadge(estado) {
  // Retorna las clases semánticas definidas en trabajadores.css
  // Se asume que estado viene capitalizado (Activo, Cesado, etc.)
  const estadoNormalizado = estado ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase() : 'Inactivo'
  return `badge-trabajador badge-trabajador-${estadoNormalizado}`
}

function resetForm() {
  formData.value = {
    dni: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_civil: '',
    telefono: '',
    email: '',
    direccion: '',
    distrito: '',
    provincia: '',
    departamento: '',
    fecha_ingreso: '',
    fecha_cese: '',
    area_id: '',
    cargo: '',
    tipo_contrato: '',
    regimen_laboral: '',
    salario_base: null,
    estado: 'Activo',
    contacto_emergencia_nombre: '',
    contacto_emergencia_parentesco: '',
    contacto_emergencia_telefono: ''
  }
}

// Funciones para manejo de archivos
function handleFileUpload(event, fileType) {
  const files = Array.from(event.target.files)
  if (!uploadedFiles.value[fileType]) {
    uploadedFiles.value[fileType] = []
  }
  uploadedFiles.value[fileType].push(...files)
}

function handleFileDrop(event, fileType) {
  const files = Array.from(event.dataTransfer.files)
  if (!uploadedFiles.value[fileType]) {
    uploadedFiles.value[fileType] = []
  }
  uploadedFiles.value[fileType].push(...files)
}

function removeFile(fileType, index) {
  uploadedFiles.value[fileType].splice(index, 1)
}

function getFilePreview(file) {
  if (file && file.type && file.type.startsWith('image/')) {
    return URL.createObjectURL(file)
  }
  return null
}

// Subir archivos al servidor
async function uploadFilesToServer(trabajadorId) {
  const formData = new FormData()
  
  // Agregar el ID del trabajador
  formData.append('trabajador_id', trabajadorId.toString())
  
  // Agregar archivos por categoría
  for (const [fileType, files] of Object.entries(uploadedFiles.value)) {
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append(fileType, file)
      }
    }
  }
  
  // Enviar al servidor
  const response = await window.fetch('/api/modules/trabajadoresbtw/upload-files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
    },
    body: formData
  }).then(r => r.json())
  
  return response
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  resetForm()
  // Limpiar archivos subidos
  uploadedFiles.value = {
    dni: [],
    cv: [],
    certificado: [],
    firma: [],
    foto: []
  }
}

function openEditModal(trabajador) {
  editingId.value = trabajador.id
  Object.keys(formData.value).forEach(key => {
    formData.value[key] = trabajador[key] ?? formData.value[key]
  })
  
  // Si no tiene nombre_completo, construirlo desde los otros campos
  if (!formData.value.nombre_completo && formData.value.apellido_paterno && formData.value.nombres) {
    formData.value.nombre_completo = `${formData.value.apellido_paterno} ${formData.value.apellido_materno || ''}, ${formData.value.nombres}`.trim()
  }
  
  showEditModal.value = true
}

// Gestión de documentos
async function openDocumentsModal(trabajador) {
  selectedTrabajador.value = trabajador
  showDocumentsModal.value = true
  
  // Limpiar archivos subidos previos
  uploadedFiles.value = {
    dni: [],
    cv: [],
    certificado: [],
    firma: [],
    foto: []
  }
  
  // Cargar documentos existentes
  await loadTrabajadorDocuments(trabajador.id)
}

function closeDocumentsModal() {
  showDocumentsModal.value = false
  selectedTrabajador.value = null
  trabajadorDocuments.value = []
  uploadedFiles.value = {
    dni: [],
    cv: [],
    certificado: [],
    firma: [],
    foto: []
  }
}

async function loadTrabajadorDocuments(trabajadorId) {
  loadingDocuments.value = true
  try {
    const response = await window.fetch(`/api/modules/trabajadoresbtw/${trabajadorId}/documents`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.json())
    trabajadorDocuments.value = response.documents || []
  } catch (error) {
    console.error('Error loading documents:', error)
    trabajadorDocuments.value = []
  } finally {
    loadingDocuments.value = false
  }
}

const hasFilesToUpload = computed(() => {
  return Object.values(uploadedFiles.value).some(files => files && files.length > 0)
})

async function uploadNewDocuments() {
  if (!selectedTrabajador.value?.id) return
  
  uploadingDocuments.value = true
  try {
    await uploadFilesToServer(selectedTrabajador.value.id)
    alert('Documentos subidos correctamente')
    
    // Recargar documentos
    await loadTrabajadorDocuments(selectedTrabajador.value.id)
    
    // Limpiar archivos
    uploadedFiles.value = {
      dni: [],
      cv: [],
      certificado: [],
      firma: [],
      foto: []
    }
  } catch (error) {
    console.error('Error uploading documents:', error)
    alert('Error al subir documentos: ' + (error.data?.message || error.message))
  } finally {
    uploadingDocuments.value = false
  }
}

async function confirmDeleteDocument(document) {
  if (!confirm(`¿Estás seguro de eliminar el documento "${document.nombre_archivo}"?\n\nEsta acción no se puede deshacer.`)) {
    return
  }
  
  try {
    await window.fetch(`/api/modules/trabajadoresbtw/${selectedTrabajador.value.id}/documents/${document.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    })
    
    alert('Documento eliminado correctamente')
    await loadTrabajadorDocuments(selectedTrabajador.value.id)
  } catch (error) {
    console.error('Error deleting document:', error)
    alert('Error al eliminar documento: ' + (error.data?.message || error.message))
  }
}

async function saveTrabajador() {
  // Validaciones para crear nuevo trabajador
  if (showCreateModal.value) {
    // Validar campos obligatorios del nuevo formulario
    if (!formData.value.nombre_completo || !formData.value.dni || !formData.value.fecha_nacimiento || !formData.value.lugar_nacimiento) {
      alert('Por favor completa los campos obligatorios: Nombre completo, DNI, Fecha de nacimiento y Lugar de nacimiento')
      return
    }

    // Validar documentos obligatorios
    if (!uploadedFiles.value.dni || uploadedFiles.value.dni.length === 0) {
      alert('Debe subir una foto del DNI (ambos lados)')
      return
    }

    if (!uploadedFiles.value.certificado || uploadedFiles.value.certificado.length === 0) {
      alert('Debe subir el Certificado Único Laboral')
      return
    }

    if (!uploadedFiles.value.firma || uploadedFiles.value.firma.length === 0) {
      alert('Debe subir la firma escaneada')
      return
    }

    if (!uploadedFiles.value.foto || uploadedFiles.value.foto.length === 0) {
      alert('Debe subir una foto del trabajador')
      return
    }

    // Extraer nombres y apellidos del nombre completo si no se proporcionaron
    if (formData.value.nombre_completo && (!formData.value.nombres || !formData.value.apellido_paterno)) {
      const partes = formData.value.nombre_completo.split(',')
      if (partes.length === 2) {
        const apellidos = partes[0].trim().split(' ')
        formData.value.apellido_paterno = apellidos[0] || ''
        formData.value.apellido_materno = apellidos.slice(1).join(' ') || ''
        formData.value.nombres = partes[1].trim()
      }
    }

    // Asignar fecha de ingreso como hoy si no existe
    if (!formData.value.fecha_ingreso) {
      formData.value.fecha_ingreso = new Date().toISOString().split('T')[0]
    }
  } else if (showEditModal.value) {
    // Validaciones para editar
    if (!formData.value.nombre_completo || !formData.value.dni || !formData.value.fecha_nacimiento || !formData.value.lugar_nacimiento) {
      alert('Por favor completa los campos obligatorios: Nombre completo, DNI, Fecha de nacimiento y Lugar de nacimiento')
      return
    }

    // Extraer nombres y apellidos del nombre completo para mantener compatibilidad
    if (formData.value.nombre_completo && (!formData.value.nombres || !formData.value.apellido_paterno)) {
      const partes = formData.value.nombre_completo.split(',')
      if (partes.length === 2) {
        const apellidos = partes[0].trim().split(' ')
        formData.value.apellido_paterno = apellidos[0] || ''
        formData.value.apellido_materno = apellidos.slice(1).join(' ') || ''
        formData.value.nombres = partes[1].trim()
      }
    }
  }

  if (formData.value.dni && formData.value.dni.length < 8) {
    alert('El DNI debe tener al menos 8 caracteres')
    return
  }

  saving.value = true
  try {
    if (showEditModal.value) {
      // Update
      await window.fetch(`/api/modules/trabajadoresbtw/${editingId.value}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
        },
        body: JSON.stringify(formData.value)
      })
      alert('Trabajador actualizado correctamente')
    } else {
      // Create - Enviar datos del trabajador
      const response = await window.fetch('/api/modules/trabajadoresbtw/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
        },
        body: JSON.stringify(formData.value)
      }).then(r => r.json())

      const trabajadorId = response.trabajador_id

      // Subir archivos si existen
      const tieneArchivos = Object.values(uploadedFiles.value).some(files => files && files.length > 0)
      
      if (trabajadorId && tieneArchivos) {
        try {
          await uploadFilesToServer(trabajadorId)
          alert('Trabajador y documentos guardados correctamente')
        } catch (uploadError) {
          console.error('Error subiendo archivos:', uploadError)
          alert('Trabajador creado, pero hubo un error al subir algunos documentos. Por favor, intente subirlos manualmente desde la edición.')
        }
      } else {
        alert('Trabajador creado correctamente')
      }
    }
    
    closeModal()
    await loadData()
  } catch (error) {
    console.error('Error saving trabajador:', error)
    alert(error.data?.message || 'Error al guardar trabajador')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(trabajador) {
  if (!confirm(`¿Estás seguro de eliminar a ${trabajador.nombre_completo}?\n\nEsta acción no se puede deshacer.`)) {
    return
  }

  try {
    await window.fetch(`/api/modules/trabajadoresbtw/${trabajador.id}/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    })
    alert('Trabajador eliminado correctamente')
    await loadData()
  } catch (error) {
    console.error('Error deleting trabajador:', error)
    alert('Error al eliminar trabajador')
  }
}

// Toast notification helper
function showNotification(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Excel Functions
async function downloadTemplate() {
  downloadingTemplate.value = true
  try {
    const blob = await window.fetch('/api/modules/trabajadoresbtw/excel/template', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.blob())
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_trabajadores.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    
    showNotification('¡Plantilla descargada correctamente!', 'success')
  } catch (error) {
    console.error('Error downloading template:', error)
    showNotification('Error al descargar plantilla', 'error')
  } finally {
    downloadingTemplate.value = false
  }
}

async function downloadExcel() {
  exporting.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const blob = await window.fetch('/api/modules/trabajadoresbtw/excel/export', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    }).then(r => r.blob())
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trabajadores_${today}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showNotification('¡Datos exportados correctamente!', 'success')
  } catch (error) {
    console.error('Error exporting data:', error)
    showNotification('Error al exportar datos', 'error')
  } finally {
    exporting.value = false
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

function handleDrop(event) {
  dragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    selectedFile.value = file
  } else {
    alert('Por favor selecciona un archivo Excel (.xlsx o .xls)')
  }
}

async function importExcel() {
  if (!selectedFile.value) {
    showNotification('Por favor selecciona un archivo', 'error')
    return
  }

  importing.value = true
  importResults.value = null

  try {
    const formDataUpload = new FormData()
    formDataUpload.append('file', selectedFile.value)

    const result = await window.fetch('/api/modules/trabajadoresbtw/excel/import', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      },
      body: formDataUpload
    }).then(r => r.json())

    // Asegurar estructura válida de resultado
    importResults.value = {
      total: result.total || result.results?.total || 0,
      imported: result.imported || result.results?.imported || 0,
      errors: result.errors || result.results?.errors || []
    }
    
    selectedFile.value = null
    
    if (importResults.value.imported > 0) {
      await loadData()
    }

    if (importResults.value.errors.length === 0) {
      showNotification(`¡Importación exitosa! ${importResults.value.imported} trabajadores importados`, 'success')
    } else {
      showNotification(`${importResults.value.imported} de ${importResults.value.total} registros importados. Revisa los errores`, 'info')
    }
  } catch (error) {
    console.error('Error importing file:', error)
    showNotification(error.data?.message || 'Error al importar archivo', 'error')
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
@import './trabajadores-theme.css';
@import './trabajadores.css';
</style>
