<script setup lang="ts">
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => {
  const paramId = route.params.id
  return Array.isArray(paramId) ? paramId[0] : paramId
})

const supabase = useSupabaseClient()
const toast = useToast()

// Estado local
const anecdota = ref<Anecdota | null>(null)
const loading = ref(true)

// Cargar datos
async function loadAnecdota() {
  loading.value = true
  console.log('Cargando anécdota con ID:', id.value)
  
  try {
    const { data, error } = await supabase
      .from('anecdotas')
      .select('*')
      .eq('id', id.value)
      .single()

    console.log('Respuesta detalle:', { data, error })

    if (error) {
      console.error('Error:', error)
      toast.add({ title: 'Error', description: error.message, color: 'error' })
      return
    }

    anecdota.value = data as Anecdota
  } catch (e: any) {
    console.error('Exception:', e)
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
    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
  </div>

  <!-- No encontrado -->
  <div v-else-if="!anecdota" class="flex flex-col items-center justify-center py-20 gap-4">
    <UIcon name="i-lucide-file-x" class="size-16 text-muted" />
    <p class="text-lg text-muted">Anécdota no encontrada</p>
    <UButton label="Volver a la lista" to="/customers" />
  </div>

  <!-- Contenido -->
  <template v-else>
    <!-- Header -->
    <UPageCard
      :title="anecdota.titulo"
      :description="anecdota.subtitulo"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UBadge variant="subtle" color="neutral" class="w-fit lg:ms-auto">
        {{ formatDate(anecdota.created_at) }}
      </UBadge>
    </UPageCard>

    <!-- Datos Generales -->
    <UPageCard variant="subtle">
      <!-- País -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">País</p>
          <p class="text-sm text-muted">País donde ocurrió</p>
        </div>
        <p class="text-highlighted">{{ anecdota.pais || '-' }}</p>
      </div>
      <USeparator />

      <!-- Departamento -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Departamento</p>
          <p class="text-sm text-muted">Departamento o estado</p>
        </div>
        <p class="text-highlighted">{{ anecdota.departamento || '-' }}</p>
      </div>
      <USeparator />

      <!-- Distrito -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Distrito</p>
          <p class="text-sm text-muted">Distrito o ciudad</p>
        </div>
        <p class="text-highlighted">{{ anecdota.distrito || '-' }}</p>
      </div>
      <USeparator />

      <!-- Edad -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Edad</p>
          <p class="text-sm text-muted">Edad de la persona</p>
        </div>
        <p class="text-highlighted">{{ anecdota.edad ? `${anecdota.edad} años` : '-' }}</p>
      </div>
      <USeparator />

      <!-- Ocupación -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">Ocupación</p>
          <p class="text-sm text-muted">Profesión u oficio</p>
        </div>
        <p class="text-highlighted">{{ anecdota.ocupacion || '-' }}</p>
      </div>
      <USeparator />

      <!-- ID -->
      <div class="flex max-sm:flex-col justify-between items-start gap-4">
        <div>
          <p class="font-medium text-highlighted">ID</p>
          <p class="text-sm text-muted">Identificador único del registro</p>
        </div>
        <div class="flex items-center gap-2">
          <code class="text-xs bg-muted/20 px-2 py-1 rounded">{{ anecdota.id }}</code>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="copyToClipboard(anecdota.id)"
          />
        </div>
      </div>
    </UPageCard>
  </template>
</template>
