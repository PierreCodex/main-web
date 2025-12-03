<script setup lang="ts">
const route = useRoute()
const id = computed(() => {
  const paramId = route.params.id
  return Array.isArray(paramId) ? paramId[0] : paramId
})

const supabase = useSupabaseClient()
const toast = useToast()

// Estado
const loading = ref(false)
const showDenunciaModal = ref(false)
const selectedMotivo = ref('')
const yaVoto = ref(false)
const tipoVotoActual = ref<string | null>(null)

// Contadores de votos
const votos = ref({
  aprobar: 0,
  refutar: 0,
  denunciar: 0
})

// Motivos de denuncia
const motivosDenuncia = [
  'Contenido falso o inventado',
  'Información personal expuesta',
  'Contenido ofensivo o inapropiado',
  'Spam o publicidad',
  'Incita al odio o violencia',
  'Acoso o bullying',
  'Violación de privacidad',
  'Contenido duplicado',
  'Otro motivo'
]

// Generar fingerprint simple del navegador
function getFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx?.fillText('fingerprint', 10, 10)
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  // Hash simple
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Obtener ID único del votante
function getVotanteId(): string {
  const storageKey = 'votante_id'
  let votanteId = localStorage.getItem(storageKey)
  
  if (!votanteId) {
    votanteId = getFingerprint() + '_' + Date.now().toString(36)
    localStorage.setItem(storageKey, votanteId)
  }
  
  return votanteId
}

// Verificar si ya votó
async function verificarVoto() {
  const votanteId = getVotanteId()
  
  const { data, error } = await supabase
    .from('votos')
    .select('tipo')
    .eq('anecdota_id', id.value)
    .eq('votante_id', votanteId)
    .single()

  if (data) {
    yaVoto.value = true
    tipoVotoActual.value = data.tipo
  }
}

// Cargar votos existentes
async function loadVotos() {
  const { data, error } = await supabase
    .from('votos')
    .select('tipo')
    .eq('anecdota_id', id.value)

  if (error) {
    console.error('Error cargando votos:', error)
    return
  }

  // Contar por tipo
  const counts = { aprobar: 0, refutar: 0, denunciar: 0 }
  data?.forEach(v => {
    if (v.tipo in counts) {
      counts[v.tipo as keyof typeof counts]++
    }
  })
  votos.value = counts
}

// Registrar voto
async function registrarVoto(tipo: 'aprobar' | 'refutar' | 'denunciar', motivo?: string) {
  if (yaVoto.value) {
    toast.add({ 
      title: 'Ya votaste', 
      description: 'Solo puedes votar una vez por cada caso',
      color: 'warning' 
    })
    return
  }

  loading.value = true

  try {
    const votanteId = getVotanteId()
    
    const votoData: any = {
      anecdota_id: id.value,
      tipo,
      votante_id: votanteId
    }

    if (tipo === 'denunciar' && motivo) {
      votoData.motivo_denuncia = motivo
    }

    const { error } = await supabase
      .from('votos')
      .insert(votoData)

    if (error) {
      // Verificar si es error de duplicado
      if (error.code === '23505') {
        toast.add({ 
          title: 'Ya votaste', 
          description: 'Solo puedes votar una vez por cada caso',
          color: 'warning' 
        })
        yaVoto.value = true
        return
      }
      toast.add({ title: 'Error', description: error.message, color: 'error' })
      return
    }

    // Marcar como votado
    yaVoto.value = true
    tipoVotoActual.value = tipo

    // Actualizar contador local
    votos.value[tipo]++

    const mensajes = {
      aprobar: '¡Gracias por aprobar este caso!',
      refutar: 'Has refutado este caso',
      denunciar: 'Denuncia registrada correctamente'
    }

    toast.add({ 
      title: 'Voto registrado', 
      description: mensajes[tipo],
      color: tipo === 'aprobar' ? 'success' : tipo === 'refutar' ? 'warning' : 'error'
    })

    // Cerrar modal si es denuncia
    if (tipo === 'denunciar') {
      showDenunciaModal.value = false
      selectedMotivo.value = ''
    }
  } finally {
    loading.value = false
  }
}

