import { reactive } from 'vue'

const state = reactive({
  items: [],
})

let nextId = 1

function remove(id) {
  const index = state.items.findIndex(item => item.id === id)
  if (index >= 0) {
    state.items.splice(index, 1)
  }
}

function push(type, message, options = {}) {
  const id = nextId++
  const duration = Number(options.duration ?? 2600)
  state.items.push({
    id,
    type,
    message,
  })

  if (duration > 0) {
    window.setTimeout(() => remove(id), duration)
  }

  return id
}

export function useGlobalToast() {
  return {
    success(message, options) {
      return push('success', message, options)
    },
    error(message, options) {
      return push('error', message, options)
    },
    info(message, options) {
      return push('info', message, options)
    },
  }
}

export function useGlobalToastState() {
  return {
    state,
    remove,
  }
}
