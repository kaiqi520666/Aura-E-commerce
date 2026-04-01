<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalConfirm } from '@/composables/useGlobalConfirm'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import { hasMinLength, isBlank, isLikelyPhone, isValidHttpUrl, normalizeOptionalText, normalizeText } from '@/utils/validation'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const { confirm } = useGlobalConfirm()
const { withLoading } = useGlobalLoading()
const toast = useGlobalToast()
const profileForm = ref({ nickName: '', email: '', phone: '', description: '', avatarUrl: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const addressForm = ref({
  id: null,
  firstName: '',
  lastName: '',
  phone: '',
  country: 'United States',
  state: '',
  city: '',
  postalCode: '',
  addressLine1: '',
  addressLine2: '',
  isDefault: false,
})

const fullName = computed(() => userStore.profile?.nickName || userStore.displayName)

function resetAddressForm() {
  addressForm.value = {
    id: null,
    firstName: '',
    lastName: '',
    phone: '',
    country: 'United States',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: '',
    isDefault: false,
  }
}

function editAddress(address) {
  addressForm.value = { ...address }
}

async function saveProfile() {
  const phone = normalizeOptionalText(profileForm.value.phone)
  const avatarUrl = normalizeOptionalText(profileForm.value.avatarUrl)
  const description = normalizeOptionalText(profileForm.value.description)

  if (phone && !isLikelyPhone(phone)) {
    toast.error('Please enter a valid phone number.')
    return
  }
  if (!isValidHttpUrl(avatarUrl)) {
    toast.error('Avatar URL must start with http:// or https://')
    return
  }

  try {
    await withLoading(async () => {
      await userStore.updateProfile({
        phone,
        avatarUrl,
        description,
      })
      profileForm.value = {
        ...profileForm.value,
        phone,
        avatarUrl,
        description,
      }
    }, 'Saving your profile...')
    toast.success('Profile updated.')
  } catch (error) {
    toast.error(error.message || 'Unable to update your profile.')
  }
}

async function savePassword() {
  const oldPassword = String(passwordForm.value.oldPassword || '')
  const newPassword = String(passwordForm.value.newPassword || '')

  if (!oldPassword || !newPassword) {
    toast.error('Current password and new password are required.')
    return
  }
  if (!hasMinLength(newPassword, 6)) {
    toast.error('New password must be at least 6 characters.')
    return
  }
  if (oldPassword === newPassword) {
    toast.error('New password must be different from the current password.')
    return
  }

  try {
    await withLoading(async () => {
      await userStore.updatePassword({
        oldPassword,
        newPassword,
      })
    }, 'Updating your password...')
    passwordForm.value = { oldPassword: '', newPassword: '' }
    toast.success('Password updated.')
  } catch (error) {
    toast.error(error.message || 'Unable to update your password.')
  }
}

async function saveAddressItem() {
  const payload = {
    ...addressForm.value,
    firstName: normalizeText(addressForm.value.firstName),
    lastName: normalizeOptionalText(addressForm.value.lastName),
    phone: normalizeText(addressForm.value.phone),
    country: normalizeText(addressForm.value.country),
    state: normalizeText(addressForm.value.state),
    city: normalizeText(addressForm.value.city),
    postalCode: normalizeOptionalText(addressForm.value.postalCode),
    addressLine1: normalizeText(addressForm.value.addressLine1),
    addressLine2: normalizeOptionalText(addressForm.value.addressLine2),
  }

  if (
    isBlank(payload.firstName) ||
    isBlank(payload.phone) ||
    isBlank(payload.country) ||
    isBlank(payload.state) ||
    isBlank(payload.city) ||
    isBlank(payload.addressLine1)
  ) {
    toast.error('Please complete the required address fields.')
    return
  }
  if (!isLikelyPhone(payload.phone)) {
    toast.error('Please enter a valid phone number for this address.')
    return
  }

  try {
    await withLoading(async () => {
      await userStore.saveAddress(payload)
    }, payload.id ? 'Updating your address...' : 'Saving your address...')
    resetAddressForm()
    toast.success('Address saved.')
  } catch (error) {
    toast.error(error.message || 'Unable to save this address.')
  }
}

async function removeAddress(id) {
  const approved = await confirm({
    title: 'Delete this address?',
    message: 'This saved shipping address will be removed from your account.',
    confirmText: 'Delete',
    cancelText: 'Keep',
    tone: 'danger',
  })
  if (!approved) return

  try {
    await userStore.deleteAddress(id)
    toast.success('Address deleted.')
  } catch (error) {
    toast.error(error.message || 'Unable to delete this address.')
  }
}

async function signOut() {
  const approved = await confirm({
    title: 'Log out now?',
    message: 'You will need to sign in again to access your account, orders, and saved items.',
    confirmText: 'Log out',
    cancelText: 'Stay here',
  })
  if (!approved) return

  try {
    await withLoading(async () => {
      await userStore.logout()
      cartStore.reset()
      favoriteStore.reset()
      await router.push('/')
    }, 'Signing you out...')
    toast.success('You have been logged out.')
  } catch (error) {
    toast.error(error.message || 'Unable to log out right now.')
  }
}

onMounted(async () => {
  await Promise.all([userStore.fetchProfile(), userStore.fetchAddresses()])
  profileForm.value = {
    nickName: userStore.profile?.nickName || '',
    email: userStore.profile?.email || '',
    phone: userStore.profile?.phone || '',
    description: userStore.profile?.description || '',
    avatarUrl: userStore.profile?.avatarUrl || '',
  }
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">User Center</p>
        <h1 class="mt-3 font-[var(--font-display)] text-5xl text-[var(--color-ink)]">{{ fullName }}</h1>
      </div>
      <div class="flex flex-wrap gap-3"><button class="primary-pill" type="button" @click="router.push('/orders')">View orders</button><button class="secondary-pill" type="button" @click="signOut">Logout</button></div>
    </div>

    <div class="grid gap-8 lg:grid-cols-2">
      <section class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
        <p class="eyebrow mb-4">Profile</p>
        <div class="grid gap-4">
          <input
            v-model="profileForm.nickName"
            readonly
            class="field-input cursor-not-allowed bg-[rgba(248,246,244,0.7)] text-[var(--color-muted)]"
            placeholder="Display name"
            type="text"
          />
          <input
            v-model="profileForm.email"
            readonly
            class="field-input cursor-not-allowed bg-[rgba(248,246,244,0.7)] text-[var(--color-muted)]"
            placeholder="Email"
            type="email"
          />
          <input v-model="profileForm.phone" class="field-input" placeholder="Phone" type="text" />
          <input v-model="profileForm.avatarUrl" class="field-input" placeholder="Avatar URL" type="text" />
          <textarea v-model="profileForm.description" class="field-input min-h-28 resize-y" placeholder="Short bio"></textarea>
          <button class="primary-pill justify-center" type="button" @click="saveProfile">Save profile</button>
        </div>
      </section>

      <section class="rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
        <p class="eyebrow mb-4">Password</p>
        <div class="grid gap-4">
          <input v-model="passwordForm.oldPassword" class="field-input" placeholder="Current password" type="password" />
          <input v-model="passwordForm.newPassword" class="field-input" placeholder="New password" type="password" />
          <button class="secondary-pill justify-center" type="button" @click="savePassword">Update password</button>
        </div>
      </section>
    </div>

    <section class="mt-10 rounded-[1.1rem] border border-[var(--color-border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.04)]">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <p class="eyebrow">Address Book</p>
          <h2 class="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">Shipping addresses</h2>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div class="grid gap-4">
          <article v-for="address in userStore.addresses" :key="address.id" class="rounded-[1.1rem] border border-[var(--color-border)] p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-semibold text-[var(--color-ink)]">{{ address.firstName }} {{ address.lastName }}</p>
                <p class="mt-2 text-sm text-[var(--color-muted)]">{{ address.addressLine1 }} {{ address.addressLine2 }}</p>
                <p class="text-sm text-[var(--color-muted)]">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                <p class="text-sm text-[var(--color-muted)]">{{ address.country }} • {{ address.phone }}</p>
              </div>
              <div class="flex gap-2">
                <button class="secondary-pill !px-4 !py-2" type="button" @click="editAddress(address)">Edit</button>
                <button class="secondary-pill !px-4 !py-2" type="button" @click="removeAddress(address.id)">Delete</button>
              </div>
            </div>
          </article>
        </div>

        <div class="rounded-[1.1rem] border border-[var(--color-border)] bg-[var(--color-cream)] p-5">
          <p class="eyebrow mb-4">Add or edit</p>
          <div class="grid gap-3">
            <div class="grid grid-cols-2 gap-3">
              <input v-model="addressForm.firstName" class="field-input" placeholder="First name" type="text" />
              <input v-model="addressForm.lastName" class="field-input" placeholder="Last name" type="text" />
            </div>
            <input v-model="addressForm.phone" class="field-input" placeholder="Phone" type="text" />
            <input v-model="addressForm.country" class="field-input" placeholder="Country" type="text" />
            <div class="grid grid-cols-2 gap-3">
              <input v-model="addressForm.state" class="field-input" placeholder="State" type="text" />
              <input v-model="addressForm.city" class="field-input" placeholder="City" type="text" />
            </div>
            <input v-model="addressForm.postalCode" class="field-input" placeholder="Postal code" type="text" />
            <input v-model="addressForm.addressLine1" class="field-input" placeholder="Address line 1" type="text" />
            <input v-model="addressForm.addressLine2" class="field-input" placeholder="Address line 2" type="text" />
            <label class="flex items-center gap-2 text-sm text-[var(--color-muted)]"><input v-model="addressForm.isDefault" type="checkbox" /> Set as default</label>
            <button class="primary-pill justify-center" type="button" @click="saveAddressItem">Save address</button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
