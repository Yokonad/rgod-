<template>
  <div class="ipad-screen">
    <!-- Barra de estado superior -->
    <div class="status-bar">
      <div class="status-left">
        <span class="time-display">{{ currentTime }}</span>
        <span class="date-display">{{ currentDate }}</span>
      </div>
      
      <div class="status-center">
        <!-- Botones de gestión (solo admin) -->
        <div v-if="user?.role === 'admin'" class="admin-controls">
          <button @click="showFolderModal = true" class="btn-admin" title="Crear Carpeta">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 11V15M10 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button @click="toggleEditMode" class="btn-admin" :class="{ active: isEditMode }" title="Modo Edición">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="status-right">
        <!-- Dark Mode Toggle -->
        <div class="dark-mode-container">
          <label class="theme-switch" for="darkModeToggle" title="Modo oscuro">
            <input type="checkbox" id="darkModeToggle" v-model="isDarkMode">
            <span class="slider">
              <img src="/Icons_svg/sun.svg" class="sun-icon" alt="Modo Día">
              <img src="/Icons_svg/moon.svg" class="moon-icon" alt="Modo Noche">
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Barra de bienvenida -->
    <div class="welcome-bar">
      <div class="welcome-text">
        <h1>{{ greeting }}</h1>
        <ClientOnly>
          <p>{{ user?.name || '' }}</p>
          <template #fallback>
            <p>&nbsp;</p>
          </template>
        </ClientOnly>
      </div>
      <div class="flex items-center gap-3">
        <p v-if="isEditMode" class="edit-mode-hint">Arrastra los iconos para reordenarlos</p>
        <div v-if="isSaving" class="saving-indicator flex items-center gap-2">
          <div class="saving-spinner"></div>
          <span class="text-sm text-white/70">Guardando...</span>
        </div>
      </div>
    </div>

    <!-- Grid de iconos de aplicaciones -->
    <div 
      class="app-grid-container"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div class="app-grid" :class="{ 'edit-mode': isEditMode }">
        <template v-for="(item, index) in displayItems" :key="item.key">
          <div 
            class="icon-wrapper transition-all duration-300 ease-out"
            :class="{
              'drag-over-before': dragOverIndex === index && dragPosition === 'before',
              'drag-over-after': dragOverIndex === index && dragPosition === 'after',
              'is-dragging': draggedItemData?.index === index,
              'drag-active': isEditMode && draggedItemData !== null,
              'scale-95 opacity-50': draggedItemData?.index === index,
              'hover:scale-105': isEditMode && draggedItemData === null
            }"
            :data-index="index"
            @dragenter="(e) => handleDragEnter(e, index)"
          >
            <!-- Carpeta -->
            <DesktopFolder
              v-if="item.type === 'folder'"
              :title="item.name"
              :icon="item.icon"
              :gradient="item.color"
              :module-count="item.moduleCount"
              :folder-id="item.id"
              :draggable="isEditMode"
              class="transition-all duration-300 ease-out"
              :class="{ 
                'opacity-30 scale-90 blur-sm': draggedItemData?.index === index,
                'hover:scale-105': isEditMode && draggedItemData === null
              }"
              @open="openFolder"
              @dragstart="() => handleItemDragStart(item, index)"
              @dragend="handleItemDragEnd"
            />
            <!-- Módulo -->
            <DesktopIcon
              v-else
              :title="item.display_name || item.name"
              :icon="item.icon || 'package'"
              :gradient="item.gradient"
              :module-name="item.name"
              :draggable="isEditMode"
              class="transition-all duration-300 ease-out"
              :class="{ 
                'opacity-30 scale-90 blur-sm': draggedItemData?.index === index,
                'hover:scale-105': isEditMode && draggedItemData === null
              }"
              @open="navigateTo(item.route)"
              @dragstart="() => handleItemDragStart(item, index)"
              @dragend="handleItemDragEnd"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Botón de cerrar sesión -->
    <div class="logout-button" @click="handleLogout" title="Cerrar Sesión">
      <img src="/Icons_svg/log-out.svg" alt="Logout" class="logout-icon">
      <span>Salir</span>
    </div>

    <!-- Modal de Carpeta -->
    <Teleport to="body">
      <div v-if="showFolderModal" class="modal-overlay" @click.self="closeFolderModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta' }}</h2>
            <button @click="closeFolderModal" class="btn-close">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la carpeta</label>
              <input v-model="folderForm.name" type="text" placeholder="Ej: Recursos Humanos" />
            </div>
            <div class="form-group">
              <label>Icono</label>
              <select v-model="folderForm.icon">
                <option value="folder">Carpeta</option>
                <option value="briefcase">Maletín</option>
                <option value="users">Usuarios</option>
                <option value="file-text">Documentos</option>
                <option value="settings">Configuración</option>
              </select>
            </div>
            <div class="form-group">
              <label>Color</label>
              <div class="color-picker">
                <button
                  v-for="color in colorOptions"
                  :key="color.value"
                  class="color-option"
                  :class="{ active: folderForm.color === color.value }"
                  :style="{ background: color.value }"
                  @click="folderForm.color = color.value"
                  :title="color.name"
                ></button>
              </div>
            </div>
            <div class="form-group">
              <label>Descripción (opcional)</label>
              <textarea v-model="folderForm.description" placeholder="Descripción de la carpeta"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeFolderModal" class="btn-cancelar">Cancelar</button>
            <button @click="saveFolder" class="btn-guardar" :disabled="!folderForm.name">
              {{ editingFolder ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Contenido de Carpeta -->
    <Teleport to="body">
      <div v-if="showFolderContentModal" class="modal-overlay" @click.self="closeFolderContentModal">
        <div class="modal-content folder-content-modal">
          <div class="modal-header">
            <h2>{{ currentFolder?.name }}</h2>
            <div class="folder-actions">
              <button 
                v-if="user?.role === 'admin'" 
                @click="showModuleSelector = true" 
                class="btn-add-module"
                title="Agregar módulo"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button @click="closeFolderContentModal" class="btn-close">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div v-if="folderModules.length === 0" class="empty-folder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>Esta carpeta está vacía</p>
            </div>
            <div v-else class="folder-modules-grid">
              <div
                v-for="module in folderModules"
                :key="module.name"
                class="folder-module-item"
                @click="navigateToModule(module)"
              >
                <div class="module-icon-container" :style="{ background: module.gradient }">
                  <img :src="`/Icons_svg/${module.icon}.svg`" :alt="module.display_name" />
                </div>
                <p class="module-name">{{ module.display_name }}</p>
                <button
                  v-if="user?.role === 'admin'"
                  @click.stop="removeModuleFromFolder(module.name)"
                  class="btn-remove-module"
                  title="Quitar de carpeta"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Selector de módulos -->
            <div v-if="showModuleSelector" class="module-selector">
              <h3>Agregar Módulo</h3>
              <div class="module-list">
                <button
                  v-for="module in availableModulesForFolder"
                  :key="module.name"
                  class="module-option"
                  @click="addModuleToFolder(module.name)"
                >
                  <div class="module-icon-small" :style="{ background: module.gradient }">
                    <img :src="`/Icons_svg/${module.icon}.svg`" :alt="module.display_name" />
                  </div>
                  <span>{{ module.display_name }}</span>
                </button>
              </div>
              <button @click="showModuleSelector = false" class="btn-cancelar">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import DesktopIcon from '~/components/DesktopIcon.vue';
import DesktopFolder from '~/components/DesktopFolder.vue';

definePageMeta({
  layout: false,
});

const { user, isAuthenticated, logout } = useAuth();
const { isDarkMode } = useTheme();

// Estados
const availableModules = ref<any[]>([]);
const folders = ref<any[]>([]);
const userPositions = ref<any[]>([]);
const isEditMode = ref(false);
const draggedItem = ref<any>(null);

// Modales
const showFolderModal = ref(false);
const showFolderContentModal = ref(false);
const showModuleSelector = ref(false);
const editingFolder = ref<any>(null);
const currentFolder = ref<any>(null);
const folderModules = ref<any[]>([]);

// Formulario de carpeta
const folderForm = ref({
  name: '',
  icon: 'folder',
  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  description: ''
});

// Opciones de color
const colorOptions = [
  { name: 'Púrpura', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Azul', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Verde', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Naranja', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Rojo', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Teal', value: 'linear-gradient(135deg, #0AA4A4 0%, #2F6FBF 100%)' },
];

// Hora y fecha
const currentTime = ref('');
const currentDate = ref('');

// Greeting dinámico
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
});

// Items a mostrar (carpetas + módulos ordenados)
const displayItems = computed(() => {
  const items: any[] = [];

  // Usar posiciones locales si existen (actualizaci\u00f3n instant\u00e1nea), sino usar del servidor
  const positions = localPositions.value.length > 0 ? localPositions.value : userPositions.value;

  // Si hay posiciones guardadas, usar ese orden
  if (positions.length > 0) {
    positions.forEach((pos: any) => {
      const itemType = pos.item_type || pos.type;
      const itemId = pos.item_id || pos.id;
      if (itemType === 'folder') {
        const folder = folders.value.find(f => f.id === parseInt(itemId));
        if (folder) {
          items.push({
            ...folder,
            type: 'folder',
            key: `folder-${folder.id}`
          });
        }
      } else {
        const module = availableModules.value.find(m => m.name === itemId);
        if (module) {
          // Verificar que el módulo no esté en ninguna carpeta
          const isInFolder = folders.value.some(f => 
            folderModules.value.some(fm => fm.name === module.name && fm.folder_id === f.id)
          );
          if (!isInFolder) {
            items.push({
              ...module,
              type: 'module',
              key: `module-${module.name}`
            });
          }
        }
      }
    });
  } else {
    // Orden por defecto: carpetas primero, luego módulos
    folders.value.forEach(folder => {
      items.push({
        ...folder,
        type: 'folder',
        key: `folder-${folder.id}`
      });
    });

    availableModules.value.forEach(module => {
      // Verificar que el módulo no esté en ninguna carpeta
      const isInFolder = folderModules.value.some(fm => fm.name === module.name);
      if (!isInFolder) {
        items.push({
          ...module,
          type: 'module',
          key: `module-${module.name}`
        });
      }
    });
  }

  return items;
});

// Módulos disponibles para agregar a carpeta
const availableModulesForFolder = computed(() => {
  if (!currentFolder.value) return [];
  const currentModuleNames = folderModules.value.map(m => m.name);
  return availableModules.value.filter(m => !currentModuleNames.includes(m.name));
});

// Actualizar hora
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
  currentDate.value = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

// Cargar datos
const loadData = async () => {
  await Promise.all([
    loadModules(),
    loadFolders(),
    loadUserPositions()
  ]);
  await loadAllFolderModules();
};

const loadModules = async () => {
  try {
    const [dbModulesRes, dynamicModulesRes] = await Promise.all([
      $fetch<any>('/api/modules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
      }),
      $fetch<any>('/api/modules/scan', {
        headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
      })
    ]);

    const dbModules = dbModulesRes.success && Array.isArray(dbModulesRes.modules)
      ? dbModulesRes.modules.filter((m: any) => m.name !== 'dashboard')
      : [];
    
    const dynamicModules = dynamicModulesRes.success && Array.isArray(dynamicModulesRes.modules)
      ? dynamicModulesRes.modules
      : [];

    availableModules.value = [...dbModules, ...dynamicModules];
  } catch (error) {
    console.error('Error cargando módulos:', error);
  }
};

const loadFolders = async () => {
  try {
    const res = await $fetch<any>('/api/folders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
    });
    folders.value = res.success ? res.folders : [];
  } catch (error) {
    console.error('Error cargando carpetas:', error);
  }
};

