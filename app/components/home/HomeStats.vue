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
    title: 'Infieles Registrados',
    icon: 'i-lucide-heart-crack',
    value: stats.value?.total || 0,
    color: 'rose',
    emoji: '💔'
  },
  {
    title: 'Países',
    icon: 'i-lucide-globe',
    value: stats.value?.totalPaises || 0,
    color: 'pink',
    emoji: '🌎'
  },
  {
    title: 'Departamentos',
    icon: 'i-lucide-map',
    value: stats.value?.totalDepartamentos || 0,
    color: 'fuchsia',
    emoji: '📍'
  },
  {
    title: 'Distritos',
    icon: 'i-lucide-map-pin',
    value: stats.value?.totalDistritos || 0,
    color: 'purple',
    emoji: '🏘️'
  }
])
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in statCards"
      :key="index"
      class="relative overflow-hidden p-5 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group"
      :class="`bg-${stat.color}-50 dark:bg-${stat.color}-950/20 border-${stat.color}-200 dark:border-${stat.color}-800 hover:border-${stat.color}-400`"
    >
      <!-- Emoji decorativo -->
      <div class="absolute -right-2 -top-2 text-5xl opacity-20 group-hover:opacity-30 transition-opacity">
        {{ stat.emoji }}
      </div>
      
      <div class="relative z-10">
        <div 
          class="flex items-center justify-center size-10 rounded-full mb-3"
          :class="`bg-${stat.color}-500/20`"
        >
          <UIcon :name="stat.icon" class="size-5" :class="`text-${stat.color}-500`" />
        </div>
        
        <p class="text-3xl font-bold text-highlighted mb-1">
          {{ stat.value.toLocaleString() }}
        </p>
        
        <p class="text-sm text-muted font-medium">
          {{ stat.title }}
        </p>
      </div>
    </div>
  </div>
</template>
