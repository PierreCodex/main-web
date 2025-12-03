<script setup lang="ts">
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => {
  const paramId = route.params.id
  return Array.isArray(paramId) ? paramId[0] : paramId
})

const supabase = useSupabaseClient()
const toast = useToast()

// Estado
const anecdota = ref<Anecdota | null>(null)
const loading = ref(true)

// Cargar datos
async function loadAnecdota() {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('anecdotas')
      .select('tiempo_relacion, periodo_infidelidad, datos_adicionales')
      .eq('id', id.value)
      .single()

    if (error) {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
      return
    }

    anecdota.value = data as Anecdota
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnecdota()
})
</script>

<template>
  <div>
    <UPageCard
      title="Relación"
      description="Detalles sobre la relación y el período de infidelidad"
      variant="naked"
      class="mb-4"
    />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
    </div>

    <!-- Contenido -->
    <UPageCard v-else-if="anecdota" variant="subtle">
      <!-- Tiempo de relación -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Tiempo de relación</p>
          <p class="text-sm text-muted">Duración de la relación</p>
        </div>
        <p class="text-highlighted">{{ anecdota.tiempo_relacion || '-' }}</p>
      </div>
      <USeparator />

      <!-- Período de infidelidad -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Período de infidelidad</p>
          <p class="text-sm text-muted">Duración de la infidelidad</p>
        </div>
        <p class="text-highlighted">{{ anecdota.periodo_infidelidad || '-' }}</p>
      </div>
      <USeparator />

      <!-- Datos adicionales -->
      <div class="flex flex-col gap-2">
        <div>
          <p class="font-medium text-highlighted">Datos adicionales</p>
          <p class="text-sm text-muted">Información extra sobre el caso</p>
        </div>
        <p class="text-highlighted whitespace-pre-wrap mt-2 p-3 bg-muted/10 rounded-lg">
          {{ anecdota.datos_adicionales || 'Sin datos adicionales' }}
        </p>
      </div>
    </UPageCard>

    <!-- Error -->
    <UPageCard v-else variant="subtle">
      <div class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-alert-circle" class="size-12 text-muted" />
        <p class="text-muted">No se pudieron cargar los datos</p>
      </div>
    </UPageCard>
  </div>
</template>
