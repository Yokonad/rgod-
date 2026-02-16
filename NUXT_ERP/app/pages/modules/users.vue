<template>
  <div class="usuarios-layout">
    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor glassmorphism -->
    <div class="usuarios-container">
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
            <img src="/Icons_svg/users.svg" class="title-icon" alt="Usuarios">
            GESTIÓN DE USUARIOS Y ÁREAS
          </h1>
        </div>
        <div class="header-right">
          <!-- Dark Mode Toggle -->
          <div class="dark-mode-container">
            <label class="theme-switch" for="darkModeToggleUsers" title="Modo oscuro">
              <input type="checkbox" id="darkModeToggleUsers" v-model="isDarkMode">
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
          :class="['tab-button', { 'tab-active': activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Usuarios
        </button>
        <button 
          :class="['tab-button', { 'tab-active': activeTab === 'areas' }]"
          @click="activeTab = 'areas'"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Áreas
        </button>
      </div>

      <main class="module-content">
        <!-- TAB: USUARIOS -->
        <div v-show="activeTab === 'users'">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>TOTAL USUARIOS</h3>
              <p class="stat-number">{{ users.length }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>ADMINISTRADORES</h3>
              <p class="stat-number">{{ adminCount }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>USUARIOS ACTIVOS</h3>
              <p class="stat-number">{{ activeUsersCount }}</p>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="filters-container">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium mb-1">Buscar</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nombre, email..."
                class="w-full px-3 py-2 rounded-lg"
              />
            </div>

            <div class="w-48">
              <label class="block text-sm font-medium mb-1">Filtrar por Área</label>
              <select
                v-model="filterArea"
                class="w-full px-3 py-2 rounded-lg"
              >
                <option value="">Todas las áreas</option>
                <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button
                @click="showCreateModal = true"
                class="btn-nuevo-usuario px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Usuario
              </button>
              <button
                @click="showImportTrabajadorModal = true"
                class="btn-importar-trabajador px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Importar Trabajador
              </button>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden usuarios-table">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Área</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rol</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Creado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span class="ml-3">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="filteredUsers.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id" class="transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="font-medium">{{ user.name }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      v-if="user.area_name" 
                      class="px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1"
                      :style="{ backgroundColor: user.area_color + '20', color: user.area_color, border: '1px solid ' + user.area_color }"
                    >
                      <img v-if="user.area_icon" :src="`/Icons_svg/${user.area_icon}.svg`" class="h-3 w-3" :style="{ filter: 'brightness(0) saturate(100%)', opacity: 0.7 }" />
                      {{ user.area_name }}
                    </span>
                    <span v-else class="text-xs text-gray-400">Sin área</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="user.active_sessions > 0 ? 'badge-activo' : 'badge-inactivo'" class="px-2 py-1 text-xs font-semibold rounded-full flex items-center w-fit gap-1">
                      <span :class="['h-1.5 w-1.5 rounded-full', user.active_sessions > 0 ? 'bg-green-500' : 'bg-gray-400']"></span>
                      {{ user.active_sessions > 0 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="openEditModal(user)"
                        class="btn-accion-editar p-2 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDelete(user)"
                        :disabled="user.id === currentUser?.id"
                        class="btn-accion-eliminar p-2 rounded-lg transition-colors"
                        :class="{ 'opacity-50 cursor-not-allowed': user.id === currentUser?.id }"
                        :title="user.id === currentUser?.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'"
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

        <!-- TAB: ÁREAS -->
        <div v-show="activeTab === 'areas'" class="areas-section">
          <!-- Statistics Cards Areas -->
          <div class="stats-grid mb-6">
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>TOTAL ÁREAS</h3>
                <p class="stat-number">{{ areas.length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>ÁREAS ACTIVAS</h3>
                <p class="stat-number">{{ areas.filter(a => a.is_active).length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>USUARIOS ASIGNADOS</h3>
                <p class="stat-number">{{ users.filter(u => u.area_id).length }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="filters-container mb-6">
            <button
              @click="showAreaModal = true; editingArea = null"
              class="btn-nuevo-usuario px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Área
            </button>
          </div>

          <!-- Areas Table -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden usuarios-table">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Área</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descripción</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Color</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Usuarios</th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-if="loadingAreas">
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-3">Cargando áreas...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="areas.length === 0">
                    <td colspan="6" class="px-6 py-12 text-center">
                      <p>No hay áreas creadas</p>
                    </td>
                  </tr>
                  <tr v-for="area in areas" :key="area.id" class="transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div 
                          class="h-10 w-10 rounded-lg flex items-center justify-center"
                          :style="{ backgroundColor: area.color + '20', border: '1px solid ' + area.color }"
                        >
                          <img :src="`/Icons_svg/${area.icon}.svg`" class="h-6 w-6" :style="{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)', opacity: 0.7 }" />
                        </div>
                        <div class="font-medium">{{ area.name }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm truncate max-w-xs">{{ area.description || 'Sin descripción' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="h-6 w-6 rounded border" :style="{ backgroundColor: area.color }"></div>
                        <span class="text-xs font-mono">{{ area.color }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-medium">{{ area.user_count || 0 }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="area.is_active ? 'badge-activo' : 'badge-inactivo'" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{ area.is_active ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="openEditAreaModal(area)"
                          class="btn-accion-editar p-2 rounded-lg transition-colors"
                          title="Editar área"
                        >
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          @click="confirmDeleteArea(area)"
                          :disabled="area.user_count > 0"
                          class="btn-accion-eliminar p-2 rounded-lg transition-colors"
                          :class="{ 'opacity-50 cursor-not-allowed': area.user_count > 0 }"
                          :title="area.user_count > 0 ? 'No se puede eliminar: tiene usuarios asignados' : 'Eliminar área'"
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
      </main>

      <!-- Create/Edit User Modal -->
      <Teleport to="body">
        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeUserModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ editingUser ? 'EDITAR USUARIO' : 'CREAR NUEVO USUARIO' }}</h2>
              <button @click="closeUserModal" class="modal-close-btn p-2 rounded-lg transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <form @submit.prevent="saveUser" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">NOMBRE</label>
                  <input
                    v-model="userForm.name"
                    type="text"
                    required
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">EMAIL</label>
                  <input
                    v-model="userForm.email"
                    type="email"
                    required
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="juan@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">
                    CONTRASEÑA
                    <span v-if="editingUser" class="text-xs font-normal text-gray-500">(dejar en blanco para no cambiar)</span>
                  </label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    :required="!editingUser"
                    minlength="8"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">ÁREA</label>
                  <select
                    v-model="userForm.area_id"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                  >
                    <option :value="null">Sin área asignada</option>
                    <option v-for="area in areas.filter(a => a.is_active)" :key="area.id" :value="area.id">
                      {{ area.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">ROL</label>
                  <select
                    v-model="userForm.role"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-sm text-red-600">{{ errorMessage }}</p>
                </div>

                <div class="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    @click="closeUserModal"
                    class="modal-btn-cancelar flex-1 px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="modal-btn-guardar flex-1 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading ? (editingUser ? 'Guardando...' : 'Creando...') : (editingUser ? 'Guardar Cambios' : 'Crear Usuario') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Create/Edit Area Modal -->
      <Teleport to="body">
        <div v-if="showAreaModal" class="modal-overlay" @click.self="closeAreaModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ editingArea ? 'EDITAR ÁREA' : 'CREAR NUEVA ÁREA' }}</h2>
              <button @click="closeAreaModal" class="modal-close-btn p-2 rounded-lg transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <form @submit.prevent="saveArea" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">NOMBRE</label>
                  <input
                    v-model="areaForm.name"
                    type="text"
                    required
                    maxlength="100"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="Ej: Recursos Humanos"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">DESCRIPCIÓN</label>
                  <textarea
                    v-model="areaForm.description"
                    rows="3"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="Descripción del área..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">COLOR</label>
                  <div class="flex gap-3 items-center">
                    <input
                      v-model="areaForm.color"
                      type="color"
                      class="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      v-model="areaForm.color"
                      type="text"
                      pattern="^#[0-9A-F]{6}$"
                      class="input-modal flex-1 px-4 py-2.5 rounded-lg font-mono"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">ICONO</label>
                  <input
                    v-model="areaForm.icon"
                    type="text"
                    required
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="briefcase, code, truck, shield..."
                  />
                  <p class="text-xs text-gray-500 mt-1">Nombre del icono SVG (sin extensión) disponible en /Icons_svg/</p>
                </div>

                <div v-if="editingArea">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="areaForm.is_active"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300"
                    />
                    <span class="text-sm font-medium label-modal">Área activa</span>
                  </label>
                </div>

                <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-sm text-red-600">{{ errorMessage }}</p>
                </div>

                <div class="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    @click="closeAreaModal"
                    class="modal-btn-cancelar flex-1 px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="loadingAreas"
                    class="modal-btn-guardar flex-1 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loadingAreas ? (editingArea ? 'Guardando...' : 'Creando...') : (editingArea ? 'Guardar Cambios' : 'Crear Área') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal: Seleccionar Trabajador -->
      <Teleport to="body">
        <div v-if="showImportTrabajadorModal" class="modal-overlay" @click.self="showImportTrabajadorModal = false">
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h2>SELECCIONAR TRABAJADOR</h2>
              <button @click="showImportTrabajadorModal = false" class="modal-close-btn p-2 rounded-lg transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="p-6">
              <!-- Búsqueda de trabajadores -->
              <div class="mb-4">
                <input
                  v-model="searchTrabajador"
                  type="text"
                  placeholder="Buscar por DNI o nombre..."
                  class="input-modal w-full px-4 py-2.5 rounded-lg"
                />
              </div>

              <!-- Lista de trabajadores -->
              <div v-if="loadingTrabajadores" class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-4 text-gray-600">Cargando trabajadores...</p>
              </div>

              <div v-else-if="filteredTrabajadores.length === 0" class="text-center py-8">
                <svg class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="mt-4 text-gray-600">No se encontraron trabajadores</p>
              </div>

              <div v-else class="max-h-96 overflow-y-auto space-y-2">
                <button
                  v-for="trabajador in filteredTrabajadores"
                  :key="trabajador.id"
                  @click="selectTrabajadorForImport(trabajador)"
                  class="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <div class="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {{ trabajador.nombre_completo?.charAt(0) || '?' }}
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900">{{ trabajador.nombre_completo }}</p>
                      <p class="text-sm text-gray-600">DNI: {{ trabajador.dni }}</p>
                      <p class="text-sm text-gray-600">Email: {{ trabajador.email || 'Sin email' }}</p>
                      <p class="text-sm text-gray-600">Cargo: {{ trabajador.cargo || 'Sin cargo' }}</p>
                    </div>
                    <div class="flex-shrink-0">
                      <span :class="['px-3 py-1 rounded-full text-xs font-medium', 
                        trabajador.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                        {{ trabajador.estado }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal: Formulario de Importación -->
      <Teleport to="body">
        <div v-if="showImportFormModal" class="modal-overlay" @click.self="closeImportForm">
          <div class="modal-content">
            <div class="modal-header">
              <h2>CREAR USUARIO DESDE TRABAJADOR</h2>
              <button @click="closeImportForm" class="modal-close-btn p-2 rounded-lg transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="p-6" v-if="selectedTrabajador">
              <!-- Información del trabajador -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 class="text-sm font-semibold text-blue-900 mb-2">DATOS DEL TRABAJADOR</h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-blue-700 font-medium">Nombre:</span>
                    <span class="text-blue-900 ml-2">{{ selectedTrabajador.nombre_completo }}</span>
                  </div>
                  <div>
                    <span class="text-blue-700 font-medium">DNI:</span>
                    <span class="text-blue-900 ml-2">{{ selectedTrabajador.dni }}</span>
                  </div>
                  <div>
                    <span class="text-blue-700 font-medium">Email:</span>
                    <span class="text-blue-900 ml-2">{{ selectedTrabajador.email || 'No registrado' }}</span>
                  </div>
                  <div>
                    <span class="text-blue-700 font-medium">Cargo:</span>
                    <span class="text-blue-900 ml-2">{{ selectedTrabajador.cargo || 'Sin cargo' }}</span>
                  </div>
                </div>
              </div>

              <form @submit.prevent="saveImportedUser" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">NOMBRE (del trabajador)</label>
                  <input
                    v-model="userForm.name"
                    type="text"
                    required
                    readonly
                    class="input-modal w-full px-4 py-2.5 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">EMAIL</label>
                  <input
                    v-model="userForm.email"
                    type="email"
                    required
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="juan@example.com"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">CONTRASEÑA</label>
                  <input
                    v-model="userForm.password"
                    type="password"
                    required
                    minlength="8"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">ÁREA</label>
                  <select
                    v-model="userForm.area_id"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                  >
                    <option :value="null">Sin área asignada</option>
                    <option v-for="area in areas.filter(a => a.is_active)" :key="area.id" :value="area.id">
                      {{ area.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2 label-modal">ROL</label>
                  <select
                    v-model="userForm.role"
                    class="input-modal w-full px-4 py-2.5 rounded-lg"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-sm text-red-600">{{ errorMessage }}</p>
                </div>

                <div class="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    @click="closeImportForm"
                    class="modal-btn-cancelar flex-1 px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="modal-btn-guardar flex-1 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading ? 'Creando...' : 'Crear Usuario' }}
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
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: false
});

const { user: currentUser } = useAuth();
const { isDarkMode } = useTheme();

// Helper para navegación  
const goToDashboard = () => {
  navigateTo('/dashboard');
};

// State - Tabs
const activeTab = ref<'users' | 'areas'>('users');

// State - Users
const users = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const filterArea = ref('');
const showCreateModal = ref(false);
const editingUser = ref<any>(null);
const errorMessage = ref('');

// Import Trabajador State
const showImportTrabajadorModal = ref(false);
const showImportFormModal = ref(false);
const trabajadores = ref<any[]>([]);
const loadingTrabajadores = ref(false);
const selectedTrabajador = ref<any>(null);
const searchTrabajador = ref('');

const userForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
  area_id: null as number | null
});

// State - Areas
const areas = ref<any[]>([]);
const loadingAreas = ref(false);
const showAreaModal = ref(false);
const editingArea = ref<any>(null);

const areaForm = ref({
  name: '',
  description: '',
  color: '#3B82F6',
  icon: 'briefcase',
  is_active: true
});

// Computed
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length);
const activeUsersCount = computed(() => users.value.filter(u => u.active_sessions > 0).length);

const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }
  
  // Filtro por área
  if (filterArea.value) {
    filtered = filtered.filter(user => user.area_id == filterArea.value);
  }
  
  return filtered;
});

// Methods - Users
const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await $fetch<any>('/api/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    });

    if (response.success && Array.isArray(response.users)) {
      users.value = response.users;
    } else {
      users.value = [];
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const openEditModal = (user: any) => {
  editingUser.value = user;
  userForm.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    area_id: user.area_id
  };
  showCreateModal.value = true;
  errorMessage.value = '';
};

const closeUserModal = () => {
  showCreateModal.value = false;
  editingUser.value = null;
  userForm.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    area_id: null
  };
  errorMessage.value = '';
};

const saveUser = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    const url = editingUser.value ? `/api/users/${editingUser.value.id}` : '/api/users';
    const method = editingUser.value ? 'PUT' : 'POST';

    const body = { ...userForm.value };
    if (editingUser.value && !body.password) {
      delete body.password;
    }

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      },
      body
    });

    if (response.success) {
      closeUserModal();
      await loadUsers();
    } else {
      errorMessage.value = response.message || 'Error al guardar usuario';
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al guardar usuario';
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async (user: any) => {
  if (!confirm(`¿Estás seguro de eliminar a ${user.name}? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    loading.value = true;
    const response = await $fetch<any>(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    });

    if (response.success) {
      await loadUsers();
    }
  } catch (error: any) {
    alert(error.data?.message || 'Error al eliminar usuario');
  } finally {
    loading.value = false;
  }
};

// Methods - Areas
const loadAreas = async () => {
  try {
    loadingAreas.value = true;
    const response = await $fetch<any>('/api/areas', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    });

    if (response.success && Array.isArray(response.areas)) {
      areas.value = response.areas;
    } else {
      areas.value = [];
    }
  } catch (error) {
    console.error('Error cargando áreas:', error);
    areas.value = [];
  } finally {
    loadingAreas.value = false;
  }
};

const openEditAreaModal = (area: any) => {
  editingArea.value = area;
  areaForm.value = {
    name: area.name,
    description: area.description || '',
    color: area.color,
    icon: area.icon,
    is_active: area.is_active
  };
  showAreaModal.value = true;
  errorMessage.value = '';
};

const closeAreaModal = () => {
  showAreaModal.value = false;
  editingArea.value = null;
  areaForm.value = {
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'briefcase',
    is_active: true
  };
  errorMessage.value = '';
};

const saveArea = async () => {
  try {
    loadingAreas.value = true;
    errorMessage.value = '';

    const url = editingArea.value ? `/api/areas/${editingArea.value.id}` : '/api/areas';
    const method = editingArea.value ? 'PUT' : 'POST';

    const response = await $fetch<any>(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      },
      body: areaForm.value
    });

    if (response.success) {
      closeAreaModal();
      await loadAreas();
      await loadUsers(); // Recargar usuarios para actualizar info de áreas
    } else {
      errorMessage.value = response.message || 'Error al guardar área';
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al guardar área';
  } finally {
    loadingAreas.value = false;
  }
};

const confirmDeleteArea = async (area: any) => {
  if (!confirm(`¿Estás seguro de eliminar el área "${area.name}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    loadingAreas.value = true;
    const response = await $fetch<any>(`/api/areas/${area.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}`
      }
    });

    if (response.success) {
      await loadAreas();
      await loadUsers();
    } else {
      alert(response.message || 'Error al eliminar área');
    }
  } catch (error: any) {
    alert(error.data?.message || 'Error al eliminar área');
  } finally {
    loadingAreas.value = false;
  }
};

// Utilities
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Trabajadores computed filter
const filteredTrabajadores = computed(() => {
  if (!searchTrabajador.value) return trabajadores.value;
  
  const query = searchTrabajador.value.toLowerCase();
  return trabajadores.value.filter(t => 
    t.nombre_completo?.toLowerCase().includes(query) || 
    t.dni?.toLowerCase().includes(query) ||
    t.email?.toLowerCase().includes(query)
  );
});

// Load Trabajadores
async function loadTrabajadores() {
  loadingTrabajadores.value = true;
  try {
    const data = await $fetch('/api/modules/trabajadores/list');
    trabajadores.value = data.trabajadores || [];
  } catch (error) {
    console.error('Error loading trabajadores:', error);
    alert('Error al cargar trabajadores');
  } finally {
    loadingTrabajadores.value = false;
  }
}

// Select Trabajador for Import
function selectTrabajadorForImport(trabajador) {
  selectedTrabajador.value = trabajador;
  
  // Pre-fill form with trabajador data
  userForm.value = {
    name: trabajador.nombre_completo || '',
    email: trabajador.email || '',
    password: '',
    role: 'user',
    area_id: null
  };
  
  // Close selection modal and open form modal
  showImportTrabajadorModal.value = false;
  showImportFormModal.value = true;
}

// Close Import Form
function closeImportForm() {
  showImportFormModal.value = false;
  selectedTrabajador.value = null;
  userForm.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    area_id: null
  };
  errorMessage.value = '';
}

// Save Imported User (linked to trabajador)
async function saveImportedUser() {
  if (!selectedTrabajador.value) return;
  
  loading.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/users/create-from-trabajador', {
      method: 'POST',
      body: {
        trabajador_id: selectedTrabajador.value.id,
        email: userForm.value.email,
        password: userForm.value.password,
        role: userForm.value.role,
        area_id: userForm.value.area_id
      }
    });

    await loadUsers();
    closeImportForm();
    alert('Usuario creado exitosamente desde trabajador');
  } catch (error: any) {
    console.error('Error creating user from trabajador:', error);
    errorMessage.value = error.data?.message || 'Error al crear usuario';
  } finally {
    loading.value = false;
  }
}

// Check admin access
onMounted(async () => {
  if (currentUser.value?.role !== 'admin') {
    alert('No tienes permisos para acceder a este módulo');
    await navigateTo('/dashboard');
    return;
  }

  await Promise.all([loadUsers(), loadAreas(), loadTrabajadores()]);
});
</script>

<style scoped>
@import '~/assets/css/eje-theme.css';
@import './users.css';
</style>
