import { useCallback, useState } from 'react'
import { Sparkles, Ship } from 'lucide-react'
import InputField from '@/components/InputField'
import CountrySelect from '@/components/CountrySelect'
import OutputCard from '@/components/OutputCard'
import Loader from '@/components/Loader'
import FollowUpTracking from '@/components/FollowUpTracking'
import LogisticsHero from '@/components/LogisticsHero'
import { Button } from '@/components/ui/button'
import { useGenerateMessages } from '@/hooks/useGenerateMessages'
import { toast } from '@/components/ui/use-toast'
import { createEmptyLead, LEAD_FIELDS } from '@/utils/helpers'

export default function Dashboard() {
  const [lead, setLead] = useState(createEmptyLead)
  const [fieldErrors, setFieldErrors] = useState({})
  const [followUpSignal, setFollowUpSignal] = useState(0)

  const { handleGenerate, loading, result, error, clearError } =
    useGenerateMessages()

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setLead((prev) => ({ ...prev, [name]: value }))
      setFieldErrors((prev) => {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      })
      clearError()
    },
    [clearError]
  )

  const handleLeadRestore = useCallback((saved) => {
    setLead((prev) => ({
      ...prev,
      clientName: saved.clientName ?? prev.clientName,
      companyName: saved.companyName ?? prev.companyName,
      shipmentRequirement:
        saved.shipmentRequirement ?? prev.shipmentRequirement,
      country: saved.country ?? prev.country,
    }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const outcome = await handleGenerate(lead)

    if (outcome.errors && Object.keys(outcome.errors).length > 0) {
      setFieldErrors(outcome.errors)
      return
    }

    if (outcome.skipped) {
      return
    }

    if (outcome.success) {
      if (!outcome.usedFallback) {
        setFollowUpSignal((n) => n + 1)
      }
      if (outcome.cached) {
        toast({
          title: 'Using cached messages',
          description: 'Same lead — no new API call.',
        })
      } else if (outcome.usedFallback) {
        toast({
          title: 'Partial response',
          description:
            'Some content could not be generated. Showing safe placeholders where needed.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Messages generated', variant: 'success' })
      }
      setFieldErrors({})
    } else if (outcome.apiError) {
      toast({
        title: 'Generation failed',
        description: outcome.apiError,
        variant: 'destructive',
      })
    }
  }

  return (
    <div id="dashboard" className="min-h-full">
      <section className="relative overflow-hidden border-b border-[rgba(59,224,255,0.08)] px-4 py-8 lg:px-8 lg:py-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#3BE0FF]/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(59,224,255,0.2)] bg-[rgba(59,224,255,0.08)] px-3 py-1 text-xs font-medium text-[#3BE0FF]">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Outreach
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#E8EDF7] md:text-4xl">
              Precision logistics
              <span className="block bg-gradient-to-r from-[#3BE0FF] to-[#4F8CFF] bg-clip-text text-transparent">
                sales intelligence
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-[#8B9BB8] md:text-base">
              Capture freight leads, generate tailored email and LinkedIn outreach,
              and track follow-ups — all in one focused workspace.
            </p>
          </div>
          <LogisticsHero className="mx-auto w-full max-w-[320px] lg:max-w-[380px]" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr] xl:gap-10">
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-[#3BE0FF]" />
              <h3 className="font-heading text-lg font-semibold text-[#E8EDF7]">
                Lead details
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative z-10 space-y-5 overflow-visible rounded-2xl border border-[rgba(59,224,255,0.1)] bg-[linear-gradient(160deg,rgba(21,31,53,0.6)_0%,rgba(17,26,46,0.4)_100%)] p-6 shadow-[var(--shadow-card)] backdrop-blur-sm"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Client Name"
                  name={LEAD_FIELDS.CLIENT_NAME}
                  value={lead.clientName}
                  onChange={handleChange}
                  placeholder="e.g. James Chen"
                  error={fieldErrors.clientName}
                  required
                />
                <InputField
                  label="Company Name"
                  name={LEAD_FIELDS.COMPANY_NAME}
                  value={lead.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Pacific Trade Co."
                  error={fieldErrors.companyName}
                  required
                />
              </div>

              <InputField
                label="Shipment Requirement"
                name={LEAD_FIELDS.SHIPMENT_REQUIREMENT}
                as="textarea"
                value={lead.shipmentRequirement}
                onChange={handleChange}
                placeholder="Describe cargo type, volume, Incoterms, ports, timeline…"
                error={fieldErrors.shipmentRequirement}
                required
                rows={5}
              />

              <CountrySelect
                name={LEAD_FIELDS.COUNTRY}
                value={lead.country}
                onChange={handleChange}
                error={fieldErrors.country}
                required
              />

              {error && !loading && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
                  role="alert"
                >
                  <p className="text-sm text-red-300">{error}</p>
                  <p className="mt-1 text-xs text-red-300/80">
                    Fix any issues above and click Generate Messages to retry.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full transition-opacity sm:w-auto"
                disabled={loading}
                aria-busy={loading}
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Generating…' : 'Generate Messages'}
              </Button>
            </form>

            <FollowUpTracking
              lead={lead}
              followUpSignal={followUpSignal}
              onLeadRestore={handleLeadRestore}
            />
          </section>

          <section className="space-y-6">
            <h3 className="font-heading text-lg font-semibold text-[#E8EDF7]">
              AI-generated outreach
            </h3>

            {loading && <Loader />}

            {!loading && !result && (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(59,224,255,0.15)] bg-[rgba(17,26,46,0.3)] p-8 text-center">
                <p className="text-sm text-[#5C6B88]">
                  Submit a lead to generate follow-up email and LinkedIn messages.
                </p>
              </div>
            )}

            {!loading && result && (
              <div
                key={`${result.email}-${result.linkedinMessage}`}
                className="space-y-5 animate-fade-slide-up"
              >
                <OutputCard
                  title="Follow-up Email"
                  content={result.email}
                  animationDelay={0}
                />
                <OutputCard
                  title="LinkedIn Outreach Message"
                  content={result.linkedinMessage}
                  animationDelay={120}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
