<script setup lang="ts">
import type { Anecdota } from '~/types'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip } from '@unovis/vue'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')
const { width } = useElementSize(cardRef)

const supabase = useSupabaseClient()

// Cargar datos desde Supabase
const { data: chartData } = await useAsyncData('home-charts', async () => {
  const { data, error } = await supabase
    .from('anecdotas')
    .select('*')

  if (error || !data) {
    return {
      departamentos: [],
      distritos: [],
      ocupaciones: [],
      edades: [],
      paises: []
    }
  }

  const anecdotas = data as Anecdota[]

  // Top Departamentos
  const deptCount = anecdotas.reduce((acc, a) => {
    if (a.departamento) {
      acc[a.departamento] = (acc[a.departamento] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  const departamentos = Object.entries(deptCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Top Distritos
  const distCount = anecdotas.reduce((acc, a) => {
    if (a.distrito) {
      acc[a.distrito] = (acc[a.distrito] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  const distritos = Object.entries(distCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Top Ocupaciones (Estudiantes y otros)
  const ocupCount = anecdotas.reduce((acc, a) => {
    if (a.ocupacion) {
      acc[a.ocupacion] = (acc[a.ocupacion] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  const ocupaciones = Object.entries(ocupCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Distribución de Edades
  const edadRanges = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '56+': 0
  }
  anecdotas.forEach(a => {
    const edad = a.edad
    if (edad) {
      if (edad <= 25) edadRanges['18-25']++
      else if (edad <= 35) edadRanges['26-35']++
      else if (edad <= 45) edadRanges['36-45']++
      else if (edad <= 55) edadRanges['46-55']++
      else edadRanges['56+']++
    }
  })
  const edades = Object.entries(edadRanges)
    .map(([name, count]) => ({ name, count }))

  // Distribución por País
  const paisCount = anecdotas.reduce((acc, a) => {
    if (a.pais) {
      acc[a.pais] = (acc[a.pais] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  const paises = Object.entries(paisCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    departamentos,
    distritos,
    ocupaciones,
    edades,
    paises
  }
}, {
  server: false,
  default: () => ({
    departamentos: [],
    distritos: [],
    ocupaciones: [],
    edades: [],
    paises: []
  })
})

type ChartItem = { name: string; count: number }

const x = (_: ChartItem, i: number) => i
const y = (d: ChartItem) => d.count
</script>

<template>
  <div ref="cardRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    <!-- Top Departamentos -->
    <UCard :ui="{ body: '!p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-map" class="size-5 text-primary" />
          <p class="font-semibold text-highlighted">Top Departamentos</p>
        </div>
      </template>

      <div v-if="chartData?.departamentos?.length" class="space-y-3">
        <div
          v-for="(item, index) in chartData.departamentos"
          :key="index"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted w-4">{{ index + 1 }}</span>
            <span class="text-sm text-highlighted">{{ item.name }}</span>
          </div>
          <UBadge variant="subtle" color="primary">{{ item.count }}</UBadge>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin datos</p>
    </UCard>

    <!-- Top Distritos -->
    <UCard :ui="{ body: '!p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
          <p class="font-semibold text-highlighted">Top Distritos</p>
        </div>
      </template>

      <div v-if="chartData?.distritos?.length" class="space-y-3">
        <div
          v-for="(item, index) in chartData.distritos"
          :key="index"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted w-4">{{ index + 1 }}</span>
            <span class="text-sm text-highlighted">{{ item.name }}</span>
          </div>
          <UBadge variant="subtle" color="success">{{ item.count }}</UBadge>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin datos</p>
    </UCard>

    <!-- Top Ocupaciones -->
    <UCard :ui="{ body: '!p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="size-5 text-primary" />
          <p class="font-semibold text-highlighted">Top Ocupaciones</p>
        </div>
      </template>

      <div v-if="chartData?.ocupaciones?.length" class="space-y-3">
        <div
          v-for="(item, index) in chartData.ocupaciones"
          :key="index"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted w-4">{{ index + 1 }}</span>
            <span class="text-sm text-highlighted">{{ item.name }}</span>
          </div>
          <UBadge variant="subtle" color="warning">{{ item.count }}</UBadge>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin datos</p>
    </UCard>

    <!-- Distribución de Edades -->
    <UCard :ui="{ body: '!p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          <p class="font-semibold text-highlighted">Distribución de Edades</p>
        </div>
      </template>

      <div v-if="chartData?.edades?.length" class="space-y-3">
        <div
          v-for="(item, index) in chartData.edades"
          :key="index"
          class="space-y-1"
        >
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">{{ item.name }} años</span>
            <span class="text-highlighted font-medium">{{ item.count }}</span>
          </div>
          <div class="w-full bg-muted/20 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full transition-all"
              :style="{ width: `${(item.count / Math.max(...chartData.edades.map(e => e.count), 1)) * 100}%` }"
            />
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin datos</p>
    </UCard>

    <!-- Distribución por País -->
    <UCard :ui="{ body: '!p-4' }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-globe" class="size-5 text-primary" />
          <p class="font-semibold text-highlighted">Distribución por País</p>
        </div>
      </template>

      <div v-if="chartData?.paises?.length" class="space-y-3">
        <div
          v-for="(item, index) in chartData.paises"
          :key="index"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted w-4">{{ index + 1 }}</span>
            <span class="text-sm text-highlighted">{{ item.name }}</span>
          </div>
          <UBadge variant="subtle" color="info">{{ item.count }}</UBadge>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin datos</p>
    </UCard>
  </div>
</template>
