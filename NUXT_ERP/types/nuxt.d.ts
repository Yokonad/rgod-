// Definiciones de tipos para Nuxt auto-imports
declare global {
  const $fetch: typeof import('ofetch').$fetch;
  const navigateTo: typeof import('#app').navigateTo;
  const useAuth: typeof import('~/composables/useAuth').useAuth;
  const useTheme: typeof import('~/composables/useTheme').useTheme;
  const useRouter: typeof import('vue-router').useRouter;
  const useRoute: typeof import('vue-router').useRoute;
}

export {};
