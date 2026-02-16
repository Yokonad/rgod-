<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navbar -->
    <nav class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <!-- Logo -->
            <div class="flex flex-shrink-0 items-center">
              <h1 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ByteWave ERP
              </h1>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/dashboard"
                class="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Dashboard
              </NuxtLink>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center">
            <DatabaseStatus />
            
            <div class="ml-3 flex items-center space-x-4">
              <span v-if="user" class="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">
                {{ user.name }}
              </span>
              
              <button
                @click="handleLogout"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};
</script>
