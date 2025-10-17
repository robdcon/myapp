'use client';

import { Item, BoardType } from '@/types';

interface ItemRowProps {
  item: Item;
  boardType: BoardType;
  onToggleCheck: (itemId: string) => void;
  onEdit: (itemId: string) => void;
}

export default function ItemRow({ item, boardType, onToggleCheck, onEdit }: ItemRowProps) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
      <label className="flex items-start gap-4 flex-1 cursor-pointer">
        {boardType === BoardType.CHECKLIST && (
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={item.is_checked}
              onChange={() => onToggleCheck(item.id)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium ${
            item.is_checked 
              ? 'line-through text-gray-400' 
              : 'text-gray-900'
          }`}>
            {item.name}
          </h3>
          
          {item.details && (
            <p className={`mt-1 text-sm ${
              item.is_checked 
                ? 'text-gray-400' 
                : 'text-gray-600'
            }`}>
              {item.details}
            </p>
          )}
        </div>
      </label>

      {/* Edit button - always visible on mobile, hover on desktop */}
      <button
        onClick={() => onEdit(item.id)}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
        title="Edit item"
        aria-label="Edit item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}