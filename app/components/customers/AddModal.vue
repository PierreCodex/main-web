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
  pais: z.string().default('Perú')
})

const open = ref(false)
const loading = ref(false)
const honeypot = ref('')

// Evidencias
const enlacesEvidencia = ref<string[]>([''])
const archivosEvidencia = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

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
  pais: 'PERÚ'
})

const departamentos = [
  'AMAZONAS', 'ÁNCASH', 'APURÍMAC', 'AREQUIPA', 'AYACUCHO', 'CAJAMARCA',
  'CALLAO', 'CUSCO', 'HUANCAVELICA', 'HUÁNUCO', 'ICA', 'JUNÍN',
  'LA LIBERTAD', 'LAMBAYEQUE', 'LIMA', 'LORETO', 'MADRE DE DIOS', 'MOQUEGUA',
  'PASCO', 'PIURA', 'PUNO', 'SAN MARTÍN', 'TACNA', 'TUMBES', 'UCAYALI'
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
  state.pais = 'PERÚ'
  enlacesEvidencia.value = ['']
  archivosEvidencia.value = []
}

// Funciones para manejar evidencias
function agregarEnlace() {
  enlacesEvidencia.value.push('')
}

function eliminarEnlace(index: number) {
  if (enlacesEvidencia.value.length > 1) {
    enlacesEvidencia.value.splice(index, 1)
  } else {
    enlacesEvidencia.value[0] = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files)
    // Validar: solo imágenes y máximo 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.add({
          title: 'Archivo no permitido',
          description: `"${file.name}" no es una imagen válida. Solo se permiten JPG, PNG, GIF y WebP.`,
          color: 'warning'
        })
        return false
      }
      if (file.size > maxSize) {
        toast.add({
          title: 'Archivo muy grande',
          description: `"${file.name}" excede el límite de 5MB.`,
          color: 'warning'
        })
        return false
      }
      return true
    })
    
    archivosEvidencia.value.push(...validFiles)
  }
  // Reset input para permitir seleccionar el mismo archivo
  if (target) target.value = ''
}

