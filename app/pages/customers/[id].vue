<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const id = computed(() => route.params.id as string)

console.log('Página [id].vue cargada, ID:', id.value)

const links = computed(() => [[{
  label: 'General',
  icon: 'i-lucide-file-text',
  to: `/customers/${id.value}`,
  exact: true
}, {
  label: 'Votación del Caso',
  icon: 'i-lucide-vote',
  to: `/customers/${id.value}/votacion`
}, {
  label: 'Refutaciones',
  icon: 'i-lucide-message-circle-warning',
  to: `/customers/${id.value}/refutaciones`
}, {
  label: 'Relación',
  icon: 'i-lucide-heart',
  to: `/customers/${id.value}/relacion`
}, {
  label: 'Pruebas',
  icon: 'i-lucide-link',
  to: `/customers/${id.value}/pruebas`
}]] satisfies NavigationMenuItem[][])
</script>

<template>
  <UDashboardPanel id="customer-detail" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #title>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              to="/customers"
            />
            <span>Detalle de Anécdota</span>
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
