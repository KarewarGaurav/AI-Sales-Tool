import { AlertTriangle } from 'lucide-react'
import { getEnvConfigErrorMessage } from '@/config/env'

export default function EnvConfigBanner() {
  const message = getEnvConfigErrorMessage()
  if (!message) return null

  return (
    <div
      className="relative z-[100] border-b border-amber-500/40 bg-amber-500/15 px-4 py-3 lg:px-8"
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div className="text-sm text-amber-100">
          <p className="font-medium">Configuration required</p>
          <p className="mt-1 text-amber-200/90">{message}</p>
        </div>
      </div>
    </div>
  )
}
