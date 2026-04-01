<script setup>
import { Check, CircleAlert, Info, X } from 'lucide-vue-next'
import { useGlobalToastState } from '@/composables/useGlobalToast'

const { state, remove } = useGlobalToastState()

function iconFor(type) {
  if (type === 'success') return Check
  if (type === 'error') return CircleAlert
  return Info
}

function accentClass(type) {
  if (type === 'success') return 'text-green-700 bg-[rgba(34,197,94,0.1)]'
  if (type === 'error') return 'text-red-700 bg-[rgba(220,38,38,0.1)]'
  return 'text-[var(--color-wine)] bg-[rgba(128,47,68,0.09)]'
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:justify-end">
    <div class="flex w-full max-w-sm flex-col gap-3">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div
          v-for="toast in state.items"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 rounded-[1.3rem] border border-[var(--color-border)] bg-white p-4 shadow-[0_20px_45px_rgba(17,17,17,0.12)]"
        >
          <div :class="accentClass(toast.type)" class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <component :is="iconFor(toast.type)" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-[var(--color-ink)]">
              {{ toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Action failed' : 'Notice' }}
            </p>
            <p class="mt-1 text-sm leading-6 text-[var(--color-muted)]">{{ toast.message }}</p>
          </div>
          <button class="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:text-[var(--color-wine)]" type="button" @click="remove(toast.id)">
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
