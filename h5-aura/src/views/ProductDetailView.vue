<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, MoveLeft, ShoppingBag, Star } from 'lucide-vue-next'
import { useGlobalToast } from '@/composables/useGlobalToast'
import ProductCard from '@/components/shared/ProductCard.vue'
import { addReview, fetchProductDetail, fetchReviews } from '@/lib/shop'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { isBlank, normalizeOptionalText, normalizeText } from '@/utils/validation'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const toast = useGlobalToast()
const product = ref(null)
const reviews = ref([])
const loading = ref(true)
const currentImage = ref('')
const reviewForm = ref({ rating: 5, title: '', content: '' })

const isFavorite = computed(() => favoriteStore.ids.includes(Number(route.params.id)))

async function loadProduct() {
  loading.value = true
  try {
    product.value = await fetchProductDetail(route.params.id)
    reviews.value = await fetchReviews(route.params.id)
    currentImage.value = product.value.gallery?.[0] || product.value.mainImage
  } catch (error) {
    product.value = null
    reviews.value = []
    toast.error(error.message || 'Unable to load this product.')
  } finally {
    loading.value = false
  }
}

async function addItemToCart() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'auth', query: { redirect: route.fullPath } })
    return
  }
  await cartStore.addItem(product.value.id, 1)
  router.push({ name: 'cart' })
}

async function toggleFavoriteItem() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'auth', query: { redirect: route.fullPath } })
    return
  }
  await favoriteStore.toggle(product.value.id)
}

async function submitReview() {
  if (!userStore.isLoggedIn) {
    router.push({ name: 'auth', query: { redirect: route.fullPath } })
    return
  }

  const title = normalizeOptionalText(reviewForm.value.title)
  const content = normalizeText(reviewForm.value.content)

  if (isBlank(content)) {
    toast.error('Review content cannot be empty.')
    return
  }

  try {
    reviews.value = await addReview({
      productId: product.value.id,
      rating: reviewForm.value.rating,
      title,
      content,
    })
    reviewForm.value = { rating: 5, title: '', content: '' }
    toast.success('Review posted.')
  } catch (error) {
    toast.error(error.message || 'Unable to post your review.')
  }
}

function setReviewRating(value) {
  reviewForm.value.rating = value
}

