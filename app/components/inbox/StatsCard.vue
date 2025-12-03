<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  icon: string
  color?: 'success' | 'warning' | 'error' | 'primary' | 'neutral'
  description?: string
}>()

const colorClasses = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  primary: 'text-primary',
  neutral: 'text-muted'
}

const bgClasses = {
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
  primary: 'bg-primary/10',
  neutral: 'bg-muted/10'
}
</script>

<template>
  <UPageCard variant="subtle">
    <div class="flex items-start gap-4">
      <div 
        :class="[
          'p-3 rounded-lg',
          bgClasses[color || 'neutral']
        ]"
      >
        <UIcon 
          :name="icon" 
          :class="['size-6', colorClasses[color || 'neutral']]" 
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-sm text-muted">{{ label }}</p>
        <p class="text-2xl font-bold text-highlighted mt-1">{{ value }}</p>
        <p v-if="description" class="text-xs text-muted mt-1">{{ description }}</p>
      </div>
    </div>
  </UPageCard>
</template>
