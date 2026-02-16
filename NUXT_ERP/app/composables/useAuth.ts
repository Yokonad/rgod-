export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  area_id?: number;
  area_name?: string;
  is_first_user: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const TOKEN_KEY = 'bytewave_auth_token';

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null);
  const token = useState<string | null>('auth_token', () => null);
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const loading = useState('auth_loading', () => false);

  /**
   * Inicializa la autenticación desde el localStorage
   */
  const initAuth = async () => {
    if (process.server) return;
    if (isAuthenticated.value) return;

    loading.value = true;

    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        token.value = storedToken;
        await fetchUser();
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene la información del usuario autenticado
   */
  const fetchUser = async () => {
    if (!token.value) return;

    try {
      const response = await $fetch<{ success: boolean; user: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });

      if (response.success && response.user) {
        user.value = response.user;
      } else {
        // Token inválido, limpiar sesión sin hacer petición de logout
        user.value = null;
        token.value = null;
        if (process.client) {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (error) {
      // Token inválido o expirado, limpiar sesión silenciosamente
      user.value = null;
      token.value = null;
      if (process.client) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  };

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (email: string, password: string) => {
    loading.value = true;

    try {
      const response = await $fetch<{
        success: boolean;
        token: string;
        user: User;
        message: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success && response.token) {
        token.value = response.token;
        user.value = response.user;

        if (process.client) {
          localStorage.setItem(TOKEN_KEY, response.token);
        }

        return { success: true, message: response.message };
      }

      return { success: false, message: response.message || 'Error al iniciar sesión' };
    } catch (error: any) {
      // Solo mostrar error si no es el intento automático de validación de token
      if (error.statusCode !== 401) {
        console.error('Error en login:', error);
      }
      return {
        success: false,
        message: error.data?.message || 'Error al iniciar sesión'
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cierra la sesión actual
   */
  const logout = async () => {
    loading.value = true;

    try {
      if (token.value) {
        // Intentar cerrar sesión en el servidor, pero no fallar si hay error
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }).catch(() => {
          // Ignorar errores al hacer logout (ej: token ya expirado)
        });
      }
    } finally {
      user.value = null;
      token.value = null;

      if (process.client) {
        localStorage.removeItem(TOKEN_KEY);
      }

      loading.value = false;

      // Redirigir a login
      await navigateTo('/login');
    }
  };

  /**
   * Registra el primer usuario (setup inicial)
   */
  const setupFirstUser = async (name: string, email: string, password: string) => {
    loading.value = true;

    try {
      const response = await $fetch<{
        success: boolean;
        message: string;
        user?: User;
      }>('/api/auth/setup', {
        method: 'POST',
        body: { name, email, password }
      });

      if (response.success) {
        return { success: true, message: response.message };
      }

      return { success: false, message: response.message || 'Error en el setup' };
    } catch (error: any) {
      console.error('Error en setup:', error);
      return {
        success: false,
        message: error.data?.message || 'Error en el setup inicial'
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Verifica el estado del setup
   */
  const checkSetupStatus = async () => {
    try {
      const response = await $fetch<{
        setupCompleted: boolean;
        hasUsers: boolean;
        needsSetup: boolean;
      }>('/api/auth/setup');

      return response;
    } catch (error) {
      console.error('Error verificando setup:', error);
      return { setupCompleted: false, hasUsers: false, needsSetup: true };
    }
  };

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),
    initAuth,
    fetchUser,
    login,
    logout,
    setupFirstUser,
    checkSetupStatus
  };
};
