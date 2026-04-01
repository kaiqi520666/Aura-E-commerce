<script setup>
import { Instagram, Mail, MoveRight } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t border-[var(--color-border)] bg-white/90">
    <section class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
      <div>
        <p class="eyebrow mb-3">Join The Glow List</p>
        <h2 class="font-[var(--font-display)] text-3xl text-[var(--color-ink)]">Curated drops, styling notes, and first access.</h2>
        <form class="mt-6 flex max-w-md items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] p-2">
          <input class="w-full bg-transparent px-4 text-sm outline-none" placeholder="Your email address" type="email" />
          <button class="inline-flex items-center gap-2 rounded-full bg-[var(--color-wine)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white" type="button">
            Subscribe
            <MoveRight class="h-4 w-4" />
          </button>
        </form>
      </div>

      <div>
        <p class="eyebrow mb-4">Shop</p>
        <div class="space-y-3 text-sm text-[var(--color-muted)]">
          <RouterLink class="block hover:text-[var(--color-wine)]" to="/shop?categorySlug=lip">Lip</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" to="/shop?categorySlug=fragrance">Fragrance</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" to="/shop?categorySlug=jewelry">Jewelry</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" to="/shop?categorySlug=bags">Bags</RouterLink>
        </div>
      </div>

      <div>
        <p class="eyebrow mb-4">Policies</p>
        <div class="space-y-3 text-sm text-[var(--color-muted)]">
          <RouterLink class="block hover:text-[var(--color-wine)]" :to="{ name: 'policy', params: { slug: 'privacy' } }">Privacy Policy</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" :to="{ name: 'policy', params: { slug: 'terms' } }">Terms of Service</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" :to="{ name: 'policy', params: { slug: 'refund' } }">Refund Policy</RouterLink>
          <RouterLink class="block hover:text-[var(--color-wine)]" :to="{ name: 'policy', params: { slug: 'shipping' } }">Shipping Policy</RouterLink>
        </div>
      </div>

      <div>
        <p class="eyebrow mb-4">Connect</p>
        <div class="space-y-3 text-sm text-[var(--color-muted)]">
          <a class="flex items-center gap-2 hover:text-[var(--color-wine)]" href="#"><Instagram class="h-4 w-4" />Instagram</a>
          <a class="flex items-center gap-2 hover:text-[var(--color-wine)]" href="#"><Mail class="h-4 w-4" />Support</a>
        </div>
      </div>
    </section>

    <div class="border-t border-[var(--color-border)] px-4 py-5 text-center text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
      2026 Aura Beauty & Style. All rights reserved.
    </div>
  </footer>
</template>
