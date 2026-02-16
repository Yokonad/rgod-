<template>
  <div class="install-wizard">
    <!-- Fondo animado -->
    <div class="animated-background"></div>
    
    <!-- Contenedor principal -->
    <div class="wizard-container">
      <!-- Header con logo -->
      <div class="wizard-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
            </svg>
          </div>
          <h1 class="logo-text">ByteWave ERP</h1>
        </div>
        <p class="wizard-subtitle">Asistente de Instalación</p>
      </div>

      <!-- Stepper -->
      <div class="stepper">
        <div 
          v-for="step in steps" 
          :key="step.number"
          class="step"
          :class="{
            'step-active': currentStep === step.number,
            'step-completed': currentStep > step.number,
            'step-pending': currentStep < step.number
          }"
        >
          <div class="step-indicator">
            <div class="step-circle">
              <svg v-if="currentStep > step.number" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span v-else>{{ step.number }}</span>
            </div>
            <div v-if="step.number < 3" class="step-line"></div>
          </div>
          <div class="step-content">
            <span class="step-title">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- Contenido del paso actual -->
      <div class="wizard-content">
        <Transition name="fade-slide" mode="out-in">
          <!-- Paso 1: Conexión a Base de Datos -->
          <div v-if="currentStep === 1" key="step1" class="step-panel">
            <div class="panel-header">
              <div class="panel-icon panel-icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 4.015 2 6.5v11C2 19.985 6.477 22 12 22s10-2.015 10-4.5v-11C22 4.015 17.523 2 12 2zm8 15.5c0 1.38-3.589 2.5-8 2.5s-8-1.12-8-2.5V9.41c1.945 1.08 4.82 1.59 8 1.59s6.055-.51 8-1.59V17.5zm0-11C20 7.88 16.411 9 12 9S4 7.88 4 6.5 7.589 4 12 4s8 1.12 8 2.5z"/>
                </svg>
              </div>
              <div>
                <h2 class="panel-title">Configurar Base de Datos</h2>
                <p class="panel-description">Ingresa las credenciales de conexión a tu servidor MySQL/MariaDB</p>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="connectionError" class="alert alert-error">
              <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{{ connectionError }}</span>
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="connectionSuccess" class="alert alert-success">
              <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <span>{{ connectionSuccess }}</span>
                <span v-if="serverVersion" class="text-sm block mt-1 opacity-75">Servidor: {{ serverVersion }}</span>
              </div>
            </div>

            <form @submit.prevent="handleTestConnection" class="form">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="host">Host del Servidor</label>
                  <input 
                    id="host" 
                    v-model="dbCredentials.host" 
                    type="text" 
                    placeholder="localhost"
                    required
                  />
                </div>
                <div class="form-group flex-1">
                  <label for="port">Puerto</label>
                  <input 
                    id="port" 
                    v-model.number="dbCredentials.port" 
                    type="number" 
                    placeholder="3306"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="user">Usuario</label>
                  <input 
                    id="user" 
                    v-model="dbCredentials.user" 
                    type="text" 
                    placeholder="root"
                    required
                  />
                </div>
                <div class="form-group flex-1">
                  <label for="password">Contraseña</label>
                  <input 
                    id="password" 
                    v-model="dbCredentials.password" 
                    type="password" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="database">Nombre de Base de Datos</label>
                <input 
                  id="database" 
                  v-model="dbCredentials.database" 
                  type="text" 
                  placeholder="bytewave"
                  required
                />
                <p class="form-hint">Si no existe, se creará automáticamente</p>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-secondary" :disabled="loading">
                  <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-if="loading">Probando...</span>
                  <span v-else>Probar Conexión</span>
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  :disabled="!connectionTested || loading"
                  @click="handleSaveAndContinue"
                >
                  Guardar y Continuar
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-icon-right">
                    <path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Paso 2: Inicializar Base de Datos -->
          <div v-else-if="currentStep === 2" key="step2" class="step-panel">
            <div class="panel-header">
              <div class="panel-icon panel-icon-teal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="panel-title">Inicializar Base de Datos</h2>
                <p class="panel-description">Se crearán las tablas necesarias para el funcionamiento del sistema</p>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="initError" class="alert alert-error">
              <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{{ initError }}</span>
            </div>

            <!-- Lista de tablas a crear -->
            <div class="tables-list">
              <h3 class="tables-title">Tablas a crear:</h3>
              <div class="tables-grid">
                <div 
                  v-for="table in tablesToCreate" 
                  :key="table.name" 
                  class="table-item"
                  :class="{
                    'table-created': tableResults[table.name] === 'success',
                    'table-error': tableResults[table.name] === 'error',
                    'table-pending': !tableResults[table.name]
                  }"
                >
                  <div class="table-status">
                    <svg v-if="tableResults[table.name] === 'success'" class="status-icon status-success" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <svg v-else-if="tableResults[table.name] === 'error'" class="status-icon status-error" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div v-else class="status-pending"></div>
                  </div>
                  <div class="table-info">
                    <span class="table-name">{{ table.name }}</span>
                    <span class="table-description">{{ table.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="prevStep" :disabled="loading">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-icon-left">
                  <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" />
                </svg>
                Atrás
              </button>
              <button 
                type="button" 
                class="btn btn-primary" 
                :disabled="loading || initCompleted"
                @click="handleInitDatabase"
              >
                <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="loading">Creando tablas...</span>
                <span v-else-if="initCompleted">Continuar</span>
                <span v-else>Inicializar Base de Datos</span>
              </button>
              <button 
                v-if="initCompleted"
                type="button" 
                class="btn btn-primary" 
                @click="nextStep"
              >
                Continuar
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-icon-right">
                  <path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Paso 3: Crear Administrador -->
          <div v-else-if="currentStep === 3" key="step3" class="step-panel">
            <div class="panel-header">
              <div class="panel-icon panel-icon-purple">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 class="panel-title">Crear Usuario Administrador</h2>
                <p class="panel-description">Configura las credenciales del primer usuario del sistema</p>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="adminError" class="alert alert-error">
              <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{{ adminError }}</span>
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="adminSuccess" class="alert alert-success">
              <svg class="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>{{ adminSuccess }}</span>
            </div>

            <form @submit.prevent="handleCreateAdmin" class="form">
              <div class="form-group">
                <label for="adminName">Nombre Completo</label>
                <input 
                  id="adminName" 
                  v-model="adminForm.name" 
                  type="text" 
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div class="form-group">
                <label for="adminEmail">Correo Electrónico</label>
                <input 
                  id="adminEmail" 
                  v-model="adminForm.email" 
                  type="email" 
                  placeholder="admin@empresa.com"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="adminPassword">Contraseña</label>
                  <input 
                    id="adminPassword" 
                    v-model="adminForm.password" 
                    type="password" 
                    placeholder="••••••••"
                    required
                    minlength="8"
                  />
                </div>
                <div class="form-group flex-1">
                  <label for="adminConfirmPassword">Confirmar Contraseña</label>
                  <input 
                    id="adminConfirmPassword" 
                    v-model="adminForm.confirmPassword" 
                    type="password" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <p class="form-hint">Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números</p>

              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="prevStep" :disabled="loading">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="btn-icon-left">
                    <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" />
                  </svg>
                  Atrás
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-if="loading">Creando...</span>
                  <span v-else>Completar Instalación</span>
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>

      <!-- Footer -->
      <div class="wizard-footer">
        <p>ByteWave ERP &copy; {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
});

const { 
  loading, 
  currentStep, 
  testConnection, 
  saveConfig, 
  initDatabase, 
  createAdmin,
  nextStep,
  prevStep,
  checkStatus 
} = useInstall();

// Definición de pasos
const steps = [
  { number: 1, title: 'Conexión' },
  { number: 2, title: 'Base de Datos' },
  { number: 3, title: 'Administrador' }
];

// Tablas a crear
const tablesToCreate = [
  { name: 'users', description: 'Usuarios del sistema' },
  { name: 'sessions', description: 'Sesiones activas' },
  { name: 'areas', description: 'Áreas y departamentos' },
  { name: 'activity_logs', description: 'Registro de actividad' },
  { name: 'system_logs', description: 'Logs del sistema' },
  { name: 'setup_completed', description: 'Estado de instalación' },
  { name: 'module_states', description: 'Estados de módulos' },
  { name: 'module_folders', description: 'Carpetas de módulos' },
  { name: 'folder_modules', description: 'Módulos en carpetas' },
  { name: 'user_icon_positions', description: 'Posiciones de iconos' },
  { name: 'modules', description: 'Módulos del sistema' }
];

// Estado del paso 1
const dbCredentials = reactive({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bytewave'
});
const connectionError = ref('');
const connectionSuccess = ref('');
const serverVersion = ref('');
const connectionTested = ref(false);

// Estado del paso 2
const initError = ref('');
const initCompleted = ref(false);
const tableResults = reactive<Record<string, 'success' | 'error' | null>>({});

// Estado del paso 3
const adminForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const adminError = ref('');
const adminSuccess = ref('');

// Verificar estado inicial
onMounted(async () => {
  const status = await checkStatus();
  if (status) {
    // Si ya está completamente instalado, redirigir al login
    if (status.currentStep === 0) {
      navigateTo('/login');
      return;
    }
    
    // Actualizar credenciales desde la configuración existente
    if (status.config) {
      dbCredentials.host = status.config.host || 'localhost';
      dbCredentials.port = parseInt(status.config.port) || 3306;
      dbCredentials.user = status.config.user || 'root';
      dbCredentials.database = status.config.database || 'bytewave';
    }

    // Si la conexión ya está OK, marcar como probada
    if (status.connectionOk) {
      connectionTested.value = true;
      connectionSuccess.value = 'Conexión configurada correctamente';
    }

    // Si las tablas ya existen, marcar como completado
    if (status.tablesExist) {
      initCompleted.value = true;
      tablesToCreate.forEach(t => {
        tableResults[t.name] = 'success';
      });
    }
  }
});

// Handlers
const handleTestConnection = async () => {
  connectionError.value = '';
  connectionSuccess.value = '';
  serverVersion.value = '';
  connectionTested.value = false;

  const result = await testConnection(dbCredentials);

  if (result.success) {
    connectionSuccess.value = result.message;
    serverVersion.value = result.serverVersion || '';
    connectionTested.value = true;
  } else {
    connectionError.value = result.message;
  }
};

const handleSaveAndContinue = async () => {
  connectionError.value = '';

  const result = await saveConfig(dbCredentials);

  if (result.success) {
    nextStep();
  } else {
    connectionError.value = result.message;
  }
};

const handleInitDatabase = async () => {
  initError.value = '';
  
  // Resetear resultados
  tablesToCreate.forEach(t => {
    tableResults[t.name] = null;
  });

  const result = await initDatabase();

  if (result.success) {
    // Marcar todas las tablas como exitosas
    if (result.results) {
      result.results.forEach((r: any) => {
        if (r.table !== 'database' && r.table !== 'setup_initial_record') {
          tableResults[r.table] = r.success ? 'success' : 'error';
        }
      });
    }
    tablesToCreate.forEach(t => {
      if (!tableResults[t.name]) {
        tableResults[t.name] = 'success';
      }
    });
    initCompleted.value = true;
  } else {
    initError.value = result.message;
    // Marcar tablas con sus resultados
    if (result.results) {
      result.results.forEach((r: any) => {
        if (r.table !== 'database' && r.table !== 'setup_initial_record') {
          tableResults[r.table] = r.success ? 'success' : 'error';
        }
      });
    }
  }
};

const handleCreateAdmin = async () => {
  adminError.value = '';
  adminSuccess.value = '';

  // Validar contraseñas
  if (adminForm.password !== adminForm.confirmPassword) {
    adminError.value = 'Las contraseñas no coinciden';
    return;
  }

  if (adminForm.password.length < 8) {
    adminError.value = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  const result = await createAdmin(adminForm.name, adminForm.email, adminForm.password);

  if (result.success) {
    adminSuccess.value = '¡Instalación completada! Redirigiendo al login...';
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigateTo('/login');
    }, 2000);
  } else {
    adminError.value = result.message;
  }
};
</script>

