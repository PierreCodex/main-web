<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)
const supabase = useSupabaseClient()

interface Refutacion {
  id: string
  evidencia_refutacion: string
  created_at: string
  votante_id: string
}

// Cargar refutaciones de la anécdota
const { data: refutaciones, status } = await useAsyncData<Refutacion[]>(`refutaciones-${id.value}`, async () => {
  const { data, error } = await supabase
    .from('votos')
    .select('id, evidencia_refutacion, created_at, votante_id')
    .eq('anecdota_id', id.value)
    .eq('tipo', 'refutar')
    .not('evidencia_refutacion', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando refutaciones:', error)
    return []
  }

  return data || []
}, {
  default: () => [],
  server: false
})

// Formatear fecha
function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Generar avatar anónimo basado en votante_id
function getAvatarColor(votanteId: string): string {
  const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
  let hash = 0
  for (let i = 0; i < votanteId.length; i++) {
    hash = votanteId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getAvatarInitial(index: number): string {
  return `U${index + 1}`
}
</script>

<template>
  <div>
    <UPageCard
      title="Refutaciones"
      description="Evidencias y argumentos presentados contra este caso"
      variant="naked"
      class="mb-4"
    />

    <!-- Loading state -->
    <UPageCard v-if="status === 'pending'" variant="subtle">
      <div class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 text-muted animate-spin" />
      </div>
    </UPageCard>

    <!-- Si hay refutaciones -->
    <div v-else-if="refutaciones && refutaciones.length > 0" class="space-y-4">
      <UPageCard variant="subtle" class="mb-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-message-circle-warning" class="size-5 text-warning" />
          <span class="text-sm text-muted">
            {{ refutaciones.length }} refutación{{ refutaciones.length > 1 ? 'es' : '' }} registrada{{ refutaciones.length > 1 ? 's' : '' }}
          </span>
        </div>
      </UPageCard>

      <UPageCard 
        v-for="(refutacion, index) in refutaciones" 
        :key="refutacion.id"
        variant="subtle"
      >
        <div class="space-y-3">
          <!-- Header con avatar anónimo y fecha -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div 
                class="flex items-center justify-center size-10 rounded-full text-white text-sm font-semibold"
                :class="`bg-${getAvatarColor(refutacion.votante_id)}-500`"
              >
                {{ getAvatarInitial(index) }}
              </div>
              <div>
                <p class="text-sm font-medium text-highlighted">Usuario Anónimo</p>
                <p class="text-xs text-muted">{{ formatDate(refutacion.created_at) }}</p>
              </div>
            </div>
            <UBadge color="warning" variant="subtle" size="sm">
              Refutación
            </UBadge>
          </div>

          <!-- Contenido de la refutación -->
          <div class="pl-13">
            <div class="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <p class="text-sm text-highlighted whitespace-pre-wrap">{{ refutacion.evidencia_refutacion }}</p>
            </div>
          </div>
        </div>
      </UPageCard>
    </div>

    <!-- Si no hay refutaciones -->
    <UPageCard v-else variant="subtle">
      <div class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-message-circle-off" class="size-12 text-muted" />
        <div class="text-center">
          <p class="text-muted font-medium">No hay refutaciones</p>
          <p class="text-sm text-muted mt-1">Nadie ha presentado evidencia contra este caso todavía</p>
        </div>
      </div>
    </UPageCard>
  </div>
</template>
