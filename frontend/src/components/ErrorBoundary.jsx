import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertTriangle size={48} className="text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Error Details:</p>
                  <p className="text-xs text-red-600 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs text-gray-500 font-mono mt-2 break-all">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
              
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw size={20} />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
