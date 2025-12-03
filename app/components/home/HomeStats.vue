<script setup lang="ts">
import type { Anecdota } from '~/types'

const supabase = useSupabaseClient()

// Cargar estadísticas desde Supabase
const { data: stats } = await useAsyncData('home-stats', async () => {
  const { data, error } = await supabase
    .from('anecdotas')
    .select('*')

  if (error || !data) {
    return {
      total: 0,
      totalPaises: 0,
      totalDepartamentos: 0,
      totalDistritos: 0
    }
  }

  const anecdotas = data as Anecdota[]
  
  // Contar únicos
  const paises = new Set(anecdotas.map(a => a.pais).filter(Boolean))
  const departamentos = new Set(anecdotas.map(a => a.departamento).filter(Boolean))
  const distritos = new Set(anecdotas.map(a => a.distrito).filter(Boolean))

  return {
    total: anecdotas.length,
    totalPaises: paises.size,
    totalDepartamentos: departamentos.size,
    totalDistritos: distritos.size
  }
}, {
  server: false,
  default: () => ({
    total: 0,
    totalPaises: 0,
    totalDepartamentos: 0,
    totalDistritos: 0
  })
})

const statCards = computed(() => [
  {
    title: 'Total Registros',
    icon: 'i-lucide-database',
    value: stats.value?.total || 0
  },
  {
    title: 'Países',
    icon: 'i-lucide-globe',
    value: stats.value?.totalPaises || 0
  },
  {
    title: 'Departamentos',
    icon: 'i-lucide-map',
    value: stats.value?.totalDepartamentos || 0
  },
  {
    title: 'Distritos',
    icon: 'i-lucide-map-pin',
    value: stats.value?.totalDistritos || 0
  }
])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in statCards"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      to="/customers"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
