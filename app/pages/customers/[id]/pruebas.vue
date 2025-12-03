<script setup lang="ts">
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => route.params.id as string)
const supabase = useSupabaseClient()

// Cargar datos de la anécdota
const { data: anecdota } = await useAsyncData<Anecdota | null>(`anecdota-pruebas-${id.value}`, async () => {
  const { data, error } = await supabase
    .from('anecdotas')
    .select('enlaces_pruebas')
    .eq('id', id.value)
    .single()

  if (error) {
    console.error('Error cargando pruebas:', error)
    return null
  }

  return data
}, {
  server: false
})

// Parsear enlaces (pueden estar separados por comas o saltos de línea)
const enlaces = computed(() => {
  if (!anecdota.value?.enlaces_pruebas) return []
  
  return anecdota.value.enlaces_pruebas
    .split(/[,\n]/)
    .map(e => e.trim())
    .filter(e => e.length > 0)
})

// Verificar si es una URL válida
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return string.startsWith('http://') || string.startsWith('https://') || string.startsWith('www.')
  }
}

// Obtener dominio de una URL
function getDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}
</script>

<template>
  <div>
    <UPageCard
      title="Pruebas"
      description="Enlaces y evidencias del caso"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle">
      <!-- Si hay enlaces -->
      <div v-if="enlaces.length > 0" class="space-y-3">
        <p class="text-sm text-muted mb-4">
          {{ enlaces.length }} enlace{{ enlaces.length > 1 ? 's' : '' }} de evidencia
        </p>
        
        <div 
          v-for="(enlace, index) in enlaces" 
          :key="index"
          class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-elevated transition-colors"
        >
          <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10">
            <UIcon name="i-lucide-link" class="size-5 text-primary" />
          </div>
          
          <div class="flex-1 min-w-0">
            <a 
              v-if="isValidUrl(enlace)"
              :href="enlace.startsWith('http') ? enlace : `https://${enlace}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium text-primary hover:underline truncate block"
            >
              {{ getDomain(enlace) }}
            </a>
            <p v-else class="text-sm font-medium text-highlighted truncate">
              {{ enlace }}
            </p>
            <p class="text-xs text-muted truncate">{{ enlace }}</p>
          </div>
          
          <UButton
            v-if="isValidUrl(enlace)"
            icon="i-lucide-external-link"
            color="neutral"
            variant="ghost"
            size="sm"
            :to="enlace.startsWith('http') ? enlace : `https://${enlace}`"
            target="_blank"
          />
        </div>
      </div>

      <!-- Si no hay enlaces -->
      <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-link-2-off" class="size-12 text-muted" />
        <p class="text-muted">No hay enlaces de pruebas registrados</p>
      </div>
    </UPageCard>
  </div>
</template>
