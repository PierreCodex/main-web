<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UTooltip :text="colorMode.value === 'dark' ? 'Light mode' : 'Dark mode'">
    <UButton
      color="neutral"
      variant="ghost"
      square
      @click="toggleColorMode"
    >
      <UIcon
        :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
        class="size-5 shrink-0"
      />
    </UButton>
  </UTooltip>
</template>
