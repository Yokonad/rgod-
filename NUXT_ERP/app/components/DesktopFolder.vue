<template>
  <div 
    class="desktop-folder"
    :class="{ 'folder-dragging': isDragging }"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :draggable="draggable"
  >
    <div class="folder-icon-container" :style="{ background: gradient || folderGradient }">
      <img 
        v-if="icon && icon.endsWith('.svg')" 
        :src="`/Icons_svg/${icon}`" 
        class="folder-icon-svg" 
        :alt="title"
      />
      <svg v-else class="folder-icon-default" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div v-if="moduleCount > 0" class="folder-badge">{{ moduleCount }}</div>
    </div>
    <p class="folder-title">{{ title }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string;
  icon?: string;
  gradient?: string;
  moduleCount?: number;
  folderId: number;
  draggable?: boolean;
}>(), {
  moduleCount: 0,
  draggable: false
});

const emit = defineEmits<{
  open: [folderId: number];
  dragstart: [event: DragEvent];
  dragend: [event: DragEvent];
}>();

const isDragging = ref(false);

const folderGradient = computed(() => {
  return props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
});

const handleClick = () => {
  emit('open', props.folderId);
};

const handleDragStart = (event: DragEvent) => {
  if (!props.draggable) return;
  
  isDragging.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
  
  emit('dragstart', event);
};

const handleDragEnd = (event: DragEvent) => {
  isDragging.value = false;
  emit('dragend', event);
};
</script>

<style scoped>
.desktop-folder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  user-select: none;
  animation: fadeInScale 0.4s ease-out backwards;
  position: relative;
}

.desktop-folder[draggable="true"] {
  cursor: grab;
}

.desktop-folder[draggable="true"]:active {
  cursor: grabbing;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.desktop-folder:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px) scale(1.02);
}

.desktop-folder:active {
  transform: translateY(-2px) scale(0.98);
}

.folder-dragging {
  opacity: 0.3;
  transform: scale(0.9);
  filter: blur(1px);
}

.folder-icon-container {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  position: relative;
}

.desktop-folder:hover .folder-icon-container {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  transform: scale(1.05);
}

.folder-icon-svg {
  width: 48px;
  height: 48px;
  filter: brightness(0) invert(1);
}

.folder-icon-default {
  width: 48px;
  height: 48px;
}

.folder-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.folder-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode */
body.dark-mode .desktop-folder:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
