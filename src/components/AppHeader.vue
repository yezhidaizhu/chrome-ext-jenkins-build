<script setup lang="ts"></script>

<template>
  <div class="flex justify-between gap-4 p-2 bg-neutral">
    <div class="flex gap-2 items-center">
      <!-- <img src="@assets/logo.png" alt="logo" class="h-8 w-auto" /> -->
      <h1 class="font-semibold text-primary text-xl ">
        Jenkins Jobs
      </h1>
    </div>
    <div class="flex gap-2 justify-center">
      <!-- <UButton to="/common/about" icon="ph:question" variant="ghost"></UButton> -->
      <UButton to="/common/setting" icon="ph:gear" variant="ghost"></UButton>
      <ThemeSwitch />
    </div>
  </div>
</template>

<style scoped></style>
