<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

// El nombre del campo debe sonar legítimo para engañar al bot
// pero ser obvio para nosotros que es el honeypot
const fieldName = 'website_url_check'
</script>

<template>
  <div class="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
    <label :for="fieldName">Website URL (Do not fill this)</label>
    <input
      :id="fieldName"
      type="text"
      :name="fieldName"
      :value="modelValue"
      tabindex="-1"
      autocomplete="off"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