onMounted(loadProduct)
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <button
      class="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]"
      type="button"
      @click="router.back()"
    >
      <MoveLeft class="h-4 w-4" />
      Back
    </button>

    <template v-if="loading">
      <div class="grid gap-10 lg:grid-cols-[1fr_0.92fr]">
        <div>
          <div class="skeleton-panel p-3">
            <div class="skeleton-block aspect-[4/5] w-full rounded-[1.1rem]"></div>
          </div>
          <div class="mt-4 grid grid-cols-4 gap-3">
            <div
              v-for="index in 4"
              :key="`thumb-skeleton-${index}`"
              class="skeleton-block aspect-square rounded-[0.95rem]"
            ></div>
          </div>
        </div>

        <div>
          <div class="skeleton-block skeleton-line w-28"></div>
          <div class="mt-4 skeleton-block h-14 w-4/5 rounded-[1.7rem]"></div>
          <div class="mt-4 skeleton-block skeleton-line w-2/3"></div>

          <div class="mt-5 flex items-center gap-3">
            <div class="skeleton-block skeleton-line w-24"></div>
            <div class="skeleton-block skeleton-line w-32"></div>
          </div>

          <div class="mt-6 flex items-end gap-3">
            <div class="skeleton-block h-10 w-28 rounded-[1rem]"></div>
            <div class="skeleton-block skeleton-line w-20"></div>
          </div>

          <div class="mt-6 space-y-3">
            <div class="skeleton-block skeleton-line w-full"></div>
            <div class="skeleton-block skeleton-line w-[92%]"></div>
            <div class="skeleton-block skeleton-line w-[78%]"></div>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-2">
            <div class="skeleton-block h-12 rounded-full"></div>
            <div class="skeleton-block h-12 rounded-full"></div>
          </div>

          <div class="skeleton-panel mt-10 p-6">
            <div class="mb-6">
              <div class="skeleton-block skeleton-line w-36"></div>
            </div>
            <div class="grid gap-4">
              <div class="skeleton-block h-14 rounded-[1.2rem]"></div>
              <div
                class="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-4"
              >
                <div class="flex items-center justify-between gap-4">
                  <div class="skeleton-block skeleton-line w-24"></div>
                  <div class="skeleton-block skeleton-line w-16"></div>
                </div>
                <div class="mt-4 flex items-center gap-2">
                  <div
                    v-for="index in 5"
                    :key="`rating-skeleton-${index}`"
                    class="skeleton-block h-11 w-11 rounded-full"
                  ></div>
                </div>
              </div>
              <div class="skeleton-block h-30 rounded-[1.2rem]"></div>
              <div class="skeleton-block h-12 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-16">
        <div class="mb-6 space-y-4">
          <div class="skeleton-block skeleton-line w-36"></div>
          <div class="skeleton-block h-11 w-72 rounded-[1.4rem]"></div>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="index in 3"
            :key="`review-card-skeleton-${index}`"
            class="skeleton-panel p-6"
          >
            <div class="flex gap-2">
              <div
                v-for="star in 5"
                :key="`${index}-${star}`"
                class="skeleton-block h-4 w-4 rounded-full"
              ></div>
            </div>
            <div class="mt-4 space-y-3">
              <div class="skeleton-block skeleton-line w-2/3"></div>
              <div class="skeleton-block skeleton-line w-full"></div>
              <div class="skeleton-block skeleton-line w-[88%]"></div>
              <div class="skeleton-block skeleton-line w-1/4"></div>
            </div>
          </article>
        </div>
      </section>

      <section class="mt-16">
        <div class="mb-6 space-y-4">
          <div class="skeleton-block skeleton-line w-32"></div>
          <div class="skeleton-block h-11 w-64 rounded-[1.4rem]"></div>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="index in 4"
            :key="`related-skeleton-${index}`"
            class="skeleton-panel overflow-hidden p-4"
          >
            <div class="skeleton-block aspect-[4/5] w-full rounded-[1.1rem]"></div>
            <div class="mt-5 space-y-3">
              <div class="skeleton-block skeleton-line w-3/4"></div>
              <div class="skeleton-block skeleton-line w-1/2"></div>
              <div class="skeleton-block skeleton-line w-1/3"></div>
            </div>
          </article>
        </div>
      </section>
    </template>

    <template v-else-if="product">
      <div class="grid gap-10 lg:grid-cols-[1fr_0.92fr]">
        <div>
          <div
            class="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white p-3 shadow-[0_18px_40px_rgba(17,17,17,0.06)]"
          >
            <img
              :alt="product.name"
              :src="currentImage"
              class="aspect-[4/5] w-full rounded-[1.1rem] object-cover"
            />
          </div>
          <div class="mt-4 grid grid-cols-4 gap-3">
            <button
              v-for="image in product.gallery || [product.mainImage]"
              :key="image"
              class="overflow-hidden rounded-[0.95rem] border border-[var(--color-border)] bg-white p-1"
              type="button"
              @click="currentImage = image"
            >
              <img
                :alt="product.name"
                :src="image"
                class="aspect-square w-full rounded-[1rem] object-cover"
              />
            </button>
          </div>
        </div>

        <div>
          <p class="eyebrow">{{ product.category?.name || 'Product detail' }}</p>
          <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">
            {{ product.name }}
          </h1>

          <div class="mt-5 flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <div class="inline-flex items-center gap-1 text-[var(--color-accent)]">
              <Star class="h-4 w-4 fill-current" />
              <span class="font-semibold text-[var(--color-ink)]">
                {{ product.rating || 4.8 }}
              </span>
            </div>
            <span>•</span>
            <span>{{ product.reviewCount || reviews.length }} reviews</span>
          </div>

          <div class="mt-6 flex items-end gap-3">
            <span class="text-3xl font-semibold text-[var(--color-wine)]">
              ${{ Number(product.price).toFixed(2) }}
            </span>
            <span
              v-if="product.comparePrice"
              class="text-lg text-[var(--color-muted)] line-through"
            >
              ${{ Number(product.comparePrice).toFixed(2) }}
            </span>
          </div>

          <p class="mt-6 max-w-xl text-base leading-8 text-[var(--color-muted)]">
            {{ product.description }}
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              class="primary-pill justify-center sm:flex-1"
              type="button"
              @click="addItemToCart"
            >
              <ShoppingBag class="h-4 w-4" />
              Add to cart
            </button>
            <button
              class="secondary-pill justify-center sm:flex-1"
              type="button"
              @click="toggleFavoriteItem"
            >
              <Heart
                :class="['h-4 w-4', isFavorite ? 'fill-current text-[var(--color-wine)]' : '']"
              />
              {{ isFavorite ? 'Saved' : 'Save for later' }}
            </button>
          </div>

          <div
            class="mt-10 rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]"
          >
            <p class="eyebrow mb-4">Review this product</p>
            <div class="grid gap-4">
              <input
                v-model="reviewForm.title"
                class="field-input"
                placeholder="Review title"
                type="text"
              />
              <div
                class="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-4"
              >
                <div class="flex items-center justify-between gap-4">
                  <p class="text-sm font-semibold text-[var(--color-ink)]">Your rating</p>
                  <p class="text-sm text-[var(--color-muted)]">
                    {{ reviewForm.rating }} {{ reviewForm.rating === 1 ? 'star' : 'stars' }}
                  </p>
                </div>
                <div class="mt-4 flex items-center gap-2">
                  <button
                    v-for="value in 5"
                    :key="value"
                    type="button"
                    class="inline-flex h-11 w-11 items-center justify-center rounded-full border transition"
                    :class="
                      value <= reviewForm.rating
                        ? 'border-[rgba(217,165,143,0.45)] bg-white text-[var(--color-accent)] shadow-[0_10px_20px_rgba(217,165,143,0.18)]'
                        : 'border-[var(--color-border)] bg-white text-[rgba(117,109,109,0.45)] hover:text-[var(--color-accent)]'
                    "
                    @click="setReviewRating(value)"
                  >
                    <Star
                      class="h-5 w-5"
                      :class="value <= reviewForm.rating ? 'fill-current' : ''"
                    />
                  </button>
                </div>
              </div>
              <textarea
                v-model="reviewForm.content"
                class="field-input min-h-30 resize-y"
                placeholder="Share your experience"
              ></textarea>
              <button class="primary-pill justify-center" type="button" @click="submitReview">
                Post review
              </button>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-16">
        <div class="mb-6 flex items-end justify-between">
          <div>
            <p class="eyebrow">Customer Reviews</p>
            <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
              What shoppers are saying.
            </h2>
          </div>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="review in reviews"
            :key="review.id"
            class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.05)]"
          >
            <div class="inline-flex items-center gap-1 text-[var(--color-accent)]">
              <Star v-for="value in review.rating" :key="value" class="h-4 w-4 fill-current" />
            </div>
            <h3 class="mt-4 font-semibold text-[var(--color-ink)]">{{ review.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-[var(--color-muted)]">{{ review.content }}</p>
            <p class="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-wine)]">
              {{ review.userName }}
            </p>
          </article>
        </div>
      </section>

      <section v-if="product.relatedProducts?.length" class="mt-16">
        <div class="mb-6">
          <p class="eyebrow">You may also like</p>
          <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
            More from this edit.
          </h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ProductCard v-for="item in product.relatedProducts" :key="item.id" :product="item" />
        </div>
      </section>
    </template>

    <div
      v-else
      class="rounded-[1.1rem] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center text-[var(--color-muted)]"
    >
      Product not found.
    </div>
  </section>
</template>
