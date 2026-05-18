import { Component } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Catches render errors so the full app does not white-screen in production.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0B1220] px-6 text-center"
          role="alert"
        >
          <h1 className="font-heading text-2xl font-semibold text-[#E8EDF7]">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-[#8B9BB8]">
            An unexpected error occurred. Reload the page to try again.
          </p>
          {import.meta.env.DEV && this.state.error?.message && (
            <pre className="max-w-lg overflow-auto rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left text-xs text-red-200">
              {this.state.error.message}
            </pre>
          )}
          <Button type="button" onClick={this.handleRetry}>
            Reload application
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
