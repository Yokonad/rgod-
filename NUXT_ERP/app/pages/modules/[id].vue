<template>
  <div v-if="error" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center max-w-md">
      <svg class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Módulo no disponible</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="navigateTo('/dashboard')"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Volver al Dashboard
      </button>
    </div>
  </div>

  <component v-if="!loading && !error" :is="moduleComponent" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();
const moduleId = computed(() => route.params.id as string);

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const moduleComponent = shallowRef<any>(null);

// Cargar el módulo dinámicamente
const loadModule = async () => {
  try {
    loading.value = true;
    error.value = false;

    // Usar import.meta.glob para que Vite pueda analizar los archivos dinámicos
    const modules = import.meta.glob('../../../MODULOS/*/index.vue');
    let modulePath = `../../../MODULOS/${moduleId.value}/index.vue`;
    
    // Si no encuentra la ruta exacta, intentar buscar una coincidencia insensible a mayúsculas o parcial
    if (!modules[modulePath]) {
      console.warn(`Ruta exacta no encontrada: ${modulePath}. Buscando coincidencias...`);
      const availablePaths = Object.keys(modules);
      
      // 1. Busqueda insensible a mayúsculas
      const caseInsensitiveMatch = availablePaths.find(path => 
        path.toLowerCase().includes(`/modulos/${moduleId.value.toLowerCase()}/index.vue`)
      );

      // 2. Busqueda por coincidencia de nombre de carpeta (fix para FACTURAS-BTW)
      const folderMatch = availablePaths.find(path => {
        const parts = path.split('/');
        // La estructura es ../../../MODULOS/[FOLDER]/index.vue
        // El folder suele ser el antepenúltimo elemento (index.vue is last)
        const folderName = parts[parts.length - 2];
        return folderName === moduleId.value || 
               folderName.toLowerCase() === moduleId.value.toLowerCase() ||
               (moduleId.value === 'facturas' && folderName === 'facturasbtw'); // Fallback para enlaces antiguos
      });

      if (caseInsensitiveMatch) modulePath = caseInsensitiveMatch;
      else if (folderMatch) modulePath = folderMatch;
    }

    const loader = modules[modulePath];
    
    if (!loader) {
      console.error(`No se encontró el componente en: ${modulePath}`);
      console.log('Módulos disponibles:', Object.keys(modules));
      throw new Error('El módulo no tiene un componente index.vue válido');
    }

    const component: any = await loader();
    moduleComponent.value = component.default || component;

  } catch (err: any) {
    console.error('Error cargando módulo:', err);
    error.value = true;
    errorMessage.value = err.message || 'Error al cargar el módulo';
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  loadModule();
});

// Recargar si cambia el ID del módulo
watch(moduleId, () => {
  loadModule();
});
</script>