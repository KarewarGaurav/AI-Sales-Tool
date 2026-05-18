import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Info,
  RotateCcw,
  Save,
  Send,
} from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import {
  FOLLOW_UP_STATUS,
  loadFollowUp,
  saveFollowUp,
  getFollowUpStorageKey,
  listFollowUpRecords,
  getDefaultReminderDate,
  getReminderMeta,
  buildFollowUpRecord,
} from '@/utils/helpers'

const STATUS_HINTS = {
  [FOLLOW_UP_STATUS.PENDING]:
    'Lead captured — outreach not sent yet, or awaiting first contact.',
  [FOLLOW_UP_STATUS.FOLLOWED_UP]:
    'Email or LinkedIn message sent; waiting for a response.',
  [FOLLOW_UP_STATUS.REPLIED]:
    'Prospect responded — move to quote / negotiation.',
}

/**
 * Follow-up tracker — manual Save + saved leads list.
 */
export default function FollowUpTracking({
  lead,
  onLeadRestore,
  followUpSignal = 0,
}) {
  const storageKey = getFollowUpStorageKey(lead)
  const hasLeadIdentity = Boolean(
    lead?.clientName?.trim() && lead?.companyName?.trim()
  )

  const [followUpStatus, setFollowUpStatus] = useState(FOLLOW_UP_STATUS.PENDING)
  const [reminderDate, setReminderDate] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [saveError, setSaveError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [savedLeads, setSavedLeads] = useState([])

  const lastLoadedKeyRef = useRef('')
  const isRestoringRef = useRef(false)
  const [stableStorageKey, setStableStorageKey] = useState('')

  const refreshSavedLeads = useCallback(() => {
    setSavedLeads(listFollowUpRecords())
  }, [])

  useEffect(() => {
    refreshSavedLeads()
  }, [refreshSavedLeads])

  useEffect(() => {
    if (!hasLeadIdentity) {
      setStableStorageKey('')
      return undefined
    }
    const timer = setTimeout(() => setStableStorageKey(storageKey), 500)
    return () => clearTimeout(timer)
  }, [storageKey, hasLeadIdentity])

  const persistNow = useCallback(
    (nextStatus, nextReminder, leadSnapshot = lead) => {
      if (!hasLeadIdentity) return false

      const record = buildFollowUpRecord(
        leadSnapshot,
        nextStatus,
        nextReminder
      )
      const ok = saveFollowUp(storageKey, record)
      setSaveError(!ok)
      if (ok) {
        setLastSavedAt(record.updatedAt)
        refreshSavedLeads()
      }
      return ok
    },
    [hasLeadIdentity, lead, storageKey, refreshSavedLeads]
  )

  const handleSave = async () => {
    if (!hasLeadIdentity) {
      toast({
        title: 'Cannot save',
        description: 'Enter client and company name first.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    const ok = persistNow(followUpStatus, reminderDate)
    setIsSaving(false)

    if (ok) {
      toast({
        title: 'Lead saved',
        description: `${lead.clientName} · ${lead.companyName}`,
        variant: 'success',
      })
    } else {
      toast({
        title: 'Save failed',
        description: 'Browser storage is unavailable.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (!stableStorageKey) {
      lastLoadedKeyRef.current = ''
      return
    }

    if (lastLoadedKeyRef.current === stableStorageKey) return
    lastLoadedKeyRef.current = stableStorageKey

    const saved = loadFollowUp(stableStorageKey)
    setFollowUpStatus(saved.status)
    setReminderDate(saved.reminderDate)
    setLastSavedAt(saved.updatedAt)
    setSaveError(false)

    const hasSavedLeadFields =
      saved.shipmentRequirement || saved.country || saved.updatedAt

    if (hasSavedLeadFields && onLeadRestore) {
      isRestoringRef.current = true
      onLeadRestore({
        clientName: saved.clientName || '',
        companyName: saved.companyName || '',
        shipmentRequirement: saved.shipmentRequirement || '',
        country: saved.country || '',
      })
      requestAnimationFrame(() => {
        isRestoringRef.current = false
      })
    }
  }, [stableStorageKey, onLeadRestore])

  useEffect(() => {
    if (!followUpSignal || !hasLeadIdentity) return

    const saved = loadFollowUp(storageKey)
    if (saved.status === FOLLOW_UP_STATUS.REPLIED) return

    const nextReminder = saved.reminderDate || getDefaultReminderDate()
    setFollowUpStatus(FOLLOW_UP_STATUS.FOLLOWED_UP)
    setReminderDate(nextReminder)
    persistNow(FOLLOW_UP_STATUS.FOLLOWED_UP, nextReminder)
  }, [followUpSignal, hasLeadIdentity, storageKey, persistNow])

  const handleStatusChange = (status) => {
    setFollowUpStatus(status)
  }

  const handleReminderChange = (e) => {
    setReminderDate(e.target.value)
  }

  const handleMarkFollowedUp = () => {
    const date = reminderDate || getDefaultReminderDate()
    setFollowUpStatus(FOLLOW_UP_STATUS.FOLLOWED_UP)
    setReminderDate(date)
  }

  const handleMarkReplied = () => {
    setFollowUpStatus(FOLLOW_UP_STATUS.REPLIED)
  }

  const handleClearReminder = () => {
    setReminderDate('')
  }

  const handleLoadSavedLead = (record) => {
    if (!onLeadRestore) return

    lastLoadedKeyRef.current = ''
    onLeadRestore({
      clientName: record.clientName,
      companyName: record.companyName,
      shipmentRequirement: record.shipmentRequirement || '',
      country: record.country || '',
    })

    setFollowUpStatus(record.status)
    setReminderDate(record.reminderDate || '')
    setLastSavedAt(record.updatedAt)

    toast({
      title: 'Lead loaded',
      description: `${record.clientName} · ${record.companyName}`,
    })
  }

  const reminderMeta = getReminderMeta(reminderDate)
  const isCurrentLeadSaved =
    hasLeadIdentity &&
    savedLeads.some((r) => r.storageKey === storageKey)

  return (
    <section className="relative z-0 isolate rounded-2xl border border-[rgba(79,140,255,0.15)] bg-[rgba(17,26,46,0.5)] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-semibold text-[#E8EDF7]">
            Follow-up tracking
          </h3>
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="rounded-md p-1 text-[#5C6B88] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#3BE0FF]"
            aria-label="How follow-up tracking works"
            aria-expanded={showHelp}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        <StatusBadge status={followUpStatus} />
      </div>

      {showHelp && (
        <div className="mb-5 rounded-lg border border-[rgba(59,224,255,0.15)] bg-[rgba(59,224,255,0.06)] px-4 py-3 text-xs leading-relaxed text-[#8B9BB8]">
          <p className="mb-2 font-medium text-[#C5D0E6]">How this works</p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              Set status and reminder, then click <strong>Save lead</strong>.
            </li>
            <li>
              Saved leads appear in the list below — click one to load it back
              into the form.
            </li>
            <li>
              Generating messages auto-saves as <strong>Followed Up</strong> with
              a 3-day reminder.
            </li>
          </ul>
        </div>
      )}

      {!hasLeadIdentity && (
        <p className="mb-4 rounded-lg border border-[rgba(59,224,255,0.15)] bg-[rgba(59,224,255,0.06)] px-3 py-2 text-xs text-[#8B9BB8]">
          Enter <strong className="text-[#C5D0E6]">client</strong> and{' '}
          <strong className="text-[#C5D0E6]">company</strong> name, then click{' '}
          <strong className="text-[#C5D0E6]">Save lead</strong>.
        </p>
      )}

      {hasLeadIdentity && lastSavedAt && !saveError && (
        <p className="mb-3 text-[10px] text-emerald-400/90">
          Last saved · {new Date(lastSavedAt).toLocaleString()}
          {!isCurrentLeadSaved && ' · click Save lead to add to your list'}
        </p>
      )}

      {saveError && (
        <p className="mb-3 text-[10px] text-red-300" role="alert">
          Could not save to browser storage. Check privacy settings and try again.
        </p>
      )}

      <p className="mb-4 text-xs text-[#5C6B88]">{STATUS_HINTS[followUpStatus]}</p>

      {reminderDate && reminderMeta.label && (
        <p
          className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
            reminderMeta.due
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-[rgba(59,224,255,0.2)] bg-[rgba(59,224,255,0.06)] text-[#8B9BB8]'
          }`}
          role="status"
        >
          <Calendar className="mr-1.5 inline h-3.5 w-3.5 align-text-bottom" />
          {reminderMeta.label}
          {reminderMeta.due &&
            followUpStatus !== FOLLOW_UP_STATUS.REPLIED &&
            ' — consider following up today.'}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleMarkFollowedUp}
          disabled={!hasLeadIdentity}
        >
          <Send className="h-3.5 w-3.5" />
          Mark followed up
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleMarkReplied}
          disabled={!hasLeadIdentity}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark replied
        </Button>
        {reminderDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearReminder}
            disabled={!hasLeadIdentity}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear reminder
          </Button>
        )}
      </div>

      <div className="mb-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-[#8B9BB8]">
            Status
          </label>
          <Select value={followUpStatus} onValueChange={handleStatusChange}>
            <SelectTrigger disabled={!hasLeadIdentity}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="z-[250]">
              <SelectItem value={FOLLOW_UP_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={FOLLOW_UP_STATUS.FOLLOWED_UP}>
                Followed Up
              </SelectItem>
              <SelectItem value={FOLLOW_UP_STATUS.REPLIED}>Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reminderDate"
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#8B9BB8]"
          >
            <Calendar className="h-3.5 w-3.5" />
            Reminder date
          </label>
          <input
            id="reminderDate"
            type="date"
            value={reminderDate}
            onChange={handleReminderChange}
            disabled={!hasLeadIdentity}
            className="flex h-11 w-full rounded-lg border border-[rgba(59,224,255,0.15)] bg-[rgba(11,18,32,0.6)] px-4 text-sm text-[#E8EDF7] focus:outline-none focus:ring-2 focus:ring-[rgba(59,224,255,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <Button
        type="button"
        className="mb-6 w-full sm:w-auto"
        disabled={!hasLeadIdentity || isSaving}
        onClick={handleSave}
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving…' : 'Save lead'}
      </Button>

      <div className="border-t border-[rgba(255,255,255,0.06)] pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8B9BB8]">
          Saved leads ({savedLeads.length})
        </p>

        {savedLeads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[rgba(59,224,255,0.12)] px-4 py-6 text-center text-xs text-[#5C6B88]">
            No saved leads yet. Fill in the form and click Save lead.
          </p>
        ) : (
          <ul className="custom-scrollbar max-h-[220px] space-y-2 overflow-y-auto">
            {savedLeads.map((record) => {
              const isActive = record.storageKey === storageKey
              const meta = getReminderMeta(record.reminderDate)

              return (
                <li key={record.storageKey}>
                  <button
                    type="button"
                    onClick={() => handleLoadSavedLead(record)}
                    className={`flex w-full flex-col gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${
                      isActive
                        ? 'border-[rgba(59,224,255,0.35)] bg-[rgba(59,224,255,0.1)]'
                        : 'border-[rgba(59,224,255,0.1)] bg-[rgba(11,18,32,0.4)] hover:border-[rgba(59,224,255,0.25)] hover:bg-[rgba(59,224,255,0.06)]'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-[#E8EDF7]">
                        {record.clientName}
                        <span className="font-normal text-[#5C6B88]"> · </span>
                        {record.companyName}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#5C6B88]">
                        {record.country || 'No country'}
                        {meta.label ? ` · ${meta.label}` : ''}
                        {' · '}
                        {new Date(record.updatedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <StatusBadge
                      status={record.status}
                      className="shrink-0 self-start sm:self-center"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
