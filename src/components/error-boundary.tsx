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
        <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-red-800">
              Something went wrong
            </h2>
            <details className="mb-4">
              <summary className="cursor-pointer font-medium text-red-600">
                Error Details
              </summary>
              <div className="mt-2 rounded bg-red-100 p-3 font-mono text-sm">
                {this.state.error?.toString()}
              </div>
              {this.state.errorInfo && (
                <div className="mt-2 rounded bg-red-100 p-3 font-mono text-sm">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