function eliminarArchivo(index: number) {
  archivosEvidencia.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    // Protección Anti-Bot
    if (honeypot.value) {
      console.warn('Bot detected via honeypot')
      return
    }

    // Procesar enlaces (filtrar vacíos)
    const enlaces = enlacesEvidencia.value.filter(e => e.trim() !== '')
    
    // Subir archivos a Supabase Storage si hay
    let urlsArchivos: string[] = []
    console.log('Archivos a subir:', archivosEvidencia.value.length)
    
    if (archivosEvidencia.value.length > 0) {
      for (const archivo of archivosEvidencia.value) {
        // Generar nombre único: timestamp_random_nombreoriginal
        const randomId = Math.random().toString(36).substring(2, 8)
        const fileName = `${Date.now()}_${randomId}_${archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        console.log('Intentando subir:', fileName)
        
        try {
          const { data, error: uploadError } = await supabase.storage
            .from('evidencias')
            .upload(fileName, archivo, {
              cacheControl: '3600',
              upsert: false
            })
          
          console.log('Resultado upload:', { data, uploadError })
          
          if (uploadError) {
            console.error('Error subiendo archivo:', uploadError.message)
            toast.add({
              title: 'Advertencia',
              description: `No se pudo subir "${archivo.name}": ${uploadError.message}`,
              color: 'warning'
            })
            continue
          }
          
          if (data) {
            const { data: publicUrl } = supabase.storage
              .from('evidencias')
              .getPublicUrl(data.path)
            
            console.log('URL pública obtenida:', publicUrl)
            
            if (publicUrl?.publicUrl) {
              urlsArchivos.push(publicUrl.publicUrl)
              console.log('URL agregada:', publicUrl.publicUrl)
            }
          }
        } catch (err: any) {
          console.error('Error en upload:', err)
          toast.add({
            title: 'Error',
            description: `Error al subir "${archivo.name}"`,
            color: 'error'
          })
        }
      }
    }
    
    console.log('URLs finales:', urlsArchivos)
    console.log('Enlaces manuales:', enlaces)

    // Combinar enlaces y URLs de archivos
    const todasLasEvidencias = [...enlaces, ...urlsArchivos].filter(Boolean).join('\n')
    console.log('Todas las evidencias combinadas:', todasLasEvidencias)

    const insertData = {
      titulo: event.data.titulo,
      subtitulo: event.data.subtitulo,
      departamento: event.data.departamento,
      distrito: event.data.distrito,
      edad: event.data.edad,
      ocupacion: event.data.ocupacion || null,
      tiempo_relacion: event.data.tiempo_relacion || null,
      periodo_infidelidad: event.data.periodo_infidelidad || null,
      datos_adicionales: event.data.datos_adicionales || null,
      enlaces_pruebas: todasLasEvidencias || null,
      pais: event.data.pais
    }
    console.log('Datos a insertar:', insertData)

    const { error } = await supabase
      .from('anecdotas')
      .insert(insertData)

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

        <!-- Sección: Datos del Infiel -->
        <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-user-x" class="size-5 text-rose-500" />
            <h4 class="font-semibold text-rose-700 dark:text-rose-300">Datos del Infiel</h4>
            <span class="text-xs text-rose-400 ml-auto">* Requerido</span>
          </div>
          
          <div class="space-y-3">
            <!-- Nombre y Apellido -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1.5">Nombre *</label>
                <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-rose-500/50 focus-within:border-rose-500">
                  <UIcon name="i-lucide-user" class="size-4 text-muted shrink-0" />
                  <input
                    v-model="state.titulo"
                    type="text"
                    placeholder="Nombre del infiel"
                    class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">Apellido *</label>
                <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-rose-500/50 focus-within:border-rose-500">
                  <UIcon name="i-lucide-user" class="size-4 text-muted shrink-0" />
                  <input
                    v-model="state.subtitulo"
                    type="text"
                    placeholder="Apellido del infiel"
                    class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Edad -->
            <div>
              <label class="block text-sm font-medium mb-1.5">Edad *</label>
              <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-rose-500/50 focus-within:border-rose-500 w-1/3">
                <UIcon name="i-lucide-cake" class="size-4 text-muted shrink-0" />
                <input
                  v-model="state.edad"
                  type="text"
                  placeholder="Ej: 25"
                  class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                />
                <span class="text-sm text-muted">años</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Ubicación -->
        <div class="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-map-pin" class="size-5 text-pink-500" />
            <h4 class="font-semibold text-pink-700 dark:text-pink-300">Ubicación</h4>
          </div>
          
          <div class="space-y-3">
            <!-- País y Departamento -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1.5">País</label>
                <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:border-pink-500">
                  <UIcon name="i-lucide-globe" class="size-4 text-muted shrink-0" />
                  <input
                    v-model="state.pais"
                    type="text"
                    placeholder="Perú"
                    class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">Departamento *</label>
                <USelect 
                  v-model="state.departamento" 
                  :items="departamentos" 
                  placeholder="Seleccionar departamento"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Distrito -->
            <div>
              <label class="block text-sm font-medium mb-1.5">Distrito *</label>
              <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-pink-500/50 focus-within:border-pink-500">
                <UIcon name="i-lucide-building-2" class="size-4 text-muted shrink-0" />
                <input
                  v-model="state.distrito"
                  type="text"
                  placeholder="Nombre del distrito"
                  class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Detalles de la Relación -->
        <div class="p-4 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-heart-crack" class="size-5 text-fuchsia-500" />
            <h4 class="font-semibold text-fuchsia-700 dark:text-fuchsia-300">Detalles de la Relación</h4>
            <span class="text-xs text-fuchsia-400 ml-auto">Opcional</span>
          </div>
          
          <div class="space-y-3">
            <!-- Ocupación y Tiempo de relación -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1.5">Ocupación</label>
                <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-fuchsia-500/50 focus-within:border-fuchsia-500">
                  <UIcon name="i-lucide-briefcase" class="size-4 text-muted shrink-0" />
                  <input
                    v-model="state.ocupacion"
                    type="text"
                    placeholder="Profesión u ocupación"
                    class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1.5">Tiempo de relación</label>
                <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-fuchsia-500/50 focus-within:border-fuchsia-500">
                  <UIcon name="i-lucide-calendar-heart" class="size-4 text-muted shrink-0" />
                  <input
                    v-model="state.tiempo_relacion"
                    type="text"
                    placeholder="Ej: 2 años"
                    class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Período de infidelidad -->
            <div>
              <label class="block text-sm font-medium mb-1.5">Período de infidelidad</label>
              <div class="flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-fuchsia-500/50 focus-within:border-fuchsia-500">
                <UIcon name="i-lucide-calendar-x" class="size-4 text-muted shrink-0" />
                <input
                  v-model="state.periodo_infidelidad"
                  type="text"
                  placeholder="Ej: 6 meses"
                  class="flex-1 py-2.5 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Tu Historia -->
        <div class="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-message-square-text" class="size-5 text-purple-500" />
            <h4 class="font-semibold text-purple-700 dark:text-purple-300">Tu Historia</h4>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1.5">Cuenta lo que pasó</label>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500">
              <textarea
                v-model="state.datos_adicionales"
                rows="4"
                placeholder="Describe la situación, cómo te enteraste, qué pasó..."
                class="w-full p-3 bg-transparent outline-none text-sm resize-none"
              />
            </div>
            <p class="text-xs text-muted mt-1.5">Sé específico/a pero evita datos personales reales.</p>
          </div>
        </div>

        <!-- Sección de Evidencias -->
        <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-file-warning" class="size-5 text-rose-500" />
            <h4 class="font-semibold text-rose-700 dark:text-rose-300">Evidencias (Opcional)</h4>
          </div>
          <p class="text-sm text-muted mb-4">
            Puedes adjuntar capturas de pantalla, fotos, documentos PDF o enlaces como pruebas.
          </p>

          <!-- Subir Archivos -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Subir Imágenes</label>
            <div class="flex gap-2">
              <div class="flex-1 flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <span class="text-sm text-muted">
                  {{ archivosEvidencia.length === 0 ? 'Sin archivos seleccionados' : `${archivosEvidencia.length} archivo(s)` }}
                </span>
              </div>
              <UButton
                color="primary"
                variant="solid"
                icon="i-lucide-upload"
                label="Elegir archivos"
                @click="triggerFileInput"
              />
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
            <p class="text-xs text-muted mt-1">Solo imágenes: JPG, PNG, GIF, WebP. Máximo 5MB por archivo.</p>
            
            <!-- Lista de archivos seleccionados -->
            <div v-if="archivosEvidencia.length > 0" class="mt-2 space-y-1">
              <div
                v-for="(archivo, index) in archivosEvidencia"
                :key="index"
                class="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center gap-2">
                  <UIcon 
                    name="i-lucide-image" 
                    class="size-4 text-rose-500" 
                  />
                  <span class="text-sm truncate max-w-[200px]">{{ archivo.name }}</span>
                  <span class="text-xs text-muted">({{ formatFileSize(archivo.size) }})</span>
                </div>
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="xs"
                  @click="eliminarArchivo(index)"
                />
              </div>
            </div>
          </div>

          <!-- Enlaces Externos -->
          <div>
            <label class="block text-sm font-medium mb-2">Enlaces Externos (URLs)</label>
            <div class="space-y-2">
              <div
                v-for="(enlace, index) in enlacesEvidencia"
                :key="index"
                class="flex gap-2"
              >
                <div class="flex-1 flex items-center gap-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <UIcon name="i-lucide-link" class="size-4 text-muted" />
                  <input
                    v-model="enlacesEvidencia[index]"
                    type="url"
                    placeholder="https://ejemplo.com/evidencia"
                    class="flex-1 py-2 bg-transparent outline-none text-sm"
                  />
                </div>
                <UButton
                  v-if="enlacesEvidencia.length > 1 || enlace"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-x"
                  @click="eliminarEnlace(index)"
                />
              </div>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-plus"
              label="Agregar otro enlace"
              size="sm"
              class="mt-2 w-full justify-center border border-dashed border-gray-300 dark:border-gray-600"
              @click="agregarEnlace"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="outline"
            :disabled="loading"
            @click="open = false"
          />
          <UButton
            label="Publicar anécdota"
            color="primary"
            variant="solid"
            type="submit"
            icon="i-lucide-send"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>