/**
 * Centralized Vite environment configuration.
 * All VITE_* vars must be defined at build time for production.
 */

const REQUIRED_VARS = [
  { key: 'VITE_API_URL', label: 'API base URL' },
  { key: 'VITE_API_WEBHOOK_PROD', label: 'Production webhook path' },
]

function read(key) {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * @returns {{
 *   apiUrl: string
 *   webhookProd: string
 *   isDev: boolean
 *   isProd: boolean
 *   isValid: boolean
 *   missing: string[]
 * }}
 */
export function getEnvConfig() {
  const apiUrl = read('VITE_API_URL')
  const webhookProd = read('VITE_API_WEBHOOK_PROD')
  const missing = REQUIRED_VARS.filter(({ key }) => !read(key)).map(
    (v) => v.key
  )

  return {
    apiUrl,
    webhookProd,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    isValid: missing.length === 0,
    missing,
  }
}

/** User-facing list of missing configuration */
export function getEnvConfigErrorMessage() {
  const { missing } = getEnvConfig()
  if (missing.length === 0) return null

  return `Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and set values before building.`
}

/**
 * Production should use full n8n origin OR same-origin reverse proxy (/api).
 */
export function isApiProxied() {
  return getEnvConfig().apiUrl.startsWith('/')
}
