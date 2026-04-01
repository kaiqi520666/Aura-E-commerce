<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useUserStore } from '@/stores/user'
import { hasMinLength, isBlank, isValidEmail, normalizeOptionalText, normalizeText } from '@/utils/validation'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const mode = ref('login')
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ email: '', password: '', nickName: '' })

const redirectTarget = computed(() => route.query.redirect || '/account')

async function handleLogin() {
  const email = normalizeText(loginForm.value.email)
  const password = String(loginForm.value.password || '')

  if (!email || !password) {
    toast.error('Email and password are required.')
    return
  }
  if (!isValidEmail(email)) {
    toast.error('Please enter a valid email address.')
    return
  }

  try {
    await withLoading(async () => {
      await userStore.signIn({
        email,
        password,
      })
      await router.push(redirectTarget.value)
    }, 'Signing you in...')
  } catch (error) {
    toast.error(error.message || 'Unable to sign in.')
  }
}

async function handleRegister() {
  const email = normalizeText(registerForm.value.email)
  const password = String(registerForm.value.password || '')
  const nickName = normalizeOptionalText(registerForm.value.nickName)

  if (isBlank(email) || !password) {
    toast.error('Email and password are required.')
    return
  }
  if (!isValidEmail(email)) {
    toast.error('Please enter a valid email address.')
    return
  }
  if (!hasMinLength(password, 6)) {
    toast.error('Password must be at least 6 characters.')
    return
  }

  try {
    await withLoading(async () => {
      await userStore.signUp({
        email,
        password,
        nickName,
      })
      await router.push(redirectTarget.value)
    }, 'Creating your account...')
  } catch (error) {
    toast.error(error.message || 'Unable to create your account.')
  }
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_30px_70px_rgba(17,17,17,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
      <div class="bg-[linear-gradient(145deg,rgba(128,47,68,0.95),rgba(235,207,200,0.8))] p-8 text-white lg:p-12">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Account Access</p>
        <h1 class="mt-4 font-[var(--font-display)] text-5xl leading-[0.95]">Sign in to save favorites, pay faster, and share proxy links.</h1>
        <p class="mt-6 max-w-sm text-sm leading-7 text-white/82">This MVP keeps authentication simple: email + password, personal profile, address book, and direct access to your order history.</p>
      </div>

      <div class="p-8 lg:p-12">
        <div class="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] p-1">
          <button :class="mode === 'login' ? 'bg-white text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-muted)]'" class="rounded-full px-5 py-2 text-sm font-semibold" type="button" @click="mode = 'login'">Login</button>
          <button :class="mode === 'register' ? 'bg-white text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-muted)]'" class="rounded-full px-5 py-2 text-sm font-semibold" type="button" @click="mode = 'register'">Register</button>
        </div>

        <form v-if="mode === 'login'" class="mt-8 grid gap-4" @submit.prevent="handleLogin">
          <input v-model="loginForm.email" class="field-input" placeholder="Email" type="email" />
          <input v-model="loginForm.password" class="field-input" placeholder="Password" type="password" />
          <button class="primary-pill justify-center" type="submit">Sign in</button>
        </form>

        <form v-else class="mt-8 grid gap-4" @submit.prevent="handleRegister">
          <input v-model="registerForm.nickName" class="field-input" placeholder="Display name" type="text" />
          <input v-model="registerForm.email" class="field-input" placeholder="Email" type="email" />
          <input v-model="registerForm.password" class="field-input" placeholder="Password" type="password" />
          <button class="primary-pill justify-center" type="submit">Create account</button>
        </form>
      </div>
    </div>
  </section>
</template>
