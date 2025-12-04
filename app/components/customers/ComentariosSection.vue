<script setup lang="ts">
interface Comentario {
  id: string
  anecdota_id: string
  contenido: string
  autor_anonimo: string
  created_at: string
}

const props = defineProps<{
  anecdotaId: string
}>()

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
  const adjetivos = ['Valiente', 'Fuerte', 'Anónima', 'Guerrera', 'Decidida', 'Libre', 'Empoderada']
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
      .eq('anecdota_id', props.anecdotaId)
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
        anecdota_id: props.anecdotaId,
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
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center size-10 rounded-lg bg-fuchsia-500/10">
        <UIcon name="i-lucide-message-circle" class="size-5 text-fuchsia-500" />
      </div>
      <div>
        <h3 class="font-semibold text-highlighted">Comentarios de Apoyo</h3>
        <p class="text-xs text-muted">{{ comentarios.length }} comentarios • Todos somos anónimos aquí 💕</p>
      </div>
    </div>

    <!-- Formulario de nuevo comentario -->
    <div class="p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
      <UTextarea
        v-model="nuevoComentario"
        placeholder="Escribe un mensaje de apoyo... 💬"
        :rows="3"
        class="mb-3"
        :disabled="enviando"
      />
      <div class="flex items-center justify-between">
        <p class="text-xs text-muted">
          <UIcon name="i-lucide-shield-check" class="size-3 inline" />
          Tu comentario será anónimo
        </p>
        <UButton
          label="Publicar"
          icon="i-lucide-send"
          :loading="enviando"
          :disabled="!nuevoComentario.trim()"
          class="bg-fuchsia-500 hover:bg-fuchsia-600"
          @click="enviarComentario"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-fuchsia-500" />
    </div>

    <!-- Lista de comentarios -->
    <div v-else-if="comentarios.length > 0" class="space-y-3">
      <div
        v-for="(comentario, index) in comentarios"
        :key="comentario.id"
        class="p-4 rounded-xl border border-default bg-default/50 hover:bg-default transition-colors"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar anónimo -->
          <div 
            class="flex items-center justify-center size-10 rounded-full text-white font-bold text-sm flex-shrink-0"
            :class="`bg-${getColorAvatar(index)}-500`"
          >
            {{ comentario.autor_anonimo.charAt(0) }}
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-highlighted text-sm">
                {{ comentario.autor_anonimo }}
              </span>
              <span class="text-xs text-muted">
                {{ formatearFechaRelativa(comentario.created_at) }}
              </span>
            </div>
            <p class="text-sm text-muted whitespace-pre-wrap">{{ comentario.contenido }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin comentarios -->
    <div v-else class="text-center py-8">
      <div class="flex items-center justify-center size-16 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 mx-auto mb-3">
        <UIcon name="i-lucide-message-circle" class="size-8 text-fuchsia-400" />
      </div>
      <p class="text-muted font-medium">Sé la primera en comentar</p>
      <p class="text-xs text-muted mt-1">Tu apoyo puede marcar la diferencia 💕</p>
    </div>
  </div>
</template>
