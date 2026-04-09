'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { listPartners } from '@/lib/services/partnerAdmin';
import { type CashboxOperationResponse } from '@/lib/services/operationAdmin';

interface OperationFormProps {
  operation?: CashboxOperationResponse | null;
  onSubmit: (payload: {
    operation: {
      operationName?: string;
      partnerId?: string;
      isActive?: boolean;
    };
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function OperationForm({
  operation,
  onSubmit,
  onCancel,
  isSaving,
}: OperationFormProps) {
  const [operationName, setOperationName] = React.useState(
    operation?.operationName ?? '',
  );
  const [selectedPartnerId, setSelectedPartnerId] = React.useState(
    operation?.cashboxPartnerId ?? '',
  );
  const [isActive, setIsActive] = React.useState(operation?.isActive ?? true);
  const [partnerOptions, setPartnerOptions] = React.useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true);

  React.useEffect(() => {
    setOperationName(operation?.operationName ?? '');
    setSelectedPartnerId(operation?.cashboxPartnerId ?? '');
    setIsActive(operation?.isActive ?? true);
  }, [operation]);

  React.useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      setIsLoadingOptions(true);
      try {
        const partners = await listPartners();
        if (!isMounted) return;
        setPartnerOptions(partners);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadPartners();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      operation: {
        operationName: operationName.trim() || undefined,
        partnerId: selectedPartnerId || undefined,
        isActive,
      },
    });
  };

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="operationName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de operación
          </label>
          <Input
            id="operationName"
            value={operationName}
            onChange={(event) => setOperationName(event.target.value)}
            placeholder="Nombre de la operación"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="partnerId"
            className="block text-sm font-medium text-foreground"
          >
            Partner
          </label>
          <select
            id="partnerId"
            value={selectedPartnerId}
            onChange={(event) => setSelectedPartnerId(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecciona un partner</option>
            {partnerOptions.map((partner) => (
              <option
                key={partner.id}
                value={partner.id}
              >
                {partner.label}
              </option>
            ))}
          </select>
          {isLoadingOptions && (
            <p className="text-sm text-muted-foreground">
              Cargando partners...
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <label
            htmlFor="isActive"
            className="text-sm text-foreground"
          >
            Operación activa
          </label>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : operation ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
