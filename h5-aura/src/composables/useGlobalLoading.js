import { reactive } from 'vue'

const state = reactive({
  visible: false,
  text: 'Working...',
  count: 0,
})

function show(text = 'Working...') {
  state.count += 1
  state.visible = true
  state.text = text || 'Working...'
}

function hide() {
  state.count = Math.max(0, state.count - 1)
  if (state.count === 0) {
    state.visible = false
    state.text = 'Working...'
  }
}

async function withLoading(task, text) {
  show(text)
  try {
    return await (typeof task === 'function' ? task() : task)
  } finally {
    hide()
  }
}

export function useGlobalLoading() {
  return {
    show,
    hide,
    withLoading,
  }
}

export function useGlobalLoadingState() {
  return state
}
