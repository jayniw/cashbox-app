'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { type CashboxPaymentMethodResponse } from '@/lib/services/paymentMethodAdmin';

interface PaymentMethodFormProps {
  method?: CashboxPaymentMethodResponse | null;
  onSubmit: (payload: {
    method: {
      paymentMethodName?: string;
      isActive?: boolean;
    };
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function PaymentMethodForm({
  method,
  onSubmit,
  onCancel,
  isSaving,
}: PaymentMethodFormProps) {
  const [paymentMethodName, setPaymentMethodName] = React.useState(
    method?.paymentMethodName ?? '',
  );
  const [isActive, setIsActive] = React.useState(method?.isActive ?? true);

  React.useEffect(() => {
    setPaymentMethodName(method?.paymentMethodName ?? '');
    setIsActive(method?.isActive ?? true);
  }, [method]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      method: {
        paymentMethodName: paymentMethodName.trim() || undefined,
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
            htmlFor="paymentMethodName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre del método de pago
          </label>
          <Input
            id="paymentMethodName"
            value={paymentMethodName}
            onChange={(event) => setPaymentMethodName(event.target.value)}
            placeholder="Nombre del método"
          />
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
            Método activo
          </label>
        </div>
      </div>

      <Separator />

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
          {isSaving ? 'Guardando...' : method ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
