import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { filterCountries } from '@/utils/countries'

const PANEL_MAX_HEIGHT = 380

/**
 * Searchable country picker — panel portals to document.body to avoid z-index overlap.
 */
export default function CountrySelect({
  value,
  onChange,
  error,
  required = false,
  name = 'country',
}) {
  const listId = useId()
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(value || '')
  const [panelStyle, setPanelStyle] = useState(null)

  const filtered = useMemo(() => filterCountries(search), [search])

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < PANEL_MAX_HEIGHT && rect.top > PANEL_MAX_HEIGHT

    if (openUpward) {
      setPanelStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + 8,
        zIndex: 200,
      })
    } else {
      setPanelStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: rect.bottom + 8,
        zIndex: 200,
      })
    }
  }, [])

  useEffect(() => {
    if (!open) setDraft(value || '')
  }, [value, open])

  useEffect(() => {
    if (!open) return

    setSearch('')
    setDraft(value || '')
    updatePanelPosition()

    const raf = requestAnimationFrame(() => searchRef.current?.focus())

    const onScrollOrResize = () => updatePanelPosition()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open, value, updatePanelPosition])

  useEffect(() => {
    const handlePointerDown = (e) => {
      const target = e.target
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setDraft(value || '')
    }

    if (open) document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, value])

  const applySelection = useCallback(
    (selected) => {
      const next = (selected ?? draft).trim()
      if (!next) return
      onChange({ target: { name, value: next } })
      setOpen(false)
      setSearch('')
    },
    [draft, name, onChange]
  )

  const handleApply = () => applySelection(draft)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length === 1) applySelection(filtered[0])
      else handleApply()
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setDraft(value || '')
    }
  }

  const closePanel = () => {
    setOpen(false)
    setDraft(value || '')
  }

  const hasError = Boolean(error)

  const panel = open && panelStyle && (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[199] cursor-default bg-black/40 backdrop-blur-[1px]"
        aria-label="Close country selector"
        onClick={closePanel}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Select country"
        className="overflow-hidden rounded-xl border border-[rgba(59,224,255,0.25)] bg-[#111A2E] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
        style={panelStyle}
      >
        <div className="border-b border-[rgba(255,255,255,0.06)] p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6B88]" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to search countries…"
              className="w-full rounded-lg border border-[rgba(59,224,255,0.15)] bg-[rgba(11,18,32,0.8)] py-2.5 pl-10 pr-3 text-sm text-[#E8EDF7] placeholder:text-[#5C6B88] focus:outline-none focus:ring-2 focus:ring-[rgba(59,224,255,0.3)]"
              autoComplete="off"
            />
          </div>
          <p className="mt-2 text-[10px] text-[#5C6B88]">
            Pick from the list, then click <strong className="text-[#8B9BB8]">Apply</strong> to confirm.
          </p>
        </div>

        <ul
          id={listId}
          role="listbox"
          className="custom-scrollbar max-h-[220px] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-[#5C6B88]">
              No countries match &quot;{search}&quot;
            </li>
          ) : (
            filtered.map((country) => {
              const isSelected = draft === country
              return (
                <li key={country} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => setDraft(country)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-[rgba(59,224,255,0.12)] text-[#3BE0FF]'
                        : 'text-[#C5D0E6] hover:bg-[rgba(255,255,255,0.04)]'
                    )}
                  >
                    {country}
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <div className="flex gap-2 border-t border-[rgba(255,255,255,0.06)] p-3">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            onClick={handleApply}
            disabled={!draft.trim()}
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setDraft('')
              setSearch('')
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div ref={containerRef} className="relative z-0 flex flex-col gap-2">
      <Label className="flex items-center gap-1">
        Country
        {required && <span className="text-[#3BE0FF]">*</span>}
      </Label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-lg border bg-[rgba(11,18,32,0.5)] px-4 text-left text-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-[rgba(59,224,255,0.35)]',
          open && 'border-[rgba(59,224,255,0.35)] ring-2 ring-[rgba(59,224,255,0.2)]',
          hasError
            ? 'border-red-400/50'
            : 'border-[rgba(59,224,255,0.12)] hover:border-[rgba(59,224,255,0.22)]',
          value ? 'text-[#E8EDF7]' : 'text-[#5C6B88]'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={listId}
      >
        <span className="truncate">{value || 'Search and select country…'}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 opacity-60 transition-transform', open && 'rotate-180')}
        />
      </button>

      {typeof document !== 'undefined' && panel && createPortal(panel, document.body)}

      {hasError && (
        <p className="text-xs text-red-400/90" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
