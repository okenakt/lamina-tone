import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-paper p-4">
          <div className="w-full max-w-md rounded-[12px] border border-rule bg-paper-2 p-6">
            <h2 className="mb-4 font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Something went wrong
            </h2>
            <details className="mb-4">
              <summary className="cursor-pointer font-medium text-warn">
                Error Details
              </summary>
              <div className="mt-2 rounded-[8px] bg-paper-3 p-3 font-mono text-sm text-ink-2">
                {this.state.error?.toString()}
              </div>
              {this.state.errorInfo && (
                <div className="mt-2 rounded-[8px] bg-paper-3 p-3 font-mono text-sm text-ink-2">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-[8px] bg-accent px-4 py-2 text-accent-ink outline-none transition-colors duration-200 ease-out hover:bg-accent-strong focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
