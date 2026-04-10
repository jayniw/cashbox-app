'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  SearchSelect,
  type SearchSelectOption,
} from '@/components/ui/search-select';
import { listPaymentGatewayOptions } from '@/lib/services/paymentGatewayAdmin';
import { listPaymentMethodOptions } from '@/lib/services/paymentMethodAdmin';
import { type CashboxPaymentMethodProviderResponse } from '@/lib/services/paymentMethodProviderAdmin';

interface PaymentMethodProviderFormProps {
  provider?: CashboxPaymentMethodProviderResponse | null;
  onSubmit: (payload: {
    provider: {
      paymentMethodId?: string;
      paymentGatewayId?: string;
      providerName?: string;
      providerDescription?: string | null;
    };
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function PaymentMethodProviderForm({
  provider,
  onSubmit,
  onCancel,
  isSaving,
}: PaymentMethodProviderFormProps) {
  const [providerName, setProviderName] = React.useState(
    provider?.providerName ?? '',
  );
  const [providerDescription, setProviderDescription] = React.useState(
    provider?.providerDescription ?? '',
  );
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] =
    React.useState<string[]>(
      provider?.paymentMethodId ? [provider.paymentMethodId] : [],
    );
  const [selectedPaymentGatewayIds, setSelectedPaymentGatewayIds] =
    React.useState<string[]>(
      provider?.paymentGatewayId ? [provider.paymentGatewayId] : [],
    );
  const [paymentMethods, setPaymentMethods] = React.useState<
    SearchSelectOption[]
  >([]);
  const [paymentGateways, setPaymentGateways] = React.useState<
    SearchSelectOption[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true);

  React.useEffect(() => {
    setProviderName(provider?.providerName ?? '');
    setProviderDescription(provider?.providerDescription ?? '');
    setSelectedPaymentMethodIds(
      provider?.paymentMethodId ? [provider.paymentMethodId] : [],
    );
    setSelectedPaymentGatewayIds(
      provider?.paymentGatewayId ? [provider.paymentGatewayId] : [],
    );
  }, [provider]);

  React.useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [methods, gateways] = await Promise.all([
          listPaymentMethodOptions(),
          listPaymentGatewayOptions(),
        ]);

        if (!isMounted) return;
        setPaymentMethods(methods);
        setPaymentGateways(gateways);
      } catch (error) {
        console.error('Error cargando opciones:', error);
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      provider: {
        paymentMethodId: selectedPaymentMethodIds[0] || undefined,
        paymentGatewayId: selectedPaymentGatewayIds[0] || undefined,
        providerName: providerName.trim() || undefined,
        providerDescription: providerDescription.trim() || null,
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
          <SearchSelect
            label="Método de pago"
            options={paymentMethods}
            selectedValues={selectedPaymentMethodIds}
            onChange={setSelectedPaymentMethodIds}
            placeholder="Buscar método de pago..."
            description="Selecciona el método de pago a vincular con el proveedor."
            multiple={false}
          />
        </div>

        <div className="space-y-2">
          <SearchSelect
            label="Pasarela de pago"
            options={paymentGateways}
            selectedValues={selectedPaymentGatewayIds}
            onChange={setSelectedPaymentGatewayIds}
            placeholder="Buscar pasarela..."
            description="Selecciona la pasarela que utilizará el proveedor."
            multiple={false}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="providerName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre del proveedor
          </label>
          <Input
            id="providerName"
            value={providerName}
            onChange={(event) => setProviderName(event.target.value)}
            placeholder="Nombre del proveedor"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="providerDescription"
            className="block text-sm font-medium text-foreground"
          >
            Descripción
          </label>
          <Textarea
            id="providerDescription"
            value={providerDescription}
            onChange={(event) => setProviderDescription(event.target.value)}
            placeholder="Descripción del proveedor"
            rows={3}
          />
        </div>

        {isLoadingOptions && (
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Cargando opciones de métodos de pago y pasarelas...
          </div>
        )}
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
          {isSaving ? 'Guardando...' : provider ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
