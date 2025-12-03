<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import type { Anecdota } from '~/types'

const route = useRoute()
const id = computed(() => {
  const paramId = route.params.id
  return Array.isArray(paramId) ? paramId[0] : paramId
})

const supabase = useSupabaseClient()
const toast = useToast()

// Tab activo
const activeTab = ref('general')

// Estado de datos
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

// Tabs
const tabs = [
  { label: 'General', value: 'general', icon: 'i-lucide-file-text' },
  { label: 'Votación', value: 'votacion', icon: 'i-lucide-vote' },
  { label: 'Relación', value: 'relacion', icon: 'i-lucide-heart' },
  { label: 'Pruebas', value: 'pruebas', icon: 'i-lucide-link' }
]

// Función para formatear fecha
function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Función para copiar al portapapeles
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.add({ title: 'Copiado', color: 'success' })
}
</script>

<template>
  <UDashboardPanel id="customer-detail">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #title>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              to="/customers"
            />
            <span>Detalle de Anécdota</span>
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <div class="flex gap-2 -mx-1">
          <UButton
            v-for="tab in tabs"
            :key="tab.value"
            :icon="tab.icon"
            :label="tab.label"
            :color="activeTab === tab.value ? 'primary' : 'neutral'"
            :variant="activeTab === tab.value ? 'soft' : 'ghost'"
            size="sm"
            @click="activeTab = tab.value"
          />
        </div>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="w-full lg:max-w-2xl mx-auto py-6">
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
          <!-- Disclaimer -->
          <UAlert
            icon="i-lucide-alert-triangle"
            color="error"
            variant="subtle"
            title="🚫 CONTENIDO 100% FICTICIO • SOLO 18+ • PROHIBIDO ACOSAR O DIFAMAR 🚫"
            description="Esta plataforma es exclusivamente para anécdotas ficticias e inventadas. Solo mayores de 18 años. NO usar para acosar o difamar. Ver Política de Privacidad"
            class="mb-6 border-error/20"
            :ui="{ title: 'text-error font-bold', description: 'text-error/80' }"
          />

          <!-- Tab General -->
          <div v-show="activeTab === 'general'" class="space-y-4">
            <UPageCard
              :title="anecdota.titulo"
              :description="anecdota.subtitulo"
              variant="naked"
              orientation="horizontal"
            >
              <UBadge variant="subtle" color="neutral" class="w-fit lg:ms-auto">
                {{ formatDate(anecdota.created_at) }}
              </UBadge>
            </UPageCard>

            <UPageCard variant="subtle">
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">País</p>
                  <p class="text-sm text-muted">País donde ocurrió</p>
                </div>
                <p class="text-highlighted">{{ anecdota.pais || '-' }}</p>
              </div>
              <USeparator />
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Departamento</p>
                </div>
                <p class="text-highlighted">{{ anecdota.departamento || '-' }}</p>
              </div>
              <USeparator />
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Distrito</p>
                </div>
                <p class="text-highlighted">{{ anecdota.distrito || '-' }}</p>
              </div>
              <USeparator />
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Edad</p>
                </div>
                <p class="text-highlighted">{{ anecdota.edad ? `${anecdota.edad} años` : '-' }}</p>
              </div>
              <USeparator />
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Ocupación</p>
                </div>
                <p class="text-highlighted">{{ anecdota.ocupacion || '-' }}</p>
              </div>
            </UPageCard>
          </div>

          <!-- Tab Votación -->
          <div v-show="activeTab === 'votacion'">
            <CustomersVotacionTab v-if="anecdota" :anecdota-id="anecdota.id" />
          </div>

          <!-- Tab Relación -->
          <div v-show="activeTab === 'relacion'" class="space-y-4">
            <UPageCard
              title="Relación"
              description="Detalles sobre la relación"
              variant="naked"
            />
            <UPageCard variant="subtle">
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Tiempo de relación</p>
                </div>
                <p class="text-highlighted">{{ anecdota.tiempo_relacion || '-' }}</p>
              </div>
              <USeparator />
              <div class="flex max-sm:flex-col justify-between items-start gap-4">
                <div>
                  <p class="font-medium text-highlighted">Período de infidelidad</p>
                </div>
                <p class="text-highlighted">{{ anecdota.periodo_infidelidad || '-' }}</p>
              </div>
              <USeparator />
              <div class="flex flex-col gap-2">
                <p class="font-medium text-highlighted">Datos adicionales</p>
                <p class="text-muted whitespace-pre-wrap p-3 bg-muted/10 rounded-lg">
                  {{ anecdota.datos_adicionales || 'Sin datos adicionales' }}
                </p>
              </div>
            </UPageCard>
          </div>

          <!-- Tab Pruebas -->
          <div v-show="activeTab === 'pruebas'" class="space-y-4">
            <UPageCard
              title="Pruebas"
              description="Enlaces y evidencias"
              variant="naked"
            />
            <UPageCard variant="subtle">
              <div class="flex flex-col gap-2">
                <p class="font-medium text-highlighted">Enlaces de pruebas</p>
                <div v-if="anecdota.enlaces_pruebas" class="flex items-center gap-2">
                  <p class="text-muted break-all flex-1">{{ anecdota.enlaces_pruebas }}</p>
                  <UButton
                    icon="i-lucide-copy"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="copyToClipboard(anecdota.enlaces_pruebas!)"
                  />
                </div>
                <p v-else class="text-muted">Sin enlaces de pruebas</p>
              </div>
            </UPageCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
