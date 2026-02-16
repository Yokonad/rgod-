export const useTheme = () => {
    const isDarkMode = useState('theme_dark_mode', () => {
        if (process.client) {
            const saved = localStorage.getItem('bytewave_dark_mode');
            return saved === 'true';
        }
        return false;
    });

    // Sincronizar con localStorage y DOM
    if (process.client) {
        watch(isDarkMode, (newValue) => {
            localStorage.setItem('bytewave_dark_mode', String(newValue));
            document.documentElement.classList.toggle('dark', newValue);
            document.body.classList.toggle('dark-mode', newValue);
        }, { immediate: true });
    }

    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    return {
        isDarkMode,
        toggleDarkMode
    };
};
