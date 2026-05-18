import axios from 'axios'
import { validateApiResponse, toDisplayResult } from '@/utils/helpers'

const API_URL = import.meta.env.VITE_API_URL
const WEBHOOK_PROD = import.meta.env.VITE_API_WEBHOOK_PROD

/** AI generation can take time — 2 minute ceiling before timeout UX */
const REQUEST_TIMEOUT_MS = 120000

/**
 * Base URL from VITE_API_URL (trailing slash stripped).
 */
export function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured. Check your .env file.')
  }
  return API_URL.replace(/\/$/, '')
}

/**
 * Full webhook URL: VITE_API_URL + VITE_API_WEBHOOK_PROD
 */
export function buildWebhookUrl() {
  if (!WEBHOOK_PROD) {
    throw new Error(
      'VITE_API_WEBHOOK_PROD is not configured. Check your .env file.'
    )
  }
  const path = WEBHOOK_PROD.startsWith('/') ? WEBHOOK_PROD : `/${WEBHOOK_PROD}`
  return `${getApiBaseUrl()}${path}`
}

const apiClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: [
    (data) => {
      if (data == null || data === '') return null
      if (typeof data === 'object') return data
      try {
        return JSON.parse(data)
      } catch {
        const err = new Error('Invalid JSON in response')
        err.code = 'INVALID_JSON'
        throw err
      }
    },
  ],
})

/**
 * Build strict contract request body for n8n webhook.
 */
function buildRequestBody(payload) {
  return {
    clientName: String(payload.clientName ?? '').trim(),
    companyName: String(payload.companyName ?? '').trim(),
    shipmentRequirement: String(payload.shipmentRequirement ?? '').trim(),
    country: String(payload.country ?? '').trim(),
  }
}

/**
 * Single POST to n8n webhook — validated, fallback-safe result.
 * @param {object} payload - Lead fields from the form
 * @returns {Promise<{ email: string, linkedinMessage: string, usedFallback?: boolean }>}
 */
export async function postGenerateMessages(payload) {
  const url = buildWebhookUrl()
  const body = buildRequestBody(payload)

  const response = await apiClient.post(url, body)

  if (response.data == null) {
    const err = new Error('Empty response from server')
    err.code = 'EMPTY_RESPONSE'
    throw err
  }

  const validated = validateApiResponse(response.data)
  return toDisplayResult(validated)
}

/**
 * Map axios / network errors to user-facing copy.
 */
export function getApiErrorMessage(error) {
  if (error?.code === 'INVALID_JSON') {
    return 'Received an invalid response from the server. Please try again.'
  }
  if (error?.code === 'EMPTY_RESPONSE') {
    return 'The server returned an empty response. Please try again.'
  }
  if (error?.response?.data?.message) {
    return String(error.response.data.message)
  }
  if (error?.message === 'Network Error' && !error?.response) {
    const isProxied = String(import.meta.env.VITE_API_URL || '').startsWith(
      '/api'
    )
    if (!isProxied && !import.meta.env.DEV) {
      return 'Request blocked by browser (CORS). Configure CORS on n8n or use a reverse proxy.'
    }
    return 'Unable to reach the server. Check your connection and try again.'
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. The AI may still be processing — try again shortly.'
  }
  return error?.message || 'Something went wrong while generating messages.'
}
