import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, showRetry = true }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <AlertCircle size={48} className="text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message || 'Something went wrong. Please try again.'}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
