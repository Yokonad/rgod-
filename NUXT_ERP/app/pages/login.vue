<template>
  <NuxtLayout name="auth">
    <div class="login-container">
      <!-- Logo EJE -->
      <div class="login-header">
        <img src="/logoeje.png" alt="EJE ERP" class="logo-image" />
      </div>

      <!-- Login Form Card con glassmorphism -->
      <div class="login-card">
        <!-- Subtítulo dentro del card -->
        <p class="subtitle">Sistema de Gestión Empresarial</p>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Mensaje de error con glassmorphism -->
          <div v-if="errorMessage" class="error-message">
            <img src="/Icons_svg/alert-circle.svg" alt="Error" class="error-icon" />
            <p>{{ errorMessage }}</p>
          </div>

          <!-- Campo: Email con icono -->
          <div class="form-group">
            <label for="email" class="form-label">
              CORREO ELECTRÓNICO
            </label>
            <div class="input-wrapper">
              <img src="/Icons_svg/mail.svg" alt="Email" class="input-icon" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                autofocus
                class="form-input"
                placeholder="admin@bytewave.com"
              />
            </div>
          </div>

          <!-- Campo: Contraseña con icono y toggle -->
          <div class="form-group">
            <label for="password" class="form-label">
              CONTRASEÑA
            </label>
            <div class="input-wrapper">
              <img src="/Icons_svg/lock.svg" alt="Contraseña" class="input-icon" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="form-input"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="toggle-password"
                :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <img 
                  :src="showPassword ? '/Icons_svg/eye-off.svg' : '/Icons_svg/eye.svg'" 
                  alt="Toggle" 
                  class="toggle-icon"
                />
              </button>
            </div>
          </div>

          <!-- Botón Submit con gradiente -->
          <button
            type="submit"
            :disabled="loading"
            class="submit-button"
          >
            <span v-if="loading" class="button-content">
              <svg class="spinner" viewBox="0 0 24 24">
                <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </span>
            <span v-else class="button-content">
              <img src="/Icons_svg/log-in.svg" alt="Login" class="button-icon" />
              INICIAR SESIÓN
            </span>
          </button>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { login, loading, checkSetupStatus } = useAuth();

const form = reactive({
  email: '',
  password: ''
});

const errorMessage = ref('');
const showPassword = ref(false);

// Verificar que el setup esté completo
onMounted(async () => {
  const status = await checkSetupStatus();
  if (status.needsSetup) {
    navigateTo('/setup');
  }
});

const handleSubmit = async () => {
  errorMessage.value = '';

  const result = await login(form.email, form.password);

  if (result.success) {
    // Redirigir al dashboard
    navigateTo('/dashboard');
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<style scoped>
/* Variables locales */
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  --text-primary: #ffffff;
}

body.dark-mode {
  --glass-bg: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
}

/* Container principal */
.login-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Header del login */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-image {
  max-width: 200px;
  height: auto;
  animation: fadeInDown 0.8s ease-out;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3));
  display: block;
  margin: 0 auto;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subtitle {
  font-size: 1.125rem;
  color: #ffffff;
  margin: 0 0 2rem 0;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  letter-spacing: 0.5px;
}

/* Card con glassmorphism */
.login-card {
  background: var(--glass-bg);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  padding: 2.5rem;
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 12px 48px rgba(6, 7, 7, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Mensaje de error */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1rem;
  color: #fecaca;
  font-size: 0.875rem;
  font-weight: 500;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
  opacity: 0.9;
  flex-shrink: 0;
}

/* Grupos de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: var(--text-dark);
  font-size: 0.875rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
}

/* Input wrapper con icono */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
  opacity: 0.7;
  pointer-events: none;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Toggle mostrar/ocultar contraseña */
.toggle-password {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 2;
}

.toggle-password:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-password:active {
  transform: scale(0.95);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.toggle-password:hover .toggle-icon {
  opacity: 1;
}

/* Botón submit con gradiente */
.submit-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #0AA4A4 0%, #2F6FBF 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(10, 164, 164, 0.4);
  letter-spacing: 0.3px;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(10, 164, 164, 0.5);
  background: linear-gradient(135deg, #08C6B6 0%, #2F6FBF 100%);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(10, 164, 164, 0.4);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

/* Spinner de carga */
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner-circle {
  opacity: 0.25;
}

.spinner-path {
  opacity: 0.75;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .logo-image {
    max-width: 160px;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>
