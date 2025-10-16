'use client';

import { StickyFooterProps } from '@/types';

export default function StickyFooter({ children }: StickyFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {children}
      </div>
    </div>
  );
}