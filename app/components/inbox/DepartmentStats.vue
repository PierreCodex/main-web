<script setup lang="ts">
const props = defineProps<{
  departamentos: Array<{
    departamento: string
    count: number
  }>
}>()

const total = computed(() => 
  props.departamentos.reduce((sum, d) => sum + d.count, 0)
)

function getPercentage(count: number) {
  return total.value > 0 ? ((count / total.value) * 100).toFixed(1) : 0
}
</script>

<template>
  <UPageCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
        <h3 class="font-semibold text-highlighted">Por Departamento</h3>
      </div>
    </template>

    <div v-if="departamentos.length > 0" class="space-y-3">
      <div
        v-for="dept in departamentos"
        :key="dept.departamento"
        class="space-y-1"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-highlighted">{{ dept.departamento }}</span>
          <span class="text-muted">{{ dept.count }} ({{ getPercentage(dept.count) }}%)</span>
        </div>
        <div class="w-full bg-muted/20 rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getPercentage(dept.count)}%` }"
          />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <UIcon name="i-lucide-map-pin" class="size-12 text-dimmed mb-2" />
      <p class="text-sm text-muted">No hay datos disponibles</p>
    </div>
  </UPageCard>
</template>
