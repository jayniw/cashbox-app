'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';

export type SearchSelectOption = {
  id: string;
  label: string;
};

interface SearchSelectProps {
  label: string;
  options: SearchSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  description?: string;
  multiple?: boolean;
}

export function SearchSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
  description,
  multiple = true,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const selectedOptions = React.useMemo(
    () => options.filter((item) => selectedValues.includes(item.id)),
    [options, selectedValues],
  );

  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) {
      return options;
    }

    const lowerQuery = query.toLowerCase();
    return options.filter((option) =>
      (option.label ?? '').toLowerCase().includes(lowerQuery),
    );
  }, [options, query]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((optionId) => optionId !== value));
      return;
    }

    if (multiple) {
      onChange([...selectedValues, value]);
    } else {
      onChange([value]);
      setOpen(false);
    }
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter((optionId) => optionId !== value));
  };

  return (
    <div
      className="relative"
      ref={containerRef}
    >
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          'min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 shadow-sm transition focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
          disabled && 'pointer-events-none opacity-70',
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        <div className="flex flex-wrap gap-2">
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-2 py-1 text-xs text-foreground"
                >
                  <span>{option.label}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeValue(option.id);
                    }}
                    className="h-6 w-6 rounded-full p-0"
                  >
                    <XIcon className="size-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex min-w-30 flex-1 items-center gap-2">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="min-w-0 border-none bg-transparent px-0 py-0 text-sm outline-none focus-visible:ring-0"
            />
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      {description ? (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      ) : null}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
          <div className="max-h-72 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const selected = selectedValues.includes(option.id);
                return (
                  <button
                    key={`${option.id}-${index}`}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleValue(option.id);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent/80 hover:text-accent-foreground',
                      selected && 'bg-accent/90 text-accent-foreground',
                    )}
                  >
                    <span>{option.label}</span>
                    {selected ? (
                      <CheckIcon className="size-4 text-foreground" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
