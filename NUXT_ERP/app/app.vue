<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'es'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  script: [
    {
      innerHTML: `(function() {
        try {
          var saved = localStorage.getItem('bytewave_dark_mode');
          if (saved === 'true') {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        } catch (e) {}
      })()`
    }
  ]
});

const { initAuth } = useAuth();

// Inicializar autenticación y tema al cargar la app
onMounted(async () => {
  // El composable useTheme ya maneja la inicialización automáticamente
  useTheme();

  await initAuth();
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#__nuxt {
  width: 100%;
  height: 100%;
}
</style>
