<script setup>
import { useGlobalConfirmState } from '@/composables/useGlobalConfirm'

const { state, resolveConfirm } = useGlobalConfirmState()
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
    <div
      v-if="state.visible"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(27,23,23,0.45)] px-4 py-8 backdrop-blur-sm"
      @click.self="resolveConfirm(false)"
    >
      <div class="w-full max-w-md rounded-[1.5rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_30px_70px_rgba(17,17,17,0.18)]">
        <p class="eyebrow">{{ state.tone === 'danger' ? 'Please Confirm' : 'Confirm' }}</p>
        <h2 class="mt-4 font-[var(--font-display)] text-3xl text-[var(--color-ink)]">{{ state.title }}</h2>
        <p class="mt-4 text-sm leading-7 text-[var(--color-muted)]">{{ state.message }}</p>

        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button class="secondary-pill justify-center" type="button" @click="resolveConfirm(false)">
            {{ state.cancelText }}
          </button>
          <button
            :class="state.tone === 'danger' ? 'bg-[#6a1f31] hover:bg-[#561728]' : ''"
            class="primary-pill justify-center"
            type="button"
            @click="resolveConfirm(true)"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
