/**
 * Definiciones de tipos para módulos externos
 * Permite que TypeScript reconozca los composables de Nuxt en archivos fuera del directorio app/
 */

declare module '#imports' {
  export function useAuth(): {
    user: any;
    isAuthenticated: boolean;
    logout: () => void;
  };
  
  export function useTheme(): {
    isDarkMode: import('vue').Ref<boolean>;
    toggleDarkMode: () => void;
  };
}

// Declaraciones globales para Nuxt auto-imports
declare global {
  const ref: typeof import('vue').ref;
  const computed: typeof import('vue').computed;
  const watch: typeof import('vue').watch;
  const onMounted: typeof import('vue').onMounted;
  const onUnmounted: typeof import('vue').onUnmounted;
  const nextTick: typeof import('vue').nextTick;
  const useState: typeof import('#app').useState;
  const useRouter: typeof import('vue-router').useRouter;
  const useRoute: typeof import('vue-router').useRoute;
  const navigateTo: typeof import('#app').navigateTo;
  const useTheme: typeof import('~/composables/useTheme').useTheme;
  const useAuth: typeof import('~/composables/useAuth').useAuth;
}

export {};
