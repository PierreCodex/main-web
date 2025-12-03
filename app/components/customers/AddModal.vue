<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{
  created: []
}>()

const supabase = useSupabaseClient()

const schema = z.object({
  titulo: z.string().min(3, 'El título es muy corto'),
  subtitulo: z.string().min(3, 'El subtítulo es muy corto'),
  departamento: z.string().min(2, 'Selecciona un departamento'),
  distrito: z.string().min(2, 'Ingresa el distrito'),
  edad: z.string().min(1, 'Ingresa la edad'),
  ocupacion: z.string().optional(),
  tiempo_relacion: z.string().optional(),
  periodo_infidelidad: z.string().optional(),
  datos_adicionales: z.string().optional(),
  enlaces_pruebas: z.string().optional(),
  pais: z.string().default('Perú')
})

const open = ref(false)
const loading = ref(false)
const honeypot = ref('')

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  titulo: undefined,
  subtitulo: undefined,
  departamento: undefined,
  distrito: undefined,
  edad: undefined,
  ocupacion: undefined,
  tiempo_relacion: undefined,
  periodo_infidelidad: undefined,
  datos_adicionales: undefined,
  enlaces_pruebas: undefined,
  pais: 'Perú'
})

const departamentos = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua',
  'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
]

const toast = useToast()

function resetForm() {
  state.titulo = undefined
  state.subtitulo = undefined
  state.departamento = undefined
  state.distrito = undefined
  state.edad = undefined
  state.ocupacion = undefined
  state.tiempo_relacion = undefined
  state.periodo_infidelidad = undefined
  state.datos_adicionales = undefined
  state.enlaces_pruebas = undefined
  state.pais = 'Perú'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    // Protección Anti-Bot
    if (honeypot.value) {
      console.warn('Bot detected via honeypot')
      return
    }

    const { error } = await supabase
      .from('anecdotas')
      .insert({
        titulo: event.data.titulo,
        subtitulo: event.data.subtitulo,
        departamento: event.data.departamento,
        distrito: event.data.distrito,
        edad: event.data.edad,
        ocupacion: event.data.ocupacion || null,
        tiempo_relacion: event.data.tiempo_relacion || null,
        periodo_infidelidad: event.data.periodo_infidelidad || null,
        datos_adicionales: event.data.datos_adicionales || null,
        enlaces_pruebas: event.data.enlaces_pruebas || null,
        pais: event.data.pais
      })

    if (error) throw error

    toast.add({ 
      title: 'Éxito', 
      description: `Nueva anécdota "${event.data.titulo}" agregada`, 
      color: 'success' 
    })
    
    resetForm()
    open.value = false
    emit('created')
  } catch (error: any) {
    toast.add({ 
      title: 'Error', 
      description: error.message || 'No se pudo guardar la anécdota', 
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Nueva Anécdota" description="Agrega una nueva anécdota a la base de datos" :ui="{ content: 'sm:max-w-2xl' }">
    <UButton label="Nueva anécdota" icon="i-lucide-plus" />

    <template #body>
      <!-- Nota de advertencia -->
      <div class="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
        <div class="flex items-start gap-2">
          <UIcon name="i-lucide-alert-triangle" class="size-5 text-warning shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="font-semibold text-warning mb-1">IMPORTANTE - Responsabilidad del Usuario</p>
            <ul class="text-muted space-y-0.5 text-xs">
              <li>• Este es un sitio de anécdotas ficticias e inventadas</li>
              <li>• Todos los datos deben ser inventados y ficticios</li>
              <li>• Eres responsable del contenido que publicas</li>
              <li>• La plataforma NO verifica identidades ni datos</li>
              <li>• Publica solo información ficticia e inventada</li>
            </ul>
          </div>
        </div>
      </div>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Honeypot Anti-Bot -->
        <CommonFormHoneypot v-model="honeypot" />

        <!-- Fila 1: Título y Subtítulo -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Título" name="titulo" required>
            <UInput v-model="state.titulo" placeholder="Título de la anécdota" class="w-full" />
          </UFormField>

          <UFormField label="Subtítulo" name="subtitulo" required>
            <UInput v-model="state.subtitulo" placeholder="Breve descripción" class="w-full" />
          </UFormField>
        </div>

        <!-- Fila 2: País y Departamento -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="País" name="pais">
            <UInput v-model="state.pais" placeholder="País" class="w-full" />
          </UFormField>

          <UFormField label="Departamento" name="departamento" required>
            <USelect 
              v-model="state.departamento" 
              :items="departamentos" 
              placeholder="Seleccionar"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Fila 3: Distrito y Edad -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Distrito" name="distrito" required>
            <UInput v-model="state.distrito" placeholder="Nombre del distrito" class="w-full" />
          </UFormField>

          <UFormField label="Edad" name="edad" required>
            <UInput v-model="state.edad" placeholder="Ej: 25 años" class="w-full" />
          </UFormField>
        </div>

        <!-- Fila 4: Ocupación y Tiempo de relación -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Ocupación" name="ocupacion">
            <UInput v-model="state.ocupacion" placeholder="Profesión u ocupación" class="w-full" />
          </UFormField>

          <UFormField label="Tiempo de relación" name="tiempo_relacion">
            <UInput v-model="state.tiempo_relacion" placeholder="Ej: 2 años" class="w-full" />
          </UFormField>
        </div>

        <!-- Fila 5: Período de infidelidad y Datos adicionales -->
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Período de infidelidad" name="periodo_infidelidad">
            <UInput v-model="state.periodo_infidelidad" placeholder="Ej: 6 meses" class="w-full" />
          </UFormField>

          <UFormField label="Enlaces de pruebas" name="enlaces_pruebas">
            <UInput v-model="state.enlaces_pruebas" placeholder="URLs de evidencias" class="w-full" />
          </UFormField>
        </div>

        <!-- Fila 6: Datos adicionales (ancho completo) -->
        <UFormField label="Datos adicionales" name="datos_adicionales">
          <UTextarea 
            v-model="state.datos_adicionales" 
            placeholder="Información adicional relevante..." 
            class="w-full"
            :rows="2"
          />
        </UFormField>

        <!-- Botones -->
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            :disabled="loading"
            @click="open = false"
          />
          <UButton
            label="Crear anécdota"
            color="primary"
            variant="solid"
            type="submit"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
