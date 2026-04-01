const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeText(value) {
  return String(value ?? '').trim()
}

export function normalizeOptionalText(value) {
  return normalizeText(value)
}

export function isBlank(value) {
  return !normalizeText(value)
}

export function hasMinLength(value, min) {
  return normalizeText(value).length >= min
}

export function isValidEmail(value) {
  return EMAIL_RE.test(normalizeText(value))
}

export function isLikelyPhone(value) {
  const digits = normalizeText(value).replace(/[^\d]/g, '')
  return digits.length >= 6 && digits.length <= 20
}

export function isValidHttpUrl(value) {
  const input = normalizeText(value)
  if (!input) return true

  try {
    const url = new URL(input)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}
