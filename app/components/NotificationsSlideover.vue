<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'

const { isNotificationsSlideoverOpen } = useDashboard()
const router = useRouter()

const { data: recentAnecdotes, refresh } = await useFetch('/api/recent-anecdotes', {
  server: false,
  lazy: true
})

// Refresh data when slideover opens
watch(isNotificationsSlideoverOpen, (isOpen) => {
  if (isOpen) {
    refresh()
  }
})

function navigateToAnecdota(id: string) {
  isNotificationsSlideoverOpen.value = false
  router.push(`/customers/${id}`)
}
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Últimas Anécdotas"
  >
    <template #body>
      <div v-if="!recentAnecdotes?.length" class="flex flex-col items-center justify-center py-12 text-center text-muted">
        <UIcon name="i-lucide-bell-off" class="size-12 mb-2" />
        <p>No hay anécdotas recientes</p>
      </div>

      <div
        v-for="anecdota in recentAnecdotes"
        :key="anecdota.id"
        class="px-3 py-3 rounded-md hover:bg-elevated/50 cursor-pointer transition-colors relative -mx-3 first:-mt-3 last:-mb-3 border-b border-default/50 last:border-0"
        @click="navigateToAnecdota(anecdota.id)"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 bg-primary/10 rounded-full shrink-0">
            <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium text-highlighted truncate">
              {{ anecdota.titulo }}
            </p>
            
            <div class="flex items-center gap-2 mt-1 text-xs text-muted">
              <span v-if="anecdota.departamento" class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="size-3" />
                {{ anecdota.departamento }}
              </span>
              <span>•</span>
              <time :datetime="anecdota.created_at">
                {{ formatTimeAgo(new Date(anecdota.created_at)) }}
              </time>
            </div>
          </div>

          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted shrink-0 mt-1" />
        </div>
      </div>
    </template>
  </USlideover>
</template>

