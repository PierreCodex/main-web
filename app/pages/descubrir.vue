<script setup lang="ts">
import type { Anecdota } from '~/types'

const supabase = useSupabaseClient()
const toast = useToast()

// ID único del usuario (anónimo, guardado en localStorage)
const votanteId = ref<string>('')

// Estados
const anecdotas = ref<Anecdota[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const votando = ref(false)
const direccion = ref<'left' | 'right' | 'up' | null>(null)
const showShareModal = ref(false)

// Generar o recuperar ID de votante anónimo
function obtenerVotanteId(): string {
  if (import.meta.client) {
    let odiaId = localStorage.getItem('visitorId')
    if (!odiaId) {
      odiaId = 'visitor_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      localStorage.setItem('visitorId', odiaId)
    }
    return odiaId
  }
  return ''
}

// Anécdota actual
const currentAnecdota = computed(() => anecdotas.value[currentIndex.value] || null)

// Siguiente anécdota (para previsualizar)
const nextAnecdota = computed(() => anecdotas.value[currentIndex.value + 1] || null)

// Progreso
const progreso = computed(() => {
  if (anecdotas.value.length === 0) return 0
  return Math.round((currentIndex.value / anecdotas.value.length) * 100)
})

// Cargar anécdotas (excluyendo las ya votadas por este usuario)
async function cargarAnecdotas() {
  loading.value = true
  
  try {
    // Primero obtener los IDs de anécdotas ya votadas por este votante
    const { data: votosUsuario } = await supabase
      .from('votos')
      .select('anecdota_id')
      .eq('votante_id', votanteId.value)

    const idsVotados = (votosUsuario || []).map(v => v.anecdota_id)

    // Cargar anécdotas excluyendo las ya votadas
    let query = supabase
      .from('anecdotas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    // Si hay votos previos, excluirlos
    if (idsVotados.length > 0) {
      query = query.not('id', 'in', `(${idsVotados.join(',')})`)
    }

    const { data, error } = await query

    if (error) throw error
    
    // Mezclar aleatoriamente
    anecdotas.value = (data || []).sort(() => Math.random() - 0.5)
    currentIndex.value = 0
  } catch (e: any) {
    console.error('Error:', e)
    toast.add({ title: 'Error al cargar', description: e.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Votar (aprobar, refutar o denunciar)
async function votar(tipo: 'aprobar' | 'refutar' | 'denunciar') {
  if (!currentAnecdota.value || votando.value) return
  
  votando.value = true
  
  // Animación según tipo
  if (tipo === 'aprobar') direccion.value = 'right'
  else if (tipo === 'refutar') direccion.value = 'left'
  else direccion.value = 'up'
  
  try {
    const { error } = await supabase
      .from('votos')
      .insert({
        anecdota_id: currentAnecdota.value.id,
        tipo: tipo,
        votante_id: votanteId.value,
        evidencia_refutacion: null,
        motivo_denuncia: tipo === 'denunciar' ? 'Reportado desde Descubrir' : null
      })

    if (error && !error.message.includes('duplicate')) {
      throw error
    }

    // Mostrar feedback
    const mensajes = {
      aprobar: { title: '👍 ¡Aprobado!', desc: 'Votaste que esta historia es verdad' },
      refutar: { title: '👎 Refutado', desc: 'Votaste que esta historia es falsa' },
      denunciar: { title: '🚨 Reportado', desc: 'Gracias por reportar contenido' }
    }
    
    toast.add({ 
      title: mensajes[tipo].title, 
      description: mensajes[tipo].desc,
      color: tipo === 'aprobar' ? 'success' : tipo === 'refutar' ? 'warning' : 'error'
    })

  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'error' })
  }
  
  // Esperar animación y pasar a la siguiente
  setTimeout(() => {
    direccion.value = null
    currentIndex.value++
    votando.value = false
  }, 300)
}

// Saltar sin votar
function saltar() {
  direccion.value = 'up'
  setTimeout(() => {
    direccion.value = null
    currentIndex.value++
  }, 300)
}

// Reiniciar
function reiniciar() {
  currentIndex.value = 0
  anecdotas.value = anecdotas.value.sort(() => Math.random() - 0.5)
}

// URL para compartir
const urlCompartir = computed(() => {
  if (!currentAnecdota.value) return ''
  return `${window?.location?.origin || ''}/customers/${currentAnecdota.value.id}`
})

// Compartir funciones
function compartirWhatsApp() {
  if (!currentAnecdota.value) return
  const texto = `💔 ${currentAnecdota.value.titulo} - Registro Nacional de Infieles #RNI`
  window.open(`https://wa.me/?text=${encodeURIComponent(texto + '\n\n' + urlCompartir.value)}`, '_blank')
}

function compartirTwitter() {
  if (!currentAnecdota.value) return
  const texto = `💔 ${currentAnecdota.value.titulo} - #RNI #RegistroNacionalDeInfieles`
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(urlCompartir.value)}`, '_blank')
}

function compartirTelegram() {
  if (!currentAnecdota.value) return
  const texto = `💔 ${currentAnecdota.value.titulo} - Registro Nacional de Infieles`
  window.open(`https://t.me/share/url?url=${encodeURIComponent(urlCompartir.value)}&text=${encodeURIComponent(texto)}`, '_blank')
}

async function copiarEnlace() {
  await navigator.clipboard.writeText(urlCompartir.value)
  toast.add({ title: '¡Enlace copiado!', color: 'success' })
  showShareModal.value = false
}

onMounted(() => {
  // Obtener ID de votante anónimo desde localStorage
  votanteId.value = obtenerVotanteId()
  // Cargar anécdotas (excluyendo las ya votadas)
  cargarAnecdotas()
})
</script>

<template>
  <UDashboardPanel id="descubrir">
    <template #header>
      <UDashboardNavbar title="Descubrir Infieles ✨">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            @click="cargarAnecdotas"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
        <div class="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
        
          <!-- Loading -->
          <div v-if="loading" class="flex flex-col items-center gap-4">
            <UIcon name="i-lucide-loader-2" class="size-12 animate-spin text-rose-500" />
            <p class="text-muted">Cargando historias...</p>
          </div>

          <!-- Sin más anécdotas -->
          <div v-else-if="!currentAnecdota" class="text-center">
            <div class="flex items-center justify-center size-24 rounded-full bg-rose-100 dark:bg-rose-900/30 mx-auto mb-6">
              <UIcon name="i-lucide-heart" class="size-12 text-rose-500" />
            </div>
            <h2 class="text-2xl font-bold text-highlighted mb-2">¡Has visto todas!</h2>
            <p class="text-muted mb-6 max-w-sm">
              No hay más historias por descubrir. Vuelve más tarde o reinicia para verlas de nuevo.
            </p>
            <UButton
              label="Ver de nuevo"
              icon="i-lucide-refresh-cw"
              class="bg-rose-500 hover:bg-rose-600"
              @click="reiniciar"
            />
          </div>

          <!-- Card estilo Tinder -->
          <div v-else class="w-full flex flex-col items-center">
            <!-- Barra de progreso -->
            <div class="w-full max-w-sm mb-4">
              <div class="flex items-center justify-between text-xs text-muted mb-1">
                <span>{{ currentIndex + 1 }} de {{ anecdotas.length }}</span>
                <span>{{ progreso }}%</span>
              </div>
              <div class="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                  :style="{ width: `${progreso}%` }"
                />
              </div>
            </div>

            <!-- Card Principal -->
            <div class="relative w-full max-w-sm">
              <!-- Card siguiente (fondo) -->
              <div 
                v-if="nextAnecdota"
                class="absolute inset-0 rounded-3xl bg-gray-200 dark:bg-gray-800 scale-[0.92] -translate-y-2 opacity-60"
              />
              
              <!-- Card actual -->
              <div 
                class="relative rounded-3xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden transition-all duration-300 border border-rose-100 dark:border-rose-900/50"
                :class="{
                  'translate-x-full rotate-12 opacity-0': direccion === 'right',
                  '-translate-x-full -rotate-12 opacity-0': direccion === 'left',
                  '-translate-y-full opacity-0': direccion === 'up'
                }"
              >
                <!-- Imagen/Header -->
                <div class="relative h-48 bg-gradient-to-br from-rose-300 via-pink-300 to-fuchsia-300 dark:from-rose-600 dark:via-pink-600 dark:to-fuchsia-600 flex items-center justify-center">
                  <!-- Patrón decorativo -->
                  <div class="absolute inset-0 opacity-30">
                    <div class="absolute top-4 left-4 size-20 bg-white/40 rounded-full blur-2xl" />
                    <div class="absolute bottom-4 right-4 size-16 bg-white/30 rounded-full blur-xl" />
                  </div>
                  
                  <!-- Icono central -->
                  <div class="relative z-10 size-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <UIcon name="i-lucide-user-circle" class="size-12 text-white" />
                  </div>

                  <!-- Botón compartir -->
                  <button 
                    class="absolute top-3 right-3 size-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                    @click="showShareModal = true"
                  >
                    <UIcon name="i-lucide-share-2" class="size-4 text-white" />
                  </button>

                  <!-- Badge edad -->
                  <div v-if="currentAnecdota.edad" class="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
                    <span class="text-sm font-semibold text-rose-600 dark:text-rose-400">{{ currentAnecdota.edad }} años</span>
                  </div>
                </div>

                <!-- Contenido -->
                <div class="p-5">
                  <!-- Nombre/Título -->
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {{ currentAnecdota.titulo }}
                  </h2>
                  
                  <!-- Ubicación -->
                  <div class="flex items-center gap-1 text-rose-500 mb-4">
                    <UIcon name="i-lucide-map-pin" class="size-4" />
                    <span class="text-sm font-medium">
                      {{ currentAnecdota.departamento || currentAnecdota.pais || 'Sin ubicación' }}{{ currentAnecdota.distrito ? `, ${currentAnecdota.distrito}` : '' }}
                    </span>
                  </div>

                  <!-- Ocupación -->
                  <div v-if="currentAnecdota.ocupacion" class="mb-4">
                    <p class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Ocupación</p>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ currentAnecdota.ocupacion }}</p>
                  </div>

                  <!-- Historia -->
                  <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-400">
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed">
                      {{ currentAnecdota.datos_adicionales }}
                    </p>
                  </div>

                  <!-- Ver más -->
                  <NuxtLink 
                    :to="`/customers/${currentAnecdota.id}`"
                    class="block text-center text-sm text-rose-500 hover:text-rose-600 font-medium mt-3 hover:underline"
                  >
                    Ver historia completa →
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex items-center justify-center gap-6 mt-8">
              <!-- Refutar (X) - Falso -->
              <button
                :disabled="votando"
                class="group size-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 hover:shadow-orange-500/30 hover:shadow-xl"
                title="Es falso"
                @click="votar('refutar')"
              >
                <UIcon name="i-lucide-thumbs-down" class="size-7 text-white" />
              </button>

              <!-- Saltar -->
              <button
                :disabled="votando"
                class="group size-11 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                title="Saltar"
                @click="saltar"
              >
                <UIcon name="i-lucide-skip-forward" class="size-5 text-gray-500 dark:text-gray-400" />
              </button>

              <!-- Aprobar (Check) - Verdad -->
              <button
                :disabled="votando"
                class="group size-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 hover:shadow-green-500/30 hover:shadow-xl"
                title="Es verdad"
                @click="votar('aprobar')"
              >
                <UIcon name="i-lucide-thumbs-up" class="size-7 text-white" />
              </button>
            </div>

            <!-- Leyenda -->
            <div class="flex items-center justify-center gap-8 mt-4 text-xs text-muted">
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500" /> Falso
              </span>
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" /> Verdad
              </span>
            </div>

            <!-- Denunciar -->
            <button
              :disabled="votando"
              class="mt-6 flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
              @click="votar('denunciar')"
            >
              <UIcon name="i-lucide-flag" class="size-3.5" />
              Reportar contenido
            </button>
          </div>
        </div>

        <template #fallback>
          <div class="flex items-center justify-center min-h-[calc(100vh-120px)]">
            <UIcon name="i-lucide-loader-2" class="size-12 animate-spin text-rose-500" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>

  <!-- Modal de Compartir (fuera del panel) -->
  <UModal v-model:open="showShareModal">
    <template #content>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center justify-center size-12 rounded-full bg-violet-500/10">
            <UIcon name="i-lucide-share-2" class="size-6 text-violet-500" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-highlighted">Compartir historia</h3>
            <p class="text-sm text-muted">Ayuda a difundir esta anécdota</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 mb-6">
          <button
            class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="compartirWhatsApp"
          >
            <div class="size-12 rounded-full bg-green-500 flex items-center justify-center">
              <UIcon name="i-simple-icons-whatsapp" class="size-6 text-white" />
            </div>
            <span class="text-xs text-muted">WhatsApp</span>
          </button>

          <button
            class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="compartirTwitter"
          >
            <div class="size-12 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <UIcon name="i-simple-icons-x" class="size-6 text-white dark:text-black" />
            </div>
            <span class="text-xs text-muted">X</span>
          </button>

          <button
            class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="compartirTelegram"
          >
            <div class="size-12 rounded-full bg-sky-500 flex items-center justify-center">
              <UIcon name="i-simple-icons-telegram" class="size-6 text-white" />
            </div>
            <span class="text-xs text-muted">Telegram</span>
          </button>

          <button
            class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="copiarEnlace"
          >
            <div class="size-12 rounded-full bg-gray-500 flex items-center justify-center">
              <UIcon name="i-lucide-link" class="size-6 text-white" />
            </div>
            <span class="text-xs text-muted">Copiar</span>
          </button>
        </div>

        <p class="text-xs text-muted text-center flex items-center justify-center gap-1">
          <UIcon name="i-lucide-shield" class="size-3" />
          Solo se comparte el enlace, no datos personales
        </p>
      </div>
    </template>
  </UModal>
</template>
