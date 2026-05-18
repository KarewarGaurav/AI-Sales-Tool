/** Lead form field keys */
export const LEAD_FIELDS = {
  CLIENT_NAME: 'clientName',
  COMPANY_NAME: 'companyName',
  SHIPMENT_REQUIREMENT: 'shipmentRequirement',
  COUNTRY: 'country',
}

export const FOLLOW_UP_STATUS = {
  PENDING: 'pending',
  FOLLOWED_UP: 'followed_up',
  REPLIED: 'replied',
}

export const STATUS_LABELS = {
  [FOLLOW_UP_STATUS.PENDING]: 'Pending',
  [FOLLOW_UP_STATUS.FOLLOWED_UP]: 'Followed Up',
  [FOLLOW_UP_STATUS.REPLIED]: 'Replied',
}

/** Shown when webhook response fails shape validation */
export const API_FALLBACK_MESSAGES = {
  email: 'Unable to generate email at the moment.',
  linkedinMessage: 'Unable to generate LinkedIn message.',
}

const EMPTY_LEAD = {
  [LEAD_FIELDS.CLIENT_NAME]: '',
  [LEAD_FIELDS.COMPANY_NAME]: '',
  [LEAD_FIELDS.SHIPMENT_REQUIREMENT]: '',
  [LEAD_FIELDS.COUNTRY]: '',
}

/** Initial empty lead form state */
export function createEmptyLead() {
  return { ...EMPTY_LEAD }
}

/**
 * Validate required lead fields before API submission.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateLeadForm(lead) {
  const errors = {}

  if (!lead.clientName?.trim()) {
    errors.clientName = 'Client name is required'
  }
  if (!lead.companyName?.trim()) {
    errors.companyName = 'Company name is required'
  }
  if (!lead.shipmentRequirement?.trim()) {
    errors.shipmentRequirement = 'Shipment requirement is required'
  }
  if (!lead.country?.trim()) {
    errors.country = 'Country is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Cooldown guard — blocks rapid repeat submissions (300–500ms window).
 */
export function createSubmitGuard(cooldownMs = 400) {
  let lastSubmit = 0
  return {
    canSubmit() {
      const now = Date.now()
      if (now - lastSubmit < cooldownMs) return false
      lastSubmit = now
      return true
    },
    reset() {
      lastSubmit = 0
    },
  }
}

/** Stable cache key for identical lead payloads */
export function getLeadPayloadKey(lead) {
  return JSON.stringify({
    clientName: lead?.clientName?.trim() ?? '',
    companyName: lead?.companyName?.trim() ?? '',
    shipmentRequirement: lead?.shipmentRequirement?.trim() ?? '',
    country: lead?.country?.trim() ?? '',
  })
}

/** Copy text to clipboard with fallback */
export async function copyToClipboard(text) {
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}

const FOLLOW_UP_STORAGE_PREFIX = 'freightai-followup'

/** Unique key per lead (client + company) for local follow-up storage */
export function getFollowUpStorageKey(lead) {
  const client = lead?.clientName?.trim().toLowerCase() || ''
  const company = lead?.companyName?.trim().toLowerCase() || ''
  if (!client && !company) return `${FOLLOW_UP_STORAGE_PREFIX}::new-lead`
  return `${FOLLOW_UP_STORAGE_PREFIX}::${client}::${company}`
}

/** Parse YYYY-MM-DD in local timezone (avoids UTC offset bugs). */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Load full follow-up + lead snapshot from localStorage */
export function loadFollowUp(storageKey) {
  const defaults = {
    status: FOLLOW_UP_STATUS.PENDING,
    reminderDate: '',
    updatedAt: null,
    clientName: '',
    companyName: '',
    shipmentRequirement: '',
    country: '',
  }
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return {
      status: parsed.status || defaults.status,
      reminderDate: parsed.reminderDate || '',
      updatedAt: parsed.updatedAt || null,
      clientName: parsed.clientName || '',
      companyName: parsed.companyName || '',
      shipmentRequirement: parsed.shipmentRequirement || '',
      country: parsed.country || '',
    }
  } catch {
    return defaults
  }
}

/** Build a complete record for persistence */
export function buildFollowUpRecord(lead, status, reminderDate) {
  return {
    status: status ?? FOLLOW_UP_STATUS.PENDING,
    reminderDate: reminderDate ?? '',
    updatedAt: new Date().toISOString(),
    clientName: lead?.clientName?.trim() ?? '',
    companyName: lead?.companyName?.trim() ?? '',
    shipmentRequirement: lead?.shipmentRequirement?.trim() ?? '',
    country: lead?.country?.trim() ?? '',
  }
}

