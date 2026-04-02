import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Single comprehensive regex pattern for Figma errors
const FIGMA_PATTERN = /iframe|message.*port|abort|cleanup|setupmessagechannel|webpack-artifacts|figma\.com|figma_app|\.min\.js\.br|1216-53cc83c81b15e1ea|figma_app-8304ee4031f26559|messageport|messagechannel|at\s+[rse]\.cleanup|at\s+eb\.setupmessagechannel/i;

/**
 * Fast pattern matching for Figma errors
 */
const isFigmaError = (error: Error | undefined): boolean => {
  if (!error) return false;
  
  try {
    const errorString = 
      String(error) + 
      (error.message || '') + 
      (error.stack || '') + 
      (error.name || '');
    
    return FIGMA_PATTERN.test(errorString);
  } catch (e) {
    return true; // If we can't check, assume it's a Figma error
  }
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Don't set error state for Figma iframe errors
    if (isFigmaError(error)) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Completely suppress Figma iframe errors - don't even log
    if (isFigmaError(error)) {
      return;
    }
    
    // Only log real application errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    // Always render children for Figma errors
    if (this.state.hasError && isFigmaError(this.state.error)) {
      return this.props.children;
    }
    
    // Show error UI for real errors
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
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
