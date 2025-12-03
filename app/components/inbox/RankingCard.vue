<script setup lang="ts">
const props = defineProps<{
  title: string
  icon: string
  color: 'success' | 'warning' | 'error' | 'primary' | 'neutral'
  items: Array<{
    id: string
    titulo: string
    subtitulo?: string
    votos: {
      aprobar: number
      refutar: number
      denunciar: number
      total: number
    }
  }>
  type: 'aprobar' | 'refutar' | 'denunciar' | 'total'
}>()

const colorClasses = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  primary: 'text-primary',
  neutral: 'text-muted'
}

const voteLabels = {
  aprobar: 'Aprobaciones',
  refutar: 'Refutaciones',
  denunciar: 'Denuncias',
  total: 'Votos'
}

function getVoteCount(item: any) {
  return item.votos[props.type]
}

function navigateToAnecdota(id: string) {
  navigateTo(`/customers/${id}`)
}
</script>

<template>
  <UPageCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon :name="icon" :class="['size-5', colorClasses[color]]" />
        <h3 class="font-semibold text-highlighted">{{ title }}</h3>
      </div>
    </template>

    <div v-if="items.length > 0" class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="flex items-start gap-3 p-3 rounded-lg hover:bg-elevated cursor-pointer transition-colors border border-default"
        @click="navigateToAnecdota(item.id)"
      >
        <div class="flex-shrink-0 w-6 text-center">
          <span class="text-sm font-bold text-muted">#{{ index + 1 }}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="font-medium text-highlighted truncate hover:underline">
            {{ item.titulo }}
          </p>
          <p v-if="item.subtitulo" class="text-sm text-muted truncate">
            {{ item.subtitulo }}
          </p>
        </div>

        <UBadge 
          :color="color" 
          variant="subtle"
          class="flex-shrink-0"
        >
          {{ getVoteCount(item) }}
        </UBadge>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <UIcon :name="icon" class="size-12 text-dimmed mb-2" />
      <p class="text-sm text-muted">No hay datos disponibles</p>
    </div>
  </UPageCard>
</template>
