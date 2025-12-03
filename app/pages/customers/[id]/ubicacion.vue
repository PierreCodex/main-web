<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)
</script>

<template>
  <UPageCard
    title="Ubicación"
    description="Información geográfica de la anécdota"
    variant="naked"
    class="mb-4"
  />

  <UPageCard variant="subtle">
    <div class="flex flex-col items-center justify-center py-12 gap-4">
      <UIcon name="i-lucide-map-pin" class="size-12 text-muted" />
      <p class="text-muted">Próximamente - Información de ubicación detallada</p>
    </div>
  </UPageCard>
</template>
