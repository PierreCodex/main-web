<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()

// Tabs
const tabItems = [{
  label: 'Rankings',
  value: 'rankings',
  icon: 'i-lucide-trophy'
}, {
  label: 'Estadísticas',
  value: 'stats',
  icon: 'i-lucide-bar-chart-3'
}]
const selectedTab = ref('rankings')

// Cargar datos de estadísticas
const { data: estadisticas, status, refresh } = await useAsyncData('estadisticas', async () => {
  try {
    const response = await $fetch('/api/estadisticas')
    return response
  } catch (error: any) {
    console.error('Error cargando estadísticas:', error)
    toast.add({ 
      title: 'Error', 
      description: 'No se pudieron cargar las estadísticas',
      color: 'error' 
    })
    return null
  }
}, {
  default: () => null,
  server: false
})

const loading = computed(() => status.value === 'pending')
</script>

<template>
  <UDashboardPanel id="inbox">
    <template #header>
      <UDashboardNavbar title="Rankings & Estadísticas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="loading"
            @click="refresh"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UTabs
          v-model="selectedTab"
          :items="tabItems"
          size="sm"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
        </div>

        <!-- Error State -->
        <div v-else-if="!estadisticas" class="flex flex-col items-center justify-center py-20 gap-4">
          <UIcon name="i-lucide-alert-circle" class="size-16 text-error" />
          <p class="text-lg text-muted">Error al cargar estadísticas</p>
          <UButton label="Reintentar" @click="refresh" />
        </div>

        <!-- Content -->
        <template v-else>
          <!-- Tab Rankings -->
          <div v-show="selectedTab === 'rankings'" class="space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InboxStatsCard
                label="Total Anécdotas"
                :value="estadisticas.estadisticas.generales.totalAnecdotas"
                icon="i-lucide-file-text"
                color="primary"
              />
              <InboxStatsCard
                label="Total Votos"
                :value="estadisticas.estadisticas.generales.totalVotos"
                icon="i-lucide-vote"
                color="success"
              />
              <InboxStatsCard
                label="Votos Hoy"
                :value="estadisticas.estadisticas.generales.votosHoy"
                icon="i-lucide-trending-up"
                color="warning"
              />
              <InboxStatsCard
                label="Aprobación"
                :value="`${estadisticas.estadisticas.generales.ratioAprobacion}%`"
                icon="i-lucide-check-circle"
                color="success"
              />
            </div>

            <!-- Rankings Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Más Aprobadas -->
              <InboxRankingCard
                title="🏆 Top 10 Más Aprobadas"
                icon="i-lucide-check-circle"
                color="success"
                :items="estadisticas.rankings.masAprobadas"
                type="aprobar"
              />

              <!-- Más Refutadas -->
              <InboxRankingCard
                title="⚠️ Top 10 Más Refutadas"
                icon="i-lucide-x-circle"
                color="warning"
                :items="estadisticas.rankings.masRefutadas"
                type="refutar"
              />

              <!-- Más Denunciadas -->
              <InboxRankingCard
                title="🚩 Top 10 Más Denunciadas"
                icon="i-lucide-flag"
                color="error"
                :items="estadisticas.rankings.masDenunciadas"
                type="denunciar"
              />

              <!-- Más Votadas -->
              <InboxRankingCard
                title="🔥 Top 10 Más Votadas"
                icon="i-lucide-flame"
                color="primary"
                :items="estadisticas.rankings.masVotadas"
                type="total"
              />

              <!-- Trending -->
              <InboxRankingCard
                v-if="estadisticas.rankings.trending.length > 0"
                title="📈 Trending (48h)"
                icon="i-lucide-trending-up"
                color="primary"
                :items="estadisticas.rankings.trending"
                type="total"
              />
            </div>
          </div>

          <!-- Tab Estadísticas -->
          <div v-show="selectedTab === 'stats'" class="space-y-6">
            <!-- General Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InboxStatsCard
                label="Total Anécdotas"
                :value="estadisticas.estadisticas.generales.totalAnecdotas"
                icon="i-lucide-file-text"
                color="primary"
                description="Historias publicadas"
              />
              <InboxStatsCard
                label="Total Votos"
                :value="estadisticas.estadisticas.generales.totalVotos"
                icon="i-lucide-vote"
                color="success"
                description="Participación total"
              />
              <InboxStatsCard
                label="Denuncias Pendientes"
                :value="estadisticas.estadisticas.generales.denunciasPendientes"
                icon="i-lucide-alert-triangle"
                color="error"
                description="Requieren revisión"
              />
            </div>

            <!-- Department Stats & Report Reasons -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InboxDepartmentStats 
                :departamentos="estadisticas.estadisticas.porDepartamento"
              />

              <!-- Motivos de Denuncia -->
              <UPageCard v-if="estadisticas.estadisticas.motivosDenuncia.length > 0">
                <template #header>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-alert-circle" class="size-5 text-error" />
                    <h3 class="font-semibold text-highlighted">Motivos de Denuncia</h3>
                  </div>
                </template>

                <div class="space-y-3">
                  <div
                    v-for="motivo in estadisticas.estadisticas.motivosDenuncia"
                    :key="motivo.motivo"
                    class="flex items-center justify-between p-3 rounded-lg bg-error/5 border border-error/20"
                  >
                    <span class="text-sm font-medium text-highlighted">{{ motivo.motivo }}</span>
                    <UBadge color="error" variant="subtle">{{ motivo.count }}</UBadge>
                  </div>
                </div>
              </UPageCard>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
