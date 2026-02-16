export default defineNuxtRouteMiddleware(async (to, from) => {
  // Si ya estamos en /install, no hacer nada
  if (to.path === '/install' || to.path.startsWith('/install')) {
    return;
  }

  // En el servidor, verificar configuración e instalación
  if (import.meta.server) {
    const config = useRuntimeConfig();

    // Si no hay contraseña de BD configurada, el sistema no está instalado
    // Redirigir a /install
    if (!config.dbPassword) {
      return navigateTo('/install');
    }

    // Verificar autenticación con cookie
    const authToken = useCookie('bytewave_auth_token');
    const isAuthenticated = !!authToken.value;

    // Rutas públicas (después de instalación)
    const publicRoutes = ['/login', '/'];
    const isPublicRoute = publicRoutes.includes(to.path);

    // Si no está autenticado y no es ruta pública, redirigir a login
    if (!isAuthenticated && !isPublicRoute) {
      return navigateTo('/login');
    }

    // Si está autenticado y va a login, redirigir al dashboard
    if (isAuthenticated && to.path === '/login') {
      return navigateTo('/dashboard');
    }

    return;
  }

  // En el cliente, verificar instalación primero
  try {
    const installStatus = await $fetch<{ currentStep: number }>('/api/install/status');

    // Si la instalación no está completa, redirigir a /install
    if (installStatus && installStatus.currentStep > 0) {
      return navigateTo('/install');
    }
  } catch (error) {
    // Si hay error al verificar estado (ej: sin conexión), ir a /install
    console.error('Error verificando estado de instalación:', error);
    return navigateTo('/install');
  }

  // Verificar autenticación en cliente
  const { isAuthenticated, initAuth } = useAuth();
  await initAuth();

  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(to.path);

  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/login');
  }

  // Si está autenticado y va a login, redirigir al dashboard
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});

