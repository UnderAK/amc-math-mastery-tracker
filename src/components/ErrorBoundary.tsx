import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Application Error</h1>
            <p className="text-muted-foreground mb-4">
              Something went wrong, and the application has crashed. Please try refreshing the page or clearing the cache.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-4"
            >
              Clear Cache & Reset
            </Button>
            <details className="bg-muted p-4 rounded-lg text-left text-sm overflow-auto">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
