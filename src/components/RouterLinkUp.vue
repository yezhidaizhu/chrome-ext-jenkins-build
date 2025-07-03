<script setup lang="ts">
const router = useRouter()

defineProps<{
  label?: string
  disabled?: boolean
}>()
</script>

<template>
  <UButton class="my-4" icon="ph:arrow-left" :disabled="disabled" @click="router.back()">
    {{ label || "Go Back" }}
  </UButton>
</template>

<style scoped></style>
