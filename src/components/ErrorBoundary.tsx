"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Client-side error caught by boundary:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultFallback;
      return <Fallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

const DefaultFallback: React.FC<{ error?: Error; reset: () => void }> = ({ error, reset }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">कुछ गलत हो गया</h1>
      <p className="text-muted-foreground mb-6">
        पेज लोड करने में समस्या हुई है। कृपया पेज को रिफ्रेश करें।
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        फिर से प्रयास करें
      </button>
      {error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm">तकनीकी विवरण</summary>
          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default ErrorBoundary;