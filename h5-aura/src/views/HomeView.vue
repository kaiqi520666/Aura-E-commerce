<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, ArrowUpRight, MoveRight, Sparkles, Star } from 'lucide-vue-next'
import ProductCard from '@/components/shared/ProductCard.vue'
import {
  communityPosts,
  fallbackCategories,
  fallbackProducts,
  occasionCards,
  vibeCards,
} from '@/data/content'
import { fetchHomeData } from '@/lib/shop'

const loading = ref(true)
const homeData = ref({
  categories: fallbackCategories,
  bestSellers: fallbackProducts.filter((item) => item.bestSeller).slice(0, 4),
  featuredProducts: fallbackProducts.filter((item) => item.featured).slice(0, 8),
})

const leadVibe = computed(() => vibeCards[0] ?? null)
const secondaryVibes = computed(() => vibeCards.slice(1))
const vibeLabels = ['Lead Edit', 'Soft Focus', 'After Dark', 'Quiet Luxury']
const vibeKickers = [
  'For polished days',
  'Elevated texture',
  'Night-out tones',
  'Refined essentials',
]
const secondaryImageClasses = [
  'h-[136%] w-[132%] object-cover object-[58%_center]',
  'h-[138%] w-[134%] object-cover object-[58%_center]',
  'h-[134%] w-[130%] object-cover object-[60%_center]',
]

onMounted(async () => {
  try {
    homeData.value = await fetchHomeData()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <section class="bg-[linear-gradient(135deg,rgba(248,246,244,1),rgba(252,238,233,0.75))]">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-18"
      >
        <div class="order-2 flex flex-col justify-center lg:order-1">
          <p class="eyebrow mb-4">Own Your Glow</p>
          <h1
            class="max-w-xl font-(--font-display) text-5xl leading-[0.95] text-(--color-ink) sm:text-6xl lg:text-7xl"
          >
            Soft. Bold. Unforgettable.
          </h1>
          <p class="mt-6 max-w-lg text-base leading-8 text-(--color-muted)">
            Beauty, scent, jewelry, and bags curated for the modern feminine wardrobe. A light
            luxury storefront built for clean visuals and quick gifting.
          </p>
          <div class="mt-8 flex flex-col gap-4 sm:flex-row">
            <RouterLink class="primary-pill" to="/shop">
              Shop Now
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <RouterLink class="secondary-pill" :to="{ name: 'shop', query: { sort: 'priceDesc' } }">
              Explore The Vibe
              <ArrowUpRight class="h-4 w-4" />
            </RouterLink>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <div
            class="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/50 p-3 shadow-[0_40px_90px_rgba(17,17,17,0.1)]"
          >
            <img
              alt="Aura hero"
              class="aspect-4/5 w-full rounded-[1.1rem] object-cover object-center"
              src="/images/Gemini_Generated_Image_b3jedgb3jedgb3je.jpg"
            />

            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-34 bg-linear-to-t from-[rgba(120,58,56,0.28)] via-[rgba(120,58,56,0.1)] to-transparent md:hidden"
            ></div>

            <div
              class="absolute bottom-7 left-7 hidden max-w-92 rounded-[1.1rem] bg-white/88 px-5 py-4 shadow-[0_18px_40px_rgba(17,17,17,0.08)] backdrop-blur-md md:block"
            >
              <p class="eyebrow">Soft Luxe Edit</p>
              <p class="mt-2 font-(--font-display) text-2xl text-(--color-ink)">
                Effortless pieces for everyday glamour.
              </p>
            </div>
          </div>

          <div
            class="relative z-10 mx-4 -mt-9 rounded-[1.1rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,251,249,0.96),rgba(248,239,236,0.92))] p-4 shadow-[0_20px_45px_rgba(17,17,17,0.08)] backdrop-blur-md md:hidden"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="eyebrow">Soft Luxe Edit</p>
                <p
                  class="mt-3 max-w-[14rem] font-[var(--font-display)] text-[2rem] leading-[0.95] text-[var(--color-ink)]"
                >
                  Effortless pieces for everyday glamour.
                </p>
              </div>
              <span
                class="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-[var(--color-wine)] shadow-[0_10px_24px_rgba(128,47,68,0.12)]"
              >
                <Sparkles class="h-4 w-4" />
              </span>
            </div>
            <div
              class="mt-4 flex items-center gap-2 border-t border-[rgba(128,47,68,0.1)] pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
            >
              <span class="rounded-full bg-white px-3 py-1.5 text-[var(--color-wine)]"
                >Daily glow</span
              >
              <span class="rounded-full bg-white px-3 py-1.5">Gift-ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Shop By Vibe</p>
          <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
            Find your mood first.
          </h2>
        </div>
        <p class="max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Explore curated moods with a softer, lighter editorial layout that feels closer to the
          rest of the storefront.
        </p>
      </div>

      <div class="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <RouterLink
          v-if="leadVibe"
          :to="{ name: 'shop' }"
          class="group relative block min-h-[24rem] overflow-hidden rounded-[1.35rem] border border-[rgba(128,47,68,0.12)] bg-[linear-gradient(135deg,#f9f3ef,#f4ece7)] p-4 shadow-[0_24px_55px_rgba(17,17,17,0.06)] lg:min-h-[32rem]"
        >
          <img
            :alt="leadVibe.name"
            :src="leadVibe.image"
            class="absolute right-[-7%] bottom-[-5%] h-[112%] w-[92%] object-contain transition duration-700 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.92),rgba(255,255,255,0.52)_34%,rgba(255,255,255,0.04)_66%)]"
          ></div>
          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <div
                class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,248,245,0.28))] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-wine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_26px_rgba(128,47,68,0.08)] backdrop-blur-[18px]"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-[var(--color-wine)]"></span>
                {{ vibeLabels[0] }}
              </div>
              <span
                class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,248,245,0.28))] text-[var(--color-wine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_28px_rgba(128,47,68,0.08)] backdrop-blur-[18px] transition group-hover:-translate-y-1"
              >
                <ArrowUpRight class="h-4 w-4" />
              </span>
            </div>

            <div
              class="max-w-[19rem] rounded-[1.2rem] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.56),rgba(255,248,245,0.2))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_16px_36px_rgba(17,17,17,0.06)] backdrop-blur-[22px]"
            >
              <p
                class="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-wine)]/72"
              >
                {{ vibeKickers[0] }}
              </p>
              <h3
                class="mt-3 font-[var(--font-display)] text-[3rem] leading-[0.9] text-[var(--color-ink)] sm:text-[3.6rem]"
              >
                {{ leadVibe.name }}
              </h3>
              <p class="mt-3 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
                {{ leadVibe.desc }}
              </p>
            </div>
          </div>
        </RouterLink>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <RouterLink
            v-for="(item, index) in secondaryVibes"
            :key="item.id"
            :to="{ name: 'shop' }"
            class="group relative block min-h-[14.5rem] overflow-hidden rounded-[1.2rem] border border-[rgba(128,47,68,0.12)] bg-[linear-gradient(135deg,#fbf6f2,#f3ece6)] p-4 shadow-[0_18px_42px_rgba(17,17,17,0.05)]"
          >
            <div
              class="absolute inset-y-0 right-0 w-[49%] overflow-hidden bg-[linear-gradient(180deg,rgba(248,239,233,0.82),rgba(243,233,226,0.96))]"
            >
              <img
                :alt="item.name"
                :src="item.image"
                class="absolute right-[-18%] top-1/2 -translate-y-1/2 transition duration-700 group-hover:scale-[1.08]"
                :class="secondaryImageClasses[index]"
              />
              <div
                class="absolute inset-0 bg-[linear-gradient(270deg,rgba(255,250,247,0.02),rgba(255,250,247,0.28)_35%,rgba(255,250,247,0.78)_100%)]"
              ></div>
            </div>

            <div
              class="absolute inset-y-4 right-[49%] w-px bg-[linear-gradient(180deg,rgba(128,47,68,0),rgba(128,47,68,0.12),rgba(128,47,68,0))]"
            ></div>

            <div class="relative flex h-full flex-col justify-between pr-[43%]">
              <div class="flex items-start justify-between gap-4">
                <span
                  class="inline-flex rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,248,245,0.26))] px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-wine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(128,47,68,0.07)] backdrop-blur-[16px]"
                >
                  {{ vibeLabels[index + 1] }}
                </span>
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,248,245,0.28))] text-[var(--color-wine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(128,47,68,0.07)] backdrop-blur-[16px] transition group-hover:-translate-y-1"
                >
                  <ArrowUpRight class="h-4 w-4" />
                </span>
              </div>

              <div
                class="max-w-[15rem] rounded-[1rem] border border-white/72 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(255,248,245,0.22))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_14px_30px_rgba(17,17,17,0.05)] backdrop-blur-[18px]"
              >
                <p
                  class="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-wine)]/70"
                >
                  {{ vibeKickers[index + 1] }}
                </p>
                <h3
                  class="mt-2 font-[var(--font-display)] text-[2.05rem] leading-[0.92] text-[var(--color-ink)]"
                >
                  {{ item.name }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-[var(--color-muted)]">{{ item.desc }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="bg-white/75 py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex items-end justify-between">
          <div>
            <p class="eyebrow">The Essentials</p>
            <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
              Best sellers with soft authority.
            </h2>
          </div>
          <RouterLink
            class="hidden items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-wine)] md:inline-flex"
            to="/shop"
          >
            View All
            <MoveRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ProductCard
            v-for="product in homeData.bestSellers"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-2">
        <article
          v-for="card in occasionCards"
          :key="card.id"
          class="group relative overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_22px_50px_rgba(17,17,17,0.05)]"
        >
          <img
            :alt="card.name"
            :src="card.image"
            class="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-x-0 bottom-0 p-6">
            <div
              class="max-w-sm rounded-[0.95rem] bg-[color:rgba(255,248,246,0.82)] p-6 backdrop-blur-md"
            >
              <p class="eyebrow">Occasion Edit</p>
              <h3 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
                {{ card.name }}
              </h3>
              <RouterLink class="primary-pill mt-5 inline-flex" :to="{ name: 'shop' }"
                >Shop the look</RouterLink
              >
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-[color:rgba(248,246,244,0.7)] py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 text-center">
          <p class="eyebrow">Curated Collection</p>
          <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
            A storefront with room to browse.
          </h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ProductCard
            v-for="product in homeData.featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <p class="eyebrow">Loved By The Community</p>
        <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
          Styled by you.
        </h2>
      </div>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="post in communityPosts"
          :key="post.id"
          class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-4 shadow-[0_18px_45px_rgba(17,17,17,0.05)]"
        >
          <img
            :alt="post.user"
            :src="post.image"
            class="aspect-square w-full rounded-[1.1rem] object-cover"
          />
          <div class="mt-4 inline-flex items-center gap-1 text-[var(--color-accent)]">
            <Star v-for="value in 5" :key="value" class="h-4 w-4 fill-current" />
          </div>
          <p class="mt-3 text-sm leading-7 text-[var(--color-muted)]">{{ post.text }}</p>
          <p class="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-wine)]">
            {{ post.user }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
