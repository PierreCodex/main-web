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

// Verificar si es una imagen (URL de Supabase Storage o extensión de imagen)
function isImage(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  const lowerUrl = url.toLowerCase()
  
  // Si es del bucket de evidencias de Supabase
  if (url.includes('supabase') && url.includes('/evidencias/')) {
    return true
  }
  
  // Si tiene extensión de imagen
  return imageExtensions.some(ext => lowerUrl.includes(ext))
}

// Separar imágenes y enlaces
const imagenes = computed(() => enlaces.value.filter(e => isImage(e)))
const enlacesExternos = computed(() => enlaces.value.filter(e => !isImage(e)))

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

// Modal para ver imagen ampliada
const imagenAmpliada = ref<string | null>(null)
const modalOpen = ref(false)

function abrirImagen(url: string) {
  imagenAmpliada.value = url
  modalOpen.value = true
}

function cerrarModal() {
  modalOpen.value = false
  imagenAmpliada.value = null
}
</script>

<template>
  <div>
    <UPageCard
      title="Pruebas"
      description="Imágenes y enlaces de evidencias"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle">
      <!-- Si hay evidencias -->
      <div v-if="enlaces.length > 0" class="space-y-6">
        
        <!-- Sección de Imágenes -->
        <div v-if="imagenes.length > 0">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-image" class="size-5 text-rose-500" />
            <h3 class="font-semibold">Imágenes ({{ imagenes.length }})</h3>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(imagen, index) in imagenes"
              :key="index"
              class="relative group cursor-pointer rounded-xl overflow-hidden border border-default hover:border-primary transition-all hover:shadow-lg"
              @click="abrirImagen(imagen)"
            >
              <img
                :src="imagen"
                :alt="`Evidencia ${index + 1}`"
                class="w-full h-40 object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <UIcon 
                  name="i-lucide-zoom-in" 
                  class="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Separador si hay ambos -->
        <USeparator v-if="imagenes.length > 0 && enlacesExternos.length > 0" />

        <!-- Sección de Enlaces Externos -->
        <div v-if="enlacesExternos.length > 0">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-link" class="size-5 text-blue-500" />
            <h3 class="font-semibold">Enlaces externos ({{ enlacesExternos.length }})</h3>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="(enlace, index) in enlacesExternos" 
              :key="index"
              class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-elevated transition-colors"
            >
              <div class="flex items-center justify-center size-10 rounded-lg bg-blue-500/10">
                <UIcon name="i-lucide-external-link" class="size-5 text-blue-500" />
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
        </div>
      </div>

      <!-- Si no hay evidencias -->
      <div v-else class="flex flex-col items-center justify-center py-12 gap-4">
        <UIcon name="i-lucide-image-off" class="size-12 text-muted" />
        <p class="text-muted">No hay pruebas registradas</p>
      </div>
    </UPageCard>

    <!-- Modal para imagen ampliada -->
    <UModal v-model:open="modalOpen" :ui="{ content: 'sm:max-w-4xl' }">
      <template #content>
        <div class="relative p-2">
          <img
            v-if="imagenAmpliada"
            :src="imagenAmpliada"
            alt="Imagen ampliada"
            class="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="sm"
            class="absolute top-4 right-4"
            @click="cerrarModal"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