// Manejar denuncia
function handleDenuncia() {
  if (!selectedMotivo.value) {
    toast.add({ title: 'Selecciona un motivo', color: 'warning' })
    return
  }
  registrarVoto('denunciar', selectedMotivo.value)
}

onMounted(() => {
  loadVotos()
  verificarVoto()
})
</script>

<template>
  <div>
    <UPageCard
      title="Votación del Caso"
      description="Ayuda a la comunidad votando sobre la veracidad de este caso"
      variant="naked"
      class="mb-4"
    />

    <!-- Estadísticas de votos -->
    <UPageCard variant="subtle" class="mb-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="space-y-1">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-check-circle" class="size-5 text-success" />
            <span class="text-2xl font-bold text-success">{{ votos.aprobar }}</span>
          </div>
          <p class="text-sm text-muted">Aprobaciones</p>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-x-circle" class="size-5 text-warning" />
            <span class="text-2xl font-bold text-warning">{{ votos.refutar }}</span>
          </div>
          <p class="text-sm text-muted">Refutaciones</p>
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-flag" class="size-5 text-error" />
            <span class="text-2xl font-bold text-error">{{ votos.denunciar }}</span>
          </div>
          <p class="text-sm text-muted">Denuncias</p>
        </div>
      </div>
    </UPageCard>

    <!-- Botones de votación -->
    <UPageCard variant="subtle">
      <div class="space-y-4">
        <!-- Mensaje si ya votó -->
        <div v-if="yaVoto" class="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <UIcon name="i-lucide-check-circle" class="size-5 text-primary" />
          <p class="text-sm text-highlighted">
            Ya registraste tu voto: 
            <span class="font-semibold capitalize">{{ tipoVotoActual }}</span>
          </p>
        </div>

        <p v-else class="text-sm text-muted">¿Qué opinas sobre este caso?</p>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Aprobar -->
          <UButton
            icon="i-lucide-check-circle"
            label="Aprobar"
            color="success"
            :variant="tipoVotoActual === 'aprobar' ? 'solid' : 'soft'"
            size="lg"
            class="flex-1"
            :loading="loading"
            :disabled="yaVoto"
            @click="registrarVoto('aprobar')"
          />

          <!-- Refutar -->
          <UButton
            icon="i-lucide-x-circle"
            label="Refutar"
            color="warning"
            :variant="tipoVotoActual === 'refutar' ? 'solid' : 'soft'"
            size="lg"
            class="flex-1"
            :loading="loading"
            :disabled="yaVoto"
            @click="registrarVoto('refutar')"
          />

          <!-- Denunciar -->
          <UButton
            icon="i-lucide-flag"
            label="Denunciar"
            color="error"
            :variant="tipoVotoActual === 'denunciar' ? 'solid' : 'soft'"
            size="lg"
            class="flex-1"
            :loading="loading"
            :disabled="yaVoto"
            @click="showDenunciaModal = true"
          />
        </div>

        <p class="text-xs text-muted text-center mt-4">
          Tu voto es anónimo y ayuda a mantener la calidad del contenido
        </p>
      </div>
    </UPageCard>

    <!-- Modal de Denuncia -->
    <UModal v-model:open="showDenunciaModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-flag" class="size-5 text-error" />
              <h3 class="font-semibold text-highlighted">Denunciar Caso</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-muted">
              Selecciona el motivo de tu denuncia:
            </p>

            <div class="space-y-2">
              <label
                v-for="motivo in motivosDenuncia"
                :key="motivo"
                class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-elevated cursor-pointer transition-colors"
                :class="{ 'bg-elevated border-primary': selectedMotivo === motivo }"
              >
                <input
                  v-model="selectedMotivo"
                  type="radio"
                  :value="motivo"
                  class="accent-primary"
                >
                <span class="text-sm text-highlighted">{{ motivo }}</span>
              </label>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                label="Cancelar"
                color="neutral"
                variant="ghost"
                @click="showDenunciaModal = false"
              />
              <UButton
                label="Enviar Denuncia"
                color="error"
                :loading="loading"
                :disabled="!selectedMotivo"
                @click="handleDenuncia"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