const loadUserPositions = async () => {
  try {
    const res = await $fetch<any>('/api/user-positions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
    });
    userPositions.value = res.success ? res.positions : [];
  } catch (error) {
    console.error('Error cargando posiciones:', error);
  }
};

const loadAllFolderModules = async () => {
  const allModules: any[] = [];
  for (const folder of folders.value) {
    try {
      const res = await $fetch<any>(`/api/folders/${folder.id}/modules`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
      });
      if (res.success && res.modules) {
        res.modules.forEach((fm: any) => {
          allModules.push({
            ...fm,
            folder_id: folder.id
          });
        });
      }
    } catch (error) {
      console.error(`Error cargando módulos de carpeta ${folder.id}:`, error);
    }
  }
  folderModules.value = allModules;
};

// Funciones de carpeta
const saveFolder = async () => {
  try {
    const res = await $fetch<any>('/api/folders/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` },
      body: folderForm.value
    });

    if (res.success) {
      await loadFolders();
      closeFolderModal();
    }
  } catch (error: any) {
    console.error('Error creando carpeta:', error);
    alert(error.data?.message || 'Error al crear carpeta');
  }
};

const openFolder = async (folderId: number) => {
  const folder = folders.value.find(f => f.id === folderId);
  if (!folder) return;

  currentFolder.value = folder;
  
  try {
    const res = await $fetch<any>(`/api/folders/${folderId}/modules`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` }
    });

    if (res.success && res.modules) {
      // Mapear módulos con su información completa
      folderModules.value = res.modules.map((fm: any) => {
        const module = availableModules.value.find(m => m.name === fm.module_name);
        return {
          ...fm,
          ...module
        };
      }).filter((m: any) => m.name); // Filtrar módulos no encontrados
    } else {
      folderModules.value = [];
    }

    showFolderContentModal.value = true;
  } catch (error) {
    console.error('Error abriendo carpeta:', error);
  }
};

const addModuleToFolder = async (moduleName: string) => {
  if (!currentFolder.value) return;

  try {
    const res = await $fetch<any>(`/api/folders/${currentFolder.value.id}/add-module`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` },
      body: { moduleName }
    });

    if (res.success) {
      await openFolder(currentFolder.value.id);
      await loadAllFolderModules();
      showModuleSelector.value = false;
    }
  } catch (error: any) {
    console.error('Error agregando módulo:', error);
    alert(error.data?.message || 'Error al agregar módulo');
  }
};

const removeModuleFromFolder = async (moduleName: string) => {
  if (!currentFolder.value) return;
  if (!confirm('¿Quitar este módulo de la carpeta?')) return;

  try {
    const res = await $fetch<any>(`/api/folders/${currentFolder.value.id}/remove-module`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` },
      body: { moduleName }
    });

    if (res.success) {
      await openFolder(currentFolder.value.id);
      await loadAllFolderModules();
    }
  } catch (error: any) {
    console.error('Error quitando módulo:', error);
    alert(error.data?.message || 'Error al quitar módulo');
  }
};

const navigateToModule = (module: any) => {
  if (module.route) {
    navigateTo(module.route);
  }
};

// Drag and drop
const draggedItemData = ref<{ type: string; id: string; index: number } | null>(null);
const dragOverIndex = ref<number>(-1);
const dragPosition = ref<'before' | 'after'>('after');
const localPositions = ref<Array<{ type: string; id: string; position: number }>>([]);
const isSaving = ref(false);
let saveTimeout: NodeJS.Timeout | null = null;

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value && localPositions.value.length > 0) {
    // Guardar inmediatamente al salir del modo edición
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    savePositionsToServer();
  }
};

const handleItemDragStart = (item: any, index: number) => {
  if (!isEditMode.value) return;
  
  const itemType = item.type;
  const itemId = item.type === 'folder' ? item.id.toString() : item.name;
  
  draggedItemData.value = { type: itemType, id: itemId, index };
};

const handleItemDragEnd = (event: DragEvent) => {
  draggedItemData.value = null;
  dragOverIndex.value = -1;
  dragPosition.value = 'after';
};

const handleDragEnter = (event: DragEvent, index: number) => {
  if (!isEditMode.value || !draggedItemData.value) return;
  if (draggedItemData.value.index === index) return;
  
  const target = event.target as HTMLElement;
  const wrapper = target.closest('.icon-wrapper') as HTMLElement;
  
  if (wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    
    // Determinar si el cursor está en la mitad izquierda o derecha
    if (event.clientX < midX) {
      dragPosition.value = 'before';
    } else {
      dragPosition.value = 'after';
    }
    
    dragOverIndex.value = index;
  }
};

const handleDragOver = (event: DragEvent) => {
  if (!isEditMode.value) return;
  event.preventDefault();
};

const handleDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (!relatedTarget || !relatedTarget.closest('.app-grid')) {
    dragOverIndex.value = -1;
    dragPosition.value = 'after';
  }
};

const handleDrop = (event: DragEvent) => {
  if (!isEditMode.value || !draggedItemData.value) return;
  event.preventDefault();

  const fromIndex = draggedItemData.value.index;
  let toIndex = dragOverIndex.value !== -1 ? dragOverIndex.value : displayItems.value.length - 1;

  // Ajustar toIndex basado en la posición (before/after)
  if (dragPosition.value === 'after' && toIndex < displayItems.value.length - 1) {
    toIndex++;
  }
  
  // Si movemos hacia la derecha, ajustar el índice
  if (fromIndex < toIndex) {
    toIndex--;
  }

  if (fromIndex === toIndex) {
    draggedItemData.value = null;
    dragOverIndex.value = -1;
    dragPosition.value = 'after';
    return;
  }

  // Reordenar el array localmente (instantáneo)
  const newItems = [...displayItems.value];
  const [movedItem] = newItems.splice(fromIndex, 1);
  newItems.splice(toIndex, 0, movedItem);

  // Actualizar posiciones locales inmediatamente para UI instantánea
  localPositions.value = newItems.map((item, index) => ({
    type: item.type,
    id: item.type === 'folder' ? item.id.toString() : item.name,
    position: index
  }));
  
  draggedItemData.value = null;
  dragOverIndex.value = -1;
  dragPosition.value = 'after';

  // Guardar en segundo plano con debounce (500ms)
  savePositionsDebounced();
};

const savePositionsDebounced = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    await savePositionsToServer();
  }, 500);
};

const savePositionsToServer = async () => {
  if (isSaving.value || localPositions.value.length === 0) return;
  
  isSaving.value = true;
  
  try {
    await $fetch<any>('/api/user-positions/save', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bytewave_auth_token')}` },
      body: { positions: localPositions.value }
    });
    
    // Sincronizar con el servidor
    userPositions.value = localPositions.value.map(pos => ({
      item_type: pos.type,
      item_id: pos.id,
      position: pos.position
    }));
  } catch (error) {
    console.error('Error guardando posiciones:', error);
    // No mostrar alerta para no molestar al usuario
  } finally {
    isSaving.value = false;
  }
};

const savePositions = async () => {
  // Actualizar posiciones locales basadas en el orden actual
  localPositions.value = displayItems.value.map((item, index) => ({
    type: item.type,
    id: item.type === 'folder' ? item.id.toString() : item.name,
    position: index
  }));
  
  // Guardar en el servidor
  await savePositionsToServer();
};

// Modales
const closeFolderModal = () => {
  showFolderModal.value = false;
  editingFolder.value = null;
  folderForm.value = {
    name: '',
    icon: 'folder',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: ''
  };
};

const closeFolderContentModal = () => {
  showFolderContentModal.value = false;
  currentFolder.value = null;
  folderModules.value = [];
  showModuleSelector.value = false;
};

// Logout
const handleLogout = async () => {
  await logout();
  navigateTo('/login');
};

// Inicialización
onMounted(async () => {
  if (!isAuthenticated.value) {
    await navigateTo('/login');
    return;
  }

  await loadData();
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<style scoped>
@import './dashboard-styles.css';
</style>
