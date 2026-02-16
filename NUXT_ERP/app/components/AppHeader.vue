<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Left: Back button + Module title -->
      <div class="header-left">
        <button @click="goToDashboard" class="back-button" title="Volver al Dashboard">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <div class="module-info">
          <h1 class="module-title">{{ title }}</h1>
          <p v-if="subtitle" class="module-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <!-- Right: Theme toggle + User menu -->
      <div class="header-right">
        <!-- Theme Toggle -->
        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
          <svg v-if="isDark" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </button>

        <!-- User Info -->
        <div class="user-section">
          <div class="user-info">
            <span class="user-name">{{ user?.name }}</span>
            <span class="user-role">{{ user?.role === 'admin' ? 'Administrador' : 'Usuario' }}</span>
          </div>
          <div class="user-avatar">
            {{ user?.name?.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

const props = defineProps<Props>();
const { user } = useAuth();

// Theme management
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

const goToDashboard = () => {
  navigateTo('/dashboard');
};

// Load theme preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
}

.dark .app-header {
  background: #1f2937;
  border-bottom-color: #374151;
}

.header-content {
  max-width: 1920px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.back-button:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
  transform: translateX(-2px);
}

.dark .back-button {
  background: #374151;
  color: #9ca3af;
}

.dark .back-button:hover {
  background: #4b5563;
  color: #f3f4f6;
  border-color: #6b7280;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.module-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.dark .module-title {
  color: #f9fafb;
}

.module-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .module-subtitle {
  color: #9ca3af;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #f59e0b;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.theme-toggle:hover {
  background: #fef3c7;
  border-color: #fde68a;
  transform: rotate(15deg);
}

.dark .theme-toggle {
  background: #374151;
  color: #fbbf24;
}

.dark .theme-toggle:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.dark .user-section {
  background: #374151;
  border-color: #4b5563;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.dark .user-name {
  color: #f9fafb;
}

.user-role {
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
}

.dark .user-role {
  color: #9ca3af;
  background: #4b5563;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .user-avatar {
  border-color: #374151;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0.75rem 1rem;
  }

  .module-title {
    font-size: 1.25rem;
  }

  .user-info {
    display: none;
  }
}
</style>
