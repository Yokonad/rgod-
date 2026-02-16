<template>
  <button
    @click="$emit('click')"
    class="module-card group"
  >
    <div class="module-icon-container">
      <div class="module-icon">
        <svg v-if="icon === 'users'" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else-if="icon === 'dashboard'" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
        <svg v-else class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    </div>

    <div class="module-content">
      <h3 class="module-title">{{ title }}</h3>
      <p class="module-description">{{ description }}</p>
      
      <div class="module-footer">
        <span class="module-badge" :class="badgeClass">
          {{ badgeText }}
        </span>
        <svg class="module-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  icon: string;
  accessLevel: 'public' | 'user' | 'admin' | 'mixed';
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'click'): void;
}>();

const badgeText = computed(() => {
  switch (props.accessLevel) {
    case 'admin': return 'Solo Admin';
    case 'user': return 'Usuario';
    case 'mixed': return 'Mixto';
    case 'public': return 'Público';
    default: return 'Usuario';
  }
});

const badgeClass = computed(() => {
  switch (props.accessLevel) {
    case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'user': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'mixed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'public': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  }
});
</script>

<style scoped>
.module-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.module-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.module-card:hover::before {
  transform: scaleX(1);
}

.dark .module-card {
  background: #1f2937;
  border-color: #374151;
}

.dark .module-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.3);
}

.module-icon-container {
  flex-shrink: 0;
}

.module-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
}

.group:hover .module-icon {
  transform: scale(1.1) rotate(5deg);
}

.module-content {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.375rem;
  transition: color 0.2s;
}

.dark .module-title {
  color: #f9fafb;
}

.module-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.dark .module-description {
  color: #9ca3af;
}

.module-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.module-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.group:hover .module-arrow {
  color: #667eea;
  transform: translateX(4px);
}
</style>
