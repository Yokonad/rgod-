<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-900">
    <div class="text-center">
      <div class="inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-teal-200 border-t-teal-600">
      </div>
      <p class="mt-4 text-gray-400">Verificando instalación...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { checkStatus } = useInstall();
const { checkSetupStatus, isAuthenticated } = useAuth();

onMounted(async () => {
  try {
    // Primero verificar el estado de instalación
    const installStatus = await checkStatus();
    
    // Si la instalación no está completa, ir al wizard
    if (installStatus && installStatus.currentStep > 0) {
      await navigateTo('/install');
      return;
    }
    
    // Si está instalado, verificar autenticación
    const authStatus = await checkSetupStatus();
    
    if (authStatus.needsSetup) {
      // No hay usuarios, ir al wizard de instalación paso 3
      await navigateTo('/install');
    } else if (isAuthenticated.value) {
      // Ya está autenticado, ir al dashboard
      await navigateTo('/dashboard');
    } else {
      // Hay usuarios pero no está autenticado, ir al login
      await navigateTo('/login');
    }
  } catch (e) {
    console.error('Index: error in mounted:', e);
    // Si hay error (ej: no hay BD), ir al wizard de instalación
    await navigateTo('/install');
  }
});
</script>
