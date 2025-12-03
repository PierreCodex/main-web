<script setup lang="ts">
import type { Anecdota } from '~/types'

const props = defineProps<{
  id: string
}>()

const supabase = useSupabaseClient()
const toast = useToast()

// Estado local
const anecdota = ref<Anecdota | null>(null)
const loading = ref(true)
const errorMsg = ref('')

// Cargar datos
async function loadAnecdota() {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const { data, error } = await supabase
      .from('anecdotas')
      .select('*')
      .eq('id', props.id)
      .single()

    if (error) {
      errorMsg.value = error.message
      toast.add({ title: 'Error', description: error.message, color: 'error' })
      return
    }

    anecdota.value = data as Anecdota
  } catch (e: any) {
    errorMsg.value = e.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Cargar al montar
onMounted(() => {
  loadAnecdota()
})

// Recargar si cambia el ID
watch(() => props.id, () => {
  loadAnecdota()
})

// Función para formatear fecha
function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para copiar al portapapeles
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.add({ title: 'Copiado', color: 'success' })
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-20">
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
  </div>

  <!-- Error -->
  <div v-else-if="errorMsg" class="flex flex-col items-center justify-center py-20 gap-4">
    <UIcon name="i-lucide-alert-circle" class="size-16 text-red-500" />
    <p class="text-lg text-red-500">{{ errorMsg }}</p>
    <UButton label="Reintentar" @click="loadAnecdota" />
  </div>

  <!-- No encontrado -->
  <div v-else-if="!anecdota" class="flex flex-col items-center justify-center py-20 gap-4">
    <UIcon name="i-lucide-file-x" class="size-16 text-muted" />
    <p class="text-lg text-muted">Anécdota no encontrada</p>
    <UButton label="Volver a la lista" to="/customers" />
  </div>

  <!-- Contenido -->
  <div v-else class="max-w-4xl mx-auto space-y-6 p-4">
    <!-- Header con título -->
    <div class="bg-elevated rounded-lg p-6 space-y-2">
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-highlighted">{{ anecdota.titulo }}</h1>
          <p class="text-lg text-muted">{{ anecdota.subtitulo }}</p>
        </div>
        <UBadge variant="subtle" color="neutral" class="shrink-0">
          {{ formatDate(anecdota.created_at) }}
        </UBadge>
      </div>
    </div>

    <!-- Grid de información -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ubicación -->
      <div class="bg-elevated rounded-lg p-4 space-y-3">
        <div class="flex items-center gap-2 text-primary">
          <UIcon name="i-lucide-map-pin" class="size-5" />
          <h3 class="font-semibold">Ubicación</h3>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted">País:</span>
            <span class="text-highlighted">{{ anecdota.pais || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Departamento:</span>
            <span class="text-highlighted">{{ anecdota.departamento || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Distrito:</span>
            <span class="text-highlighted">{{ anecdota.distrito || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="bg-elevated rounded-lg p-4 space-y-3">
        <div class="flex items-center gap-2 text-primary">
          <UIcon name="i-lucide-user" class="size-5" />
          <h3 class="font-semibold">Información Personal</h3>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted">Edad:</span>
            <span class="text-highlighted">{{ anecdota.edad ? `${anecdota.edad} años` : '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Ocupación:</span>
            <span class="text-highlighted">{{ anecdota.ocupacion || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Relación -->
      <div class="bg-elevated rounded-lg p-4 space-y-3">
        <div class="flex items-center gap-2 text-primary">
          <UIcon name="i-lucide-heart" class="size-5" />
          <h3 class="font-semibold">Relación</h3>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted">Tiempo de relación:</span>
            <span class="text-highlighted">{{ anecdota.tiempo_relacion || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Período de infidelidad:</span>
            <span class="text-highlighted">{{ anecdota.periodo_infidelidad || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- ID -->
      <div class="bg-elevated rounded-lg p-4 space-y-3">
        <div class="flex items-center gap-2 text-primary">
          <UIcon name="i-lucide-fingerprint" class="size-5" />
          <h3 class="font-semibold">Identificador</h3>
        </div>
        <div class="flex items-center gap-2">
          <code class="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{{ anecdota.id }}</code>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copyToClipboard(anecdota.id)"
          />
        </div>
      </div>
    </div>

    <!-- Datos Adicionales -->
    <div v-if="anecdota.datos_adicionales" class="bg-elevated rounded-lg p-4 space-y-3">
      <div class="flex items-center gap-2 text-primary">
        <UIcon name="i-lucide-file-text" class="size-5" />
        <h3 class="font-semibold">Datos Adicionales</h3>
      </div>
      <p class="text-sm text-highlighted whitespace-pre-wrap">{{ anecdota.datos_adicionales }}</p>
    </div>

    <!-- Enlaces de Pruebas -->
    <div v-if="anecdota.enlaces_pruebas" class="bg-elevated rounded-lg p-4 space-y-3">
      <div class="flex items-center gap-2 text-primary">
        <UIcon name="i-lucide-link" class="size-5" />
        <h3 class="font-semibold">Enlaces de Pruebas</h3>
      </div>
      <div class="flex items-center gap-2">
        <p class="text-sm text-highlighted flex-1 break-all">{{ anecdota.enlaces_pruebas }}</p>
        <UButton
          icon="i-lucide-copy"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="copyToClipboard(anecdota.enlaces_pruebas!)"
        />
      </div>
    </div>
  </div>
</template>
