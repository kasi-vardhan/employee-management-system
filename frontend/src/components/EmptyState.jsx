import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Inbox size={48} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message || 'There are no items to display.'}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
