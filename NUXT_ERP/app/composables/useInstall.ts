/**
 * Composable para manejar el wizard de instalación
 */

export interface InstallStatus {
    connectionOk: boolean;
    databaseExists: boolean;
    tablesExist: boolean;
    hasAdminUser: boolean;
    currentStep: number;
    missingTables: string[];
    errorMessage: string;
    config: {
        host: string;
        port: string;
        database: string;
        user: string;
    };
}

export interface TestConnectionResult {
    success: boolean;
    message: string;
    serverVersion?: string;
    databaseExists?: boolean;
    errorCode?: string;
}

export interface DatabaseCredentials {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export const useInstall = () => {
    // Estado
    const status = useState<InstallStatus | null>('install_status', () => null);
    const loading = useState('install_loading', () => false);
    const error = useState<string | null>('install_error', () => null);
    const currentStep = useState('install_step', () => 1);

    /**
     * Verifica el estado actual de la instalación
     */
    const checkStatus = async (): Promise<InstallStatus | null> => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<InstallStatus>('/api/install/status');
            status.value = result;
            currentStep.value = result.currentStep || 1;
            return result;
        } catch (e: any) {
            error.value = e.message || 'Error al verificar estado de instalación';
            // Si hay error de conexión, asumir paso 1
            currentStep.value = 1;
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Prueba una conexión con credenciales personalizadas
     */
    const testConnection = async (credentials: DatabaseCredentials): Promise<TestConnectionResult> => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<TestConnectionResult>('/api/install/test-connection', {
                method: 'POST',
                body: credentials
            });
            return result;
        } catch (e: any) {
            const message = e.data?.message || e.message || 'Error al probar conexión';
            error.value = message;
            return {
                success: false,
                message,
                errorCode: e.data?.errorCode
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Guarda la configuración en el archivo .env
     */
    const saveConfig = async (credentials: DatabaseCredentials): Promise<{ success: boolean; message: string }> => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<{ success: boolean; message: string; note?: string }>('/api/install/save-config', {
                method: 'POST',
                body: credentials
            });
            return result;
        } catch (e: any) {
            const message = e.data?.message || e.message || 'Error al guardar configuración';
            error.value = message;
            return {
                success: false,
                message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Inicializa la base de datos (crea tablas)
     */
    const initDatabase = async (): Promise<{
        success: boolean;
        message: string;
        results?: any[];
    }> => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<{
                success: boolean;
                message: string;
                results?: any[];
                tablesCreated?: number;
            }>('/api/install/init-database', {
                method: 'POST'
            });
            return result;
        } catch (e: any) {
            const message = e.data?.message || e.message || 'Error al inicializar base de datos';
            error.value = message;
            return {
                success: false,
                message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Crea el primer usuario administrador
     */
    const createAdmin = async (name: string, email: string, password: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<{
                success: boolean;
                message: string;
                user?: any;
            }>('/api/auth/setup', {
                method: 'POST',
                body: { name, email, password }
            });
            return {
                success: result.success,
                message: result.message
            };
        } catch (e: any) {
            const message = e.data?.message || e.message || 'Error al crear administrador';
            error.value = message;
            return {
                success: false,
                message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Verifica si la instalación está completa
     */
    const isInstallComplete = computed(() => {
        return status.value?.currentStep === 0;
    });

    /**
     * Avanza al siguiente paso
     */
    const nextStep = () => {
        if (currentStep.value < 3) {
            currentStep.value++;
        }
    };

    /**
     * Retrocede al paso anterior
     */
    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
        }
    };

    /**
     * Va a un paso específico
     */
    const goToStep = (step: number) => {
        if (step >= 1 && step <= 3) {
            currentStep.value = step;
        }
    };

    return {
        // Estado
        status: readonly(status),
        loading: readonly(loading),
        error: readonly(error),
        currentStep,
        isInstallComplete,

        // Métodos
        checkStatus,
        testConnection,
        saveConfig,
        initDatabase,
        createAdmin,
        nextStep,
        prevStep,
        goToStep
    };
};
