import { useCallback, useRef, useState } from 'react'
import { postGenerateMessages, getApiErrorMessage } from '@/services/api'
import {
  validateLeadForm,
  createSubmitGuard,
  getLeadPayloadKey,
} from '@/utils/helpers'

const SUBMIT_COOLDOWN_MS = 400
const submitGuard = createSubmitGuard(SUBMIT_COOLDOWN_MS)

/**
 * Data-fetching hook for AI outreach generation.
 * Manages loading / success / error, caches last success, blocks duplicate calls.
 */
export function useGenerateMessages() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cacheRef = useRef({ payloadKey: null, data: null })
  const inFlightRef = useRef(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleGenerate = useCallback(async (lead) => {
    const validation = validateLeadForm(lead)
    if (!validation.valid) {
      return { success: false, errors: validation.errors }
    }

    if (inFlightRef.current) {
      return { success: false, errors: {}, skipped: true }
    }

    if (!submitGuard.canSubmit()) {
      return { success: false, errors: {}, skipped: true }
    }

    const payloadKey = getLeadPayloadKey(lead)

    if (
      cacheRef.current.payloadKey === payloadKey &&
      cacheRef.current.data
    ) {
      setResult(cacheRef.current.data)
      setError(null)
      return { success: true, cached: true, data: cacheRef.current.data }
    }

    inFlightRef.current = true
    setLoading(true)
    setError(null)

    try {
      const data = await postGenerateMessages(lead)

      cacheRef.current = { payloadKey, data }
      setResult(data)

      const usedFallback =
        data.email.startsWith('Unable to generate') ||
        data.linkedinMessage.startsWith('Unable to generate')

      return {
        success: true,
        data,
        usedFallback,
      }
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      return { success: false, errors: {}, apiError: message }
    } finally {
      setLoading(false)
      inFlightRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    cacheRef.current = { payloadKey: null, data: null }
    submitGuard.reset()
  }, [])

  return {
    handleGenerate,
    loading,
    result,
    error,
    clearError,
    reset,
  }
}
