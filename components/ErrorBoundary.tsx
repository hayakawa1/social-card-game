'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary component to catch React errors
 * Logs errors to console and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // You could also send this to a logging service
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // In production, you might want to send this to a logging service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // For now, just log to console
    console.error('Error logged:', errorData);

    // In production, you could POST to an error logging endpoint:
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                エラーが発生しました
              </h1>
              <p className="text-gray-600">
                申し訳ございません。予期しないエラーが発生しました。
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <h2 className="font-bold text-red-800 mb-2">Error Details (Dev Only):</h2>
                <p className="text-sm text-red-700 font-mono mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors font-semibold"
              >
                再試行
              </button>

              <button
                onClick={() => {
                  window.location.href = '/home';
                }}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors font-semibold"
              >
                ホームに戻る
              </button>

              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors font-semibold"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
