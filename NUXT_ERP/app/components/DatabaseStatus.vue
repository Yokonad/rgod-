<template>
  <div class="fixed top-4 right-4 z-50">
    <div
      class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300"
      :class="statusClasses"
    >
      <!-- Indicador animado -->
      <div class="relative flex h-3 w-3">
        <span
          v-if="status === 'connected'"
          class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
        ></span>
        <span
          class="relative inline-flex h-3 w-3 rounded-full"
          :class="dotClasses"
        ></span>
      </div>

      <!-- Contenido -->
      <div class="flex flex-col">
        <span class="text-sm font-semibold">{{ statusText }}</span>
        <span v-if="dbName && status === 'connected'" class="text-xs opacity-80">
          {{ dbName }}
        </span>
        <span v-if="lastUpdate" class="text-xs opacity-60">
          {{ formatTime(lastUpdate) }}
        </span>
      </div>

      <!-- Botón de actualización -->
      <button
        @click="refreshStatus"
        class="ml-2 rounded p-1 transition-colors hover:bg-black/10"
        :disabled="loading"
        title="Actualizar estado"
      >
        <svg
          class="h-4 w-4 transition-transform"
          :class="{ 'animate-spin': loading }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface DbStatus {
  status: 'connected' | 'disconnected' | 'error' | 'checking';
  message: string;
  timestamp?: string;
  database?: string;
}

const status = ref<DbStatus['status']>('checking');
const message = ref('Verificando conexión...');
const lastUpdate = ref<string>('');
const dbName = ref<string>('');
const loading = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;

const statusClasses = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100';
    case 'disconnected':
      return 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100';
    case 'error':
      return 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100';
    default:
      return 'border-gray-500 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100';
  }
});

const dotClasses = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-green-500';
    case 'disconnected':
      return 'bg-red-500';
    case 'error':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
});

const statusText = computed(() => {
  switch (status.value) {
    case 'connected':
      return '✓ Base de datos conectada';
    case 'disconnected':
      return '✗ Base de datos desconectada';
    case 'error':
      return '⚠ Error de conexión';
    default:
      return '⟳ Verificando...';
  }
});

async function checkStatus() {
  try {
    loading.value = true;
    const response = await $fetch<DbStatus>('/api/db-status');
    
    status.value = response.status;
    message.value = response.message;
    lastUpdate.value = response.timestamp || new Date().toISOString();
    if (response.database) {
      dbName.value = response.database;
    }
  } catch (error: any) {
    status.value = 'error';
    message.value = error.message || 'Error al verificar la conexión';
    lastUpdate.value = new Date().toISOString();
  } finally {
    loading.value = false;
  }
}

function refreshStatus() {
  checkStatus();
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

onMounted(() => {
  // Verificar inmediatamente
  checkStatus();
  
  // Actualizar cada 5 segundos
  intervalId = setInterval(() => {
    checkStatus();
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