<style scoped>
/* Reset y base */
.install-wizard {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-x: hidden;
}

/* Fondo animado */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  z-index: 0;
}

.animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(10, 164, 164, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
  animation: gradientMove 20s ease infinite;
}

@keyframes gradientMove {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-2%, -2%); }
}

/* Contenedor principal */
.wizard-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 720px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.wizard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 3rem;
  height: 3rem;
  color: #0AA4A4;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.wizard-subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 160px;
}

.step-indicator {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-pending .step-circle {
  background: #334155;
  color: #64748b;
  border: 2px solid #475569;
}

.step-active .step-circle {
  background: linear-gradient(135deg, #0AA4A4, #0891b2);
  color: white;
  box-shadow: 0 4px 15px rgba(10, 164, 164, 0.4);
}

.step-completed .step-circle {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #334155;
  margin: 0 0.5rem;
  transition: background 0.3s ease;
}

.step-completed .step-line {
  background: linear-gradient(90deg, #10b981, #0AA4A4);
}

.step-title {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

.step-active .step-title {
  color: #0AA4A4;
  font-weight: 500;
}

.step-completed .step-title {
  color: #10b981;
}

/* Panel de contenido */
.wizard-content {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.step-panel {
  padding: 2rem;
}

.panel-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.panel-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.panel-icon-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
  color: #60a5fa;
}

.panel-icon-teal {
  background: linear-gradient(135deg, rgba(10, 164, 164, 0.2), rgba(10, 164, 164, 0.1));
  color: #0AA4A4;
}

.panel-icon-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
  color: #a78bfa;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.panel-description {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Alertas */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alert-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-error .alert-icon {
  color: #ef4444;
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.alert-success .alert-icon {
  color: #10b981;
}

/* Formularios */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.flex-1 {
  flex: 1;
}

.form-group.flex-2 {
  flex: 2;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
}

.form-group input {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input::placeholder {
  color: #64748b;
}

.form-group input:focus {
  outline: none;
  border-color: #0AA4A4;
  box-shadow: 0 0 0 3px rgba(10, 164, 164, 0.2);
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: -0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #0AA4A4, #0891b2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0891b2, #0AA4A4);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(10, 164, 164, 0.4);
}

.btn-secondary {
  background: #334155;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #475569;
}

.btn-outline {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.3);
  border-color: #64748b;
}

.btn-icon-left {
  width: 1rem;
  height: 1rem;
}

.btn-icon-right {
  width: 1rem;
  height: 1rem;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Lista de tablas */
.tables-list {
  margin-bottom: 1.5rem;
}

.tables-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.table-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.table-item.table-created {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.table-item.table-error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.table-status {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.status-success {
  color: #10b981;
}

.status-error {
  color: #ef4444;
}

.status-pending {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #475569;
}

.table-info {
  display: flex;
  flex-direction: column;
}

.table-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.table-description {
  font-size: 0.75rem;
  color: #64748b;
}

/* Footer */
.wizard-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #64748b;
  font-size: 0.75rem;
}

/* Transiciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 640px) {
  .install-wizard {
    padding: 1rem;
  }
  
  .step-panel {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .tables-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .stepper {
    gap: 0;
  }
  
  .step-title {
    font-size: 0.65rem;
  }
  
  .step-circle {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
}
</style>
