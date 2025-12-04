<script setup lang="ts">
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => route.params.id as string)

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
      title="Detalles del Caso"
      description="Ubicación, relación e historia completa"
      variant="naked"
      class="mb-4"
    />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-rose-500" />
    </div>

    <!-- Contenido -->
    <template v-else-if="anecdota">
      <!-- Sección de la Relación -->
      <UPageCard v-if="anecdota.tiempo_relacion || anecdota.periodo_infidelidad" variant="subtle" class="mb-4 border-l-4 border-l-red-500">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-10 rounded-lg bg-red-500/10">
            <UIcon name="i-lucide-heart-off" class="size-5 text-red-500" />
          </div>
          <div>
            <h3 class="font-semibold text-highlighted">La Traición</h3>
            <p class="text-xs text-muted">Detalles de la infidelidad</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-if="anecdota.tiempo_relacion" class="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-lucide-timer" class="size-4 text-red-500" />
              <span class="text-xs text-muted">Tiempo de Relación</span>
            </div>
            <p class="font-medium text-highlighted">{{ anecdota.tiempo_relacion }}</p>
          </div>
          <div v-if="anecdota.periodo_infidelidad" class="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-lucide-calendar-x" class="size-4 text-red-500" />
              <span class="text-xs text-muted">Período de Infidelidad</span>
            </div>
            <p class="font-medium text-highlighted">{{ anecdota.periodo_infidelidad }}</p>
          </div>
        </div>
      </UPageCard>

      <!-- Datos adicionales / Historia -->
      <UPageCard v-if="anecdota.datos_adicionales" variant="subtle" class="border-l-4 border-l-orange-500">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-10 rounded-lg bg-orange-500/10">
            <UIcon name="i-lucide-scroll-text" class="size-5 text-orange-500" />
          </div>
          <div>
            <h3 class="font-semibold text-highlighted">La Historia Completa</h3>
            <p class="text-xs text-muted">Detalles adicionales del caso</p>
          </div>
        </div>
        
        <div class="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <p class="text-sm text-highlighted whitespace-pre-wrap leading-relaxed">{{ anecdota.datos_adicionales }}</p>
        </div>
      </UPageCard>

      <!-- Si no hay datos adicionales -->
      <UPageCard v-if="!anecdota.tiempo_relacion && !anecdota.periodo_infidelidad && !anecdota.datos_adicionales" variant="subtle" class="mt-4">
        <div class="flex flex-col items-center justify-center py-8 gap-3">
          <UIcon name="i-lucide-file-question" class="size-10 text-muted" />
          <p class="text-muted text-sm">No hay detalles adicionales registrados para este caso</p>
        </div>
      </UPageCard>
    </template>

    <!-- Error -->
    <UPageCard v-else variant="subtle">
      <div class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-alert-circle" class="size-12 text-muted" />
        <p class="text-muted">No se pudieron cargar los datos</p>
      </div>
    </UPageCard>
  </div>
</template>
