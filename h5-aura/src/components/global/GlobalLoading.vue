<script setup>
import { useGlobalLoadingState } from '@/composables/useGlobalLoading'

const state = useGlobalLoadingState()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="state.visible" class="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(248,246,244,0.72)] px-4 backdrop-blur-sm">
      <div class="flex min-w-[220px] flex-col items-center rounded-[1.5rem] border border-[var(--color-border)] bg-white px-8 py-7 text-center shadow-[0_26px_60px_rgba(17,17,17,0.12)]">
        <div class="h-11 w-11 animate-spin rounded-full border-2 border-[rgba(128,47,68,0.14)] border-t-[var(--color-wine)]"></div>
        <p class="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-wine)]">Please wait</p>
        <p class="mt-2 text-sm text-[var(--color-muted)]">{{ state.text }}</p>
      </div>
    </div>
  </Transition>
</template>
