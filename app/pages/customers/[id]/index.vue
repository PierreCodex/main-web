<script setup lang="ts">
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => route.params.id as string)

const supabase = useSupabaseClient()
const toast = useToast()

// Estado local
const anecdota = ref<Anecdota | null>(null)
const loading = ref(true)

// Cargar datos
async function loadAnecdota() {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('anecdotas')
      .select('*')
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

watch(id, () => {
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
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-rose-500" />
  </div>

  <!-- No encontrado -->
  <div v-else-if="!anecdota" class="flex flex-col items-center justify-center py-20 gap-4">
    <UIcon name="i-lucide-file-x" class="size-16 text-muted" />
    <p class="text-lg text-muted">Anécdota no encontrada</p>
    <UButton label="Volver a la lista" to="/customers" class="bg-rose-500 hover:bg-rose-600" />
  </div>

  <!-- Contenido -->
  <template v-else>
    <!-- Header Principal con estilo llamativo -->
    <div class="relative overflow-hidden rounded-xl bg-linear-to-br from-rose-500 via-pink-500 to-rose-600 p-6 mb-6 shadow-lg">
      <!-- Patrón decorativo -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 size-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 size-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div class="relative z-10">
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center size-14 rounded-full bg-white/20 backdrop-blur-sm">
            <UIcon name="i-lucide-heart-crack" class="size-7 text-white" />
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-white mb-1">{{ anecdota.titulo }}</h1>
            <p class="text-rose-100">{{ anecdota.subtitulo }}</p>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-3 mt-4">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
            <UIcon name="i-lucide-calendar" class="size-4" />
            {{ formatDate(anecdota.created_at) }}
          </div>
          <div v-if="anecdota.pais" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
            <UIcon name="i-lucide-globe" class="size-4" />
            {{ anecdota.pais }}
          </div>
          <div v-if="anecdota.edad" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
            <UIcon name="i-lucide-user" class="size-4" />
            {{ anecdota.edad }} años
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Perfil del Infiel -->
    <UPageCard variant="subtle" class="mb-4 border-l-4 border-l-pink-500">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex items-center justify-center size-10 rounded-lg bg-pink-500/10">
          <UIcon name="i-lucide-user-circle" class="size-5 text-pink-500" />
        </div>
        <div>
          <h3 class="font-semibold text-highlighted">Perfil del Infiel</h3>
          <p class="text-xs text-muted">Información sobre la persona</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-cake" class="size-4 text-pink-500" />
            <span class="text-xs text-muted">Edad</span>
          </div>
          <p class="font-medium text-highlighted">{{ anecdota.edad ? `${anecdota.edad} años` : '-' }}</p>
        </div>
        <div class="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-briefcase" class="size-4 text-pink-500" />
            <span class="text-xs text-muted">Ocupación</span>
          </div>
          <p class="font-medium text-highlighted">{{ anecdota.ocupacion || '-' }}</p>
        </div>
      </div>
    </UPageCard>

    <!-- Sección de Ubicación del Infiel -->
    <UPageCard variant="subtle" class="mb-4 border-l-4 border-l-rose-500">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex items-center justify-center size-10 rounded-lg bg-rose-500/10">
          <UIcon name="i-lucide-map-pin" class="size-5 text-rose-500" />
        </div>
        <div>
          <h3 class="font-semibold text-highlighted">Ubicación</h3>
          <p class="text-xs text-muted">Dónde se encuentra el infiel</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-globe-2" class="size-4 text-rose-500" />
            <span class="text-xs text-muted">País</span>
          </div>
          <p class="font-medium text-highlighted">{{ anecdota.pais || '-' }}</p>
        </div>
        <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-building-2" class="size-4 text-rose-500" />
            <span class="text-xs text-muted">Departamento</span>
          </div>
          <p class="font-medium text-highlighted">{{ anecdota.departamento || '-' }}</p>
        </div>
        <div class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <div class="flex items-center gap-2 mb-1">
            <UIcon name="i-lucide-home" class="size-4 text-rose-500" />
            <span class="text-xs text-muted">Distrito</span>
          </div>
          <p class="font-medium text-highlighted">{{ anecdota.distrito || '-' }}</p>
        </div>
      </div>
    </UPageCard>

    <!-- ID del registro -->
    <UPageCard variant="subtle" class="border-l-4 border-l-gray-400 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center size-10 rounded-lg bg-gray-500/10">
            <UIcon name="i-lucide-fingerprint" class="size-5 text-gray-500" />
          </div>
          <div>
            <p class="text-sm font-medium text-highlighted">ID del Registro</p>
            <code class="text-xs text-muted">{{ anecdota.id }}</code>
          </div>
        </div>
        <UButton
          icon="i-lucide-copy"
          size="sm"
          color="neutral"
          variant="soft"
          @click="copyToClipboard(anecdota.id)"
        >
          Copiar
        </UButton>
      </div>
    </UPageCard>

    <!-- Compartir en Redes Sociales -->
    <UPageCard variant="subtle" class="border-l-4 border-l-violet-500">
      <CompartirButtons :anecdota="anecdota" />
    </UPageCard>
  </template>
</template>
