<template>
  <button
    @click="handleClick"
    class="app-icon"
    :class="{ 'icon-dragging': isDragging }"
    :title="title"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div 
      class="icon-image" 
      :class="isCustomColor ? '' : `gradient-${gradientColor}`"
      :style="customGradientStyle"
    >
      <img 
        :src="`/Icons_svg/${icon}.svg`" 
        :alt="title"
        class="module-icon"
      />
    </div>
    <span class="icon-label">{{ title }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  icon: string;
  gradient?: string;
  moduleName?: string;
  draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gradient: 'teal',
  draggable: false
});

// Detectar si es un color RGBA, Hex o gradiente personalizado
const isCustomColor = computed(() => {
  return props.gradient.includes('rgba') || props.gradient.includes('linear-gradient') || props.gradient.startsWith('#');
});

// Crear estilo de gradiente personalizado
const customGradientStyle = computed(() => {
  if (isCustomColor.value) {
    // Si ya es un linear-gradient, usarlo directamente
    if (props.gradient.includes('linear-gradient')) {
      return { background: props.gradient };
    }
    // Si es RGBA, crear gradiente simple
    return { background: props.gradient };
  }
  return {};
});

// Normalizar el gradiente a un nombre de color
const gradientColor = computed(() => {
  if (isCustomColor.value) return '';
  const grad = props.gradient.toLowerCase();
  
  // Si comienza con # es un color custom
  if (grad.startsWith('#')) return '';

  // Si viene como nombre de color, usarlo directamente
  if (['purple', 'blue', 'teal', 'green', 'orange', 'red', 'pink', 'indigo', 'cyan'].includes(grad)) {
    return grad;
  }
  return 'teal';
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'open'): void;
  (e: 'dragstart', event: DragEvent): void;
  (e: 'dragend', event: DragEvent): void;
}>();

const isDragging = ref(false);

const handleClick = () => {
  emit('open');
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
/* Estilo iPad - igual a ERP Flask */
.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.app-icon[draggable="true"] {
  cursor: grab;
}

.app-icon[draggable="true"]:active {
  cursor: grabbing;
}

.icon-dragging {
  opacity: 0.3;
  transform: scale(0.9);
  filter: blur(1px);
}

.icon-image {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Gradientes fijos por color */
.gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-teal {
  background: linear-gradient(135deg, #0AA4A4 0%, #08C6B6 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.gradient-red {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-pink {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.gradient-indigo {
  background: linear-gradient(135deg, #2F6FBF 0%, #0AA4A4 100%);
}

.gradient-cyan {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

/* Efecto de brillo en hover */
.icon-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.app-icon:hover .icon-image::before {
  left: 100%;
}

.app-icon:hover .icon-image {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.app-icon:active .icon-image {
  transform: translateY(-4px) scale(0.98);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.module-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.95;
  transition: all 0.3s ease;
}

.app-icon:hover .module-icon {
  transform: scale(1.1);
  opacity: 1;
}

.icon-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
  max-width: 110px;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.app-icon:hover .icon-label {
  color: white;
  transform: translateY(-2px);
}

/* Animación de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-icon {
  animation: fadeInUp 0.5s ease backwards;
}

/* Dark mode adjustments */
body.dark-mode .icon-image {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

body.dark-mode .app-icon:hover .icon-image {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
}
</style>
