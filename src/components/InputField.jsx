import { forwardRef } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Reusable controlled input or textarea with label and error state.
 */
const InputField = forwardRef(
  (
    {
      id,
      label,
      name,
      type = 'text',
      as = 'input',
      value,
      onChange,
      placeholder,
      error,
      required = false,
      rows = 4,
      className,
      ...props
    },
    ref
  ) => {
    const inputId = id || name
    const hasError = Boolean(error)

    const fieldClasses = cn(
      'w-full rounded-lg border bg-[rgba(11,18,32,0.5)] px-4 py-3 text-sm text-[#E8EDF7] placeholder:text-[#5C6B88]',
      'backdrop-blur-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-[rgba(59,224,255,0.35)] focus:border-[rgba(59,224,255,0.4)]',
      hasError
        ? 'border-red-400/50 focus:ring-red-400/30'
        : 'border-[rgba(59,224,255,0.12)] hover:border-[rgba(59,224,255,0.22)]',
      className
    )

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label htmlFor={inputId} className="flex items-center gap-1">
            {label}
            {required && <span className="text-[#3BE0FF]">*</span>}
          </Label>
        )}
        {as === 'textarea' ? (
          <textarea
            ref={ref}
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={cn(fieldClasses, 'resize-y min-h-[120px]')}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={fieldClasses}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
        )}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400/90"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'

export default InputField

