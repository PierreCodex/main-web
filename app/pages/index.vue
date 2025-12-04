<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [[{
  label: 'Nueva anécdota',
  icon: 'i-lucide-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <div class="flex items-center gap-2">
            <span class="text-2xl">💔</span>
            <span class="font-bold text-transparent bg-clip-text bg-linear-to-r from-rose-500 via-pink-500 to-rose-600">RNI</span>
          </div>
        </template>

        <template #right>
          <AppearanceToggle />

          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UButton 
            icon="i-lucide-plus" 
            size="md" 
            class="rounded-full bg-rose-500 hover:bg-rose-600"
            to="/customers"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Hero Section -->
        <div class="relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-8 shadow-xl">
          <!-- Decoraciones -->
          <div class="absolute inset-0 opacity-20">
            <div class="absolute top-0 right-0 size-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div class="absolute bottom-0 left-0 size-48 bg-white rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          </div>
          
          <!-- Emojis decorativos -->
          <div class="absolute top-4 right-8 text-4xl opacity-30 animate-bounce">💔</div>
          <div class="absolute bottom-4 right-24 text-3xl opacity-20">🚫</div>
          <div class="absolute top-12 right-32 text-2xl opacity-25">👀</div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-4">
              <div class="flex items-center justify-center size-16 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <span class="text-4xl">💔</span>
              </div>
              <div>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-white">
                  Registro Nacional de Infieles
                </h1>
                <p class="text-rose-100 text-lg">Donde la verdad sale a la luz ✨</p>
              </div>
            </div>
            
            <p class="text-white/90 max-w-2xl mb-6 text-lg">
              Comparte tu historia de manera anónima y ayuda a otras personas a conocer la verdad. 
              <span class="font-semibold">Juntas somos más fuertes 💪</span>
            </p>
            
            <div class="flex flex-wrap gap-3">
              <UButton 
                to="/customers" 
                size="lg"
                class="bg-white text-rose-600 hover:bg-rose-50 font-semibold shadow-lg"
                icon="i-lucide-eye"
              >
                Ver Casos
              </UButton>
              <UButton 
                to="/customers" 
                size="lg"
                variant="outline"
                class="border-white/50 text-white hover:bg-white/10"
                icon="i-lucide-plus"
              >
                Publicar Anécdota
              </UButton>
            </div>
          </div>
        </div>

        <!-- Stats con estilo mejorado -->
        <HomeStats />
        
        <!-- Sección de características -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-6 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
            <div class="flex items-center justify-center size-12 rounded-full bg-rose-500/20 mb-4">
              <UIcon name="i-lucide-shield-check" class="size-6 text-rose-500" />
            </div>
            <h3 class="font-bold text-highlighted mb-2">100% Anónimo</h3>
            <p class="text-sm text-muted">Tu identidad está protegida. Nadie sabrá quién publicó la anécdota.</p>
          </div>
          
          <div class="p-6 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
            <div class="flex items-center justify-center size-12 rounded-full bg-pink-500/20 mb-4">
              <UIcon name="i-lucide-users" class="size-6 text-pink-500" />
            </div>
            <h3 class="font-bold text-highlighted mb-2">Comunidad Unida</h3>
            <p class="text-sm text-muted">Miles de personas compartiendo experiencias y apoyándose mutuamente.</p>
          </div>
          
          <div class="p-6 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
            <div class="flex items-center justify-center size-12 rounded-full bg-fuchsia-500/20 mb-4">
              <UIcon name="i-lucide-search" class="size-6 text-fuchsia-500" />
            </div>
            <h3 class="font-bold text-highlighted mb-2">Busca y Descubre</h3>
            <p class="text-sm text-muted">Filtra por ubicación y encuentra casos cerca de ti.</p>
          </div>
        </div>

        <!-- Últimas anécdotas -->
        <HomeCharts />
        
        <!-- Call to Action -->
        <div class="relative overflow-hidden rounded-xl bg-linear-to-r from-rose-600 to-pink-600 p-6">
          <div class="absolute right-0 top-0 text-8xl opacity-10">💔</div>
          <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">¿Tienes algo que contar?</h3>
              <p class="text-rose-100">Tu historia puede ayudar a otras personas 🙏</p>
            </div>
            <UButton 
              to="/customers" 
              size="lg"
              class="bg-white text-rose-600 hover:bg-rose-50 font-semibold whitespace-nowrap"
              icon="i-lucide-pen-line"
            >
              Publicar Ahora
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
