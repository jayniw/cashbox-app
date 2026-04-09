'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminListPageProps {
  title: string;
  description?: string;
  onCreate: () => void;
  createAriaLabel?: string;
  createLabel?: string;
  error?: string | null;
  children: ReactNode;
}

export function AdminListPage({
  title,
  description,
  onCreate,
  createAriaLabel = 'Agregar elemento',
  createLabel,
  error,
  children,
}: AdminListPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl bg-muted p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          onClick={onCreate}
          size="icon"
          aria-label={createAriaLabel}
        >
          <PlusIcon className="size-4" />
          {createLabel ? <span className="sr-only">{createLabel}</span> : null}
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {children}
    </div>
  );
}
