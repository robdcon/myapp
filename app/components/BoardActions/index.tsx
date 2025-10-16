'use client';

import { BoardActionsProps } from '@/types';

export default function BoardActions({ 
  isAddingItem, 
  onToggleAddItem, 
  onResetChecks,
  showReset = false 
}: BoardActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onToggleAddItem}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {isAddingItem ? 'Close Form' : 'Add Item'}
      </button>
      
      {showReset && onResetChecks && (
        <button
          onClick={onResetChecks}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          title="Uncheck all items"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
}