<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { policyPages } from '@/data/content'

const route = useRoute()
const page = computed(() => policyPages[route.params.slug] || policyPages.privacy)
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-8 shadow-[0_24px_60px_rgba(17,17,17,0.06)] lg:p-12">
      <p class="eyebrow">Policy</p>
      <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">{{ page.title }}</h1>
      <p class="mt-6 text-base leading-8 text-[var(--color-muted)]">{{ page.intro }}</p>
      <div class="mt-8 space-y-5 text-sm leading-8 text-[var(--color-muted)]">
        <p v-for="section in page.sections" :key="section">{{ section }}</p>
      </div>
    </div>
  </section>
</template>