/** Persist follow-up + full lead fields to localStorage */
export function saveFollowUp(storageKey, data) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(buildFollowUpRecord(
      {
        clientName: data.clientName,
        companyName: data.companyName,
        shipmentRequirement: data.shipmentRequirement,
        country: data.country,
      },
      data.status,
      data.reminderDate
    )))
    return true
  } catch {
    return false
  }
}

/** All saved follow-up records (with updatedAt), newest first */
export function listFollowUpRecords() {
  const records = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(`${FOLLOW_UP_STORAGE_PREFIX}::`)) continue
      if (key.endsWith('::new-lead')) continue

      const saved = loadFollowUp(key)
      if (!saved.updatedAt) continue
      if (!saved.clientName?.trim() && !saved.companyName?.trim()) continue

      records.push({
        storageKey: key,
        clientName: saved.clientName,
        companyName: saved.companyName,
        shipmentRequirement: saved.shipmentRequirement,
        country: saved.country,
        status: saved.status,
        reminderDate: saved.reminderDate,
        updatedAt: saved.updatedAt,
      })
    }
  } catch {
    return []
  }

  return records.sort(
    (a, b) =>
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime()
  )
}

/** Default reminder: 3 days from today (local date) */
export function getDefaultReminderDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isReminderDue(reminderDate) {
  const target = parseLocalDate(reminderDate)
  if (!target) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return target.getTime() <= today.getTime()
}

/** Human-readable reminder state for the UI */
export function getReminderMeta(reminderDate) {
  const target = parseLocalDate(reminderDate)
  if (!target) {
    return { due: false, label: '', daysUntil: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target - today) / 86400000)

  if (diffDays < 0) {
    return {
      due: true,
      label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      daysUntil: diffDays,
    }
  }
  if (diffDays === 0) {
    return { due: true, label: 'Due today', daysUntil: 0 }
  }
  return {
    due: false,
    label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
    daysUntil: diffDays,
  }
}

/**
 * Unwrap n8n "Respond to Webhook" shapes into a single item object.
 * Common formats:
 *   [{ email, linkedinMessage }]  — "All Incoming Items"
 *   { email, linkedinMessage }
 *   { data: [...] } | { body: {...} } | { json: [...] }
 */
export function unwrapN8nPayload(data) {
  if (data == null) return null

  let payload = data
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      return null
    }
  }

  if (Array.isArray(payload)) {
    const item =
      payload.find(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          (entry.email != null || entry.linkedinMessage != null)
      ) ?? payload[0]
    return item && typeof item === 'object' ? item : null
  }

  if (typeof payload !== 'object') {
    return null
  }

  if (payload.json != null) {
    return unwrapN8nPayload(payload.json)
  }

  const nested = payload.data ?? payload.body ?? payload.output
  if (nested != null && nested !== payload) {
    return unwrapN8nPayload(nested)
  }

  return payload
}

/**
 * Map alternate webhook keys to the strict contract shape.
 */
export function normalizeApiResponse(data) {
  const source = unwrapN8nPayload(data)
  if (!source || typeof source !== 'object') {
    return { email: '', linkedinMessage: '' }
  }

  return {
    email:
      source.email ??
      source.followUpEmail ??
      source.follow_up_email ??
      '',
    linkedinMessage:
      source.linkedinMessage ??
      source.linkedin_message ??
      source.linkedin ??
      '',
  }
}

/**
 * Validate webhook response before UI binding.
 * Invalid or missing fields receive safe fallback copy.
 */
export function validateApiResponse(data) {
  const normalized = normalizeApiResponse(data)

  const email =
    typeof normalized.email === 'string' && normalized.email.trim()
      ? normalized.email.trim()
      : API_FALLBACK_MESSAGES.email

  const linkedinMessage =
    typeof normalized.linkedinMessage === 'string' &&
    normalized.linkedinMessage.trim()
      ? normalized.linkedinMessage.trim()
      : API_FALLBACK_MESSAGES.linkedinMessage

  return {
    email,
    linkedinMessage,
    usedFallback:
      email === API_FALLBACK_MESSAGES.email ||
      linkedinMessage === API_FALLBACK_MESSAGES.linkedinMessage,
  }
}

/** Strip internal flags before UI binding */
export function toDisplayResult(validated) {
  if (!validated) return null
  return {
    email: validated.email,
    linkedinMessage: validated.linkedinMessage,
  }
}
