<script setup lang="ts">
import type { Comentario } from '~/types'

const route = useRoute()
const id = computed(() => route.params.id as string)

const supabase = useSupabaseClient()
const toast = useToast()

// Estados
const comentarios = ref<Comentario[]>([])
const loading = ref(true)
const enviando = ref(false)
const nuevoComentario = ref('')

// Colores aleatorios para avatares anónimos
const coloresAvatar = [
  'rose', 'pink', 'fuchsia', 'purple', 'violet', 
  'indigo', 'blue', 'cyan', 'teal', 'emerald'
]

function getColorAvatar(index: number) {
  return coloresAvatar[index % coloresAvatar.length]
}

// Generar nombre anónimo
function generarNombreAnonimo() {
  const adjetivos = ['Valiente', 'Fuerte', 'Anónima', 'Guerrera', 'Decidida', 'Libre', 'Empoderada', 'Sincera', 'Honesta']
  const numeros = Math.floor(Math.random() * 9999)
  const adjetivo = adjetivos[Math.floor(Math.random() * adjetivos.length)]
  return `${adjetivo}${numeros}`
}

// Cargar comentarios
async function cargarComentarios() {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('anecdota_id', id.value)
      .order('created_at', { ascending: false })

    if (error) throw error
    comentarios.value = data || []
  } catch (e: any) {
    console.error('Error cargando comentarios:', e)
  } finally {
    loading.value = false
  }
}

// Enviar comentario
async function enviarComentario() {
  if (!nuevoComentario.value.trim()) {
    toast.add({ title: 'Escribe un comentario', color: 'warning' })
    return
  }

  if (nuevoComentario.value.length < 10) {
    toast.add({ title: 'El comentario debe tener al menos 10 caracteres', color: 'warning' })
    return
  }

  enviando.value = true

  try {
    const { error } = await supabase
      .from('comentarios')
      .insert({
        anecdota_id: id.value,
        contenido: nuevoComentario.value.trim(),
        autor_anonimo: generarNombreAnonimo()
      })

    if (error) throw error

    toast.add({ 
      title: '¡Comentario publicado!', 
      description: 'Tu apoyo es importante 💕',
      color: 'success' 
    })
    
    nuevoComentario.value = ''
    await cargarComentarios()
  } catch (e: any) {
    toast.add({ title: 'Error al publicar', description: e.message, color: 'error' })
  } finally {
    enviando.value = false
  }
}

// Formatear fecha relativa
function formatearFechaRelativa(fecha: string) {
  const ahora = new Date()
  const fechaComentario = new Date(fecha)
  const diffMs = ahora.getTime() - fechaComentario.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHoras < 24) return `Hace ${diffHoras}h`
  if (diffDias < 7) return `Hace ${diffDias} días`
  
  return fechaComentario.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  cargarComentarios()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-xl bg-linear-to-br from-fuchsia-500 via-purple-500 to-violet-600 p-6 shadow-lg">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 size-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 size-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div class="relative z-10 flex items-center gap-4">
        <div class="flex items-center justify-center size-14 rounded-full bg-white/20 backdrop-blur-sm">
          <UIcon name="i-lucide-message-circle" class="size-7 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">Comentarios de Apoyo</h1>
          <p class="text-fuchsia-100">{{ comentarios.length }} comentarios • Todos somos anónimos aquí 💕</p>
        </div>
      </div>
    </div>

    <!-- Formulario de nuevo comentario -->
    <UPageCard variant="subtle" class="border-l-4 border-l-fuchsia-500">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex items-center justify-center size-10 rounded-lg bg-fuchsia-500/10">
          <UIcon name="i-lucide-pen-line" class="size-5 text-fuchsia-500" />
        </div>
        <div>
          <h3 class="font-semibold text-highlighted">Escribe tu comentario</h3>
          <p class="text-xs text-muted">Tu identidad permanecerá anónima</p>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
        <UTextarea
          v-model="nuevoComentario"
          placeholder="Escribe un mensaje de apoyo, comparte tu experiencia o simplemente muestra tu solidaridad... 💬"
          :rows="4"
          class="mb-3 w-full"
          :ui="{ base: 'w-full' }"
          :disabled="enviando"
        />
        <div class="flex items-center justify-between">
          <p class="text-xs text-muted flex items-center gap-1">
            <UIcon name="i-lucide-shield-check" class="size-3" />
            Se publicará como usuario anónimo
          </p>
          <UButton
            label="Publicar comentario"
            icon="i-lucide-send"
            :loading="enviando"
            :disabled="!nuevoComentario.trim() || nuevoComentario.length < 10"
            class="bg-fuchsia-500 hover:bg-fuchsia-600"
            @click="enviarComentario"
          />
        </div>
      </div>
    </UPageCard>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-fuchsia-500" />
    </div>

    <!-- Lista de comentarios -->
    <template v-else>
      <div v-if="comentarios.length > 0" class="space-y-4">
        <div
          v-for="(comentario, index) in comentarios"
          :key="comentario.id"
          class="p-5 rounded-xl border border-default bg-default/50 hover:bg-default transition-all hover:shadow-md"
        >
          <div class="flex items-start gap-4">
            <!-- Avatar anónimo -->
            <div 
              class="flex items-center justify-center size-12 rounded-full text-white font-bold text-lg flex-shrink-0 shadow-md"
              :class="`bg-${getColorAvatar(index)}-500`"
            >
              {{ comentario.autor_anonimo.charAt(0) }}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-semibold text-highlighted">
                  {{ comentario.autor_anonimo }}
                </span>
                <UBadge color="neutral" variant="subtle" size="xs">
                  <UIcon name="i-lucide-shield" class="size-3 mr-1" />
                  Anónimo
                </UBadge>
                <span class="text-xs text-muted ml-auto">
                  {{ formatearFechaRelativa(comentario.created_at) }}
                </span>
              </div>
              <p class="text-muted whitespace-pre-wrap leading-relaxed">{{ comentario.contenido }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin comentarios -->
      <div v-else class="text-center py-16">
        <div class="flex items-center justify-center size-20 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 mx-auto mb-4">
          <UIcon name="i-lucide-message-circle" class="size-10 text-fuchsia-400" />
        </div>
        <h3 class="text-lg font-semibold text-highlighted mb-2">Sé la primera en comentar</h3>
        <p class="text-muted max-w-md mx-auto">
          Tu mensaje de apoyo puede ayudar a alguien que está pasando por una situación difícil. 
          Todas las identidades son anónimas. 💕
        </p>
      </div>
    </template>
  </div>
</template>
