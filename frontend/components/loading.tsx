'use client';

import { Loader2 } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function LoadingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
} 