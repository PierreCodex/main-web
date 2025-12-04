<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const teams = ref([{
  label: 'RNI',
  avatar: {
    src: '/favicoroto.png',
    alt: 'RNI'
  }
}])
const selectedTeam = ref(teams.value[0])
</script>

<template>
  <UButton
    v-bind="{
      ...selectedTeam,
      label: collapsed ? undefined : selectedTeam?.label
    }"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="py-2"
    :ui="{
      trailingIcon: 'text-dimmed'
    }"
  />
</template>
