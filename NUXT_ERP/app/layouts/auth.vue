<template>
  <div class="auth-layout">
    <!-- Fondo animado con gradiente teal/blue -->
    <div class="animated-background"></div>
    
    <!-- Indicador de conexión a BD -->
    <DatabaseStatus />
    
    <!-- Contenedor principal -->
    <div class="auth-container">
      <div class="auth-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Este layout se usa para páginas de autenticación (login, setup)
</script>

<style scoped>
.auth-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fondo animado con gradiente */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0AA4A4 0%, #2F6FBF 50%, #0AA4A4 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

/* Animación sutil del gradiente */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Dark mode - gradiente más oscuro */
body.dark-mode .animated-background {
  background: linear-gradient(135deg, #087A7A 0%, #1a4d8f 50%, #087A7A 100%);
  background-size: 200% 200%;
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-content {
  width: 100%;
  max-width: 480px;
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

/* Responsive */
@media (max-width: 640px) {
  .auth-content {
    max-width: 100%;
  }
}
</style>
