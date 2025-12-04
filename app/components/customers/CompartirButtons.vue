<script setup lang="ts">
import type { Anecdota } from '~/types'

const props = defineProps<{
  anecdota: Anecdota
}>()

const toast = useToast()

// URL actual
const currentUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href
  }
  return ''
})

// Texto para compartir (anonimizado)
const textoCompartir = computed(() => {
  const titulo = props.anecdota.titulo || 'Historia de infidelidad'
  const ubicacion = props.anecdota.pais || ''
  return `💔 ${titulo} ${ubicacion ? `en ${ubicacion}` : ''} - Registro Nacional de Infieles #RNI`
})

// Compartir en WhatsApp
function compartirWhatsApp() {
  const url = `https://wa.me/?text=${encodeURIComponent(textoCompartir.value + '\n\n' + currentUrl.value)}`
  window.open(url, '_blank')
}

// Compartir en Twitter/X
function compartirTwitter() {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoCompartir.value)}&url=${encodeURIComponent(currentUrl.value)}`
  window.open(url, '_blank')
}

// Compartir en Facebook
function compartirFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}&quote=${encodeURIComponent(textoCompartir.value)}`
  window.open(url, '_blank')
}

// Compartir en Telegram
function compartirTelegram() {
  const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl.value)}&text=${encodeURIComponent(textoCompartir.value)}`
  window.open(url, '_blank')
}

// Copiar enlace
async function copiarEnlace() {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    toast.add({ 
      title: '¡Enlace copiado!', 
      description: 'Ya puedes pegarlo donde quieras',
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (e) {
    toast.add({ title: 'Error al copiar', color: 'error' })
  }
}

// Compartir nativo (móvil)
async function compartirNativo() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Registro Nacional de Infieles',
        text: textoCompartir.value,
        url: currentUrl.value
      })
    } catch (e) {
      // Usuario canceló o error
    }
  } else {
    copiarEnlace()
  }
}

const redesSociales = [
  {
    nombre: 'WhatsApp',
    icon: 'i-simple-icons-whatsapp',
    color: 'bg-green-500 hover:bg-green-600',
    accion: compartirWhatsApp
  },
  {
    nombre: 'X',
    icon: 'i-simple-icons-x',
    color: 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black',
    accion: compartirTwitter
  },
  {
    nombre: 'Facebook',
    icon: 'i-simple-icons-facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    accion: compartirFacebook
  },
  {
    nombre: 'Telegram',
    icon: 'i-simple-icons-telegram',
    color: 'bg-sky-500 hover:bg-sky-600',
    accion: compartirTelegram
  }
]
</script>

<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center size-10 rounded-lg bg-violet-500/10">
        <UIcon name="i-lucide-share-2" class="size-5 text-violet-500" />
      </div>
      <div>
        <h3 class="font-semibold text-highlighted">Compartir</h3>
        <p class="text-xs text-muted">Ayuda a difundir esta historia</p>
      </div>
    </div>

    <!-- Botones de redes sociales -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="red in redesSociales"
        :key="red.nombre"
        :title="`Compartir en ${red.nombre}`"
        class="flex items-center justify-center size-11 rounded-full text-white transition-all hover:scale-110 active:scale-95"
        :class="red.color"
        @click="red.accion"
      >
        <UIcon :name="red.icon" class="size-5" />
      </button>

      <!-- Botón copiar enlace -->
      <button
        title="Copiar enlace"
        class="flex items-center justify-center size-11 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-110 active:scale-95"
        @click="copiarEnlace"
      >
        <UIcon name="i-lucide-link" class="size-5 text-gray-600 dark:text-gray-300" />
      </button>

      <!-- Botón compartir nativo (móvil) -->
      <button
        title="Más opciones"
        class="flex items-center justify-center size-11 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all hover:scale-110 active:scale-95"
        @click="compartirNativo"
      >
        <UIcon name="i-lucide-share" class="size-5" />
      </button>
    </div>

    <!-- Mensaje informativo -->
    <p class="text-xs text-muted flex items-center gap-1">
      <UIcon name="i-lucide-shield" class="size-3" />
      La información personal no se comparte, solo el enlace a la historia
    </p>
  </div>
</template>
