import { reactive } from 'vue'

const DEFAULT_TITLE = 'Confirm action'
const DEFAULT_MESSAGE = 'Please confirm that you want to continue.'
const DEFAULT_CONFIRM_TEXT = 'Confirm'
const DEFAULT_CANCEL_TEXT = 'Cancel'

const state = reactive({
  visible: false,
  title: DEFAULT_TITLE,
  message: DEFAULT_MESSAGE,
  confirmText: DEFAULT_CONFIRM_TEXT,
  cancelText: DEFAULT_CANCEL_TEXT,
  tone: 'default',
})

let resolver = null

function resetState() {
  state.visible = false
  state.title = DEFAULT_TITLE
  state.message = DEFAULT_MESSAGE
  state.confirmText = DEFAULT_CONFIRM_TEXT
  state.cancelText = DEFAULT_CANCEL_TEXT
  state.tone = 'default'
}

function resolveConfirm(value) {
  const currentResolver = resolver
  resolver = null
  resetState()
  currentResolver?.(value)
}

function confirm(options = {}) {
  if (resolver) {
    resolveConfirm(false)
  }

  state.visible = true
  state.title = options.title || DEFAULT_TITLE
  state.message = options.message || DEFAULT_MESSAGE
  state.confirmText = options.confirmText || DEFAULT_CONFIRM_TEXT
  state.cancelText = options.cancelText || DEFAULT_CANCEL_TEXT
  state.tone = options.tone === 'danger' ? 'danger' : 'default'

  return new Promise(resolve => {
    resolver = resolve
  })
}

export function useGlobalConfirm() {
  return {
    confirm,
  }
}

export function useGlobalConfirmState() {
  return {
    state,
    resolveConfirm,
  }
}
