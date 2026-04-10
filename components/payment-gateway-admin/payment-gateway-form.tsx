'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { type CashboxPaymentGatewayResponse } from '@/lib/services/paymentGatewayAdmin';

interface PaymentGatewayFormProps {
  gateway?: CashboxPaymentGatewayResponse | null;
  onSubmit: (payload: {
    gateway: {
      paymentGatewayName?: string;
      paymentGatewayDescription?: string | null;
      gatewayConfiguration?: unknown;
      paymentGatewayType?: string;
    };
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const GATEWAY_TYPES = ['REST', 'SOAP', 'GRAPHQL'];

export function PaymentGatewayForm({
  gateway,
  onSubmit,
  onCancel,
  isSaving,
}: PaymentGatewayFormProps) {
  const [paymentGatewayName, setPaymentGatewayName] = React.useState(
    gateway?.paymentGatewayName ?? '',
  );
  const [paymentGatewayDescription, setPaymentGatewayDescription] =
    React.useState(gateway?.paymentGatewayDescription ?? '');
  const [gatewayConfiguration, setGatewayConfiguration] = React.useState(
    gateway?.gatewayConfiguration
      ? JSON.stringify(gateway.gatewayConfiguration, null, 2)
      : '',
  );
  const [paymentGatewayType, setPaymentGatewayType] = React.useState(
    gateway?.paymentGatewayType ?? 'REST',
  );
  const [configError, setConfigError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPaymentGatewayName(gateway?.paymentGatewayName ?? '');
    setPaymentGatewayDescription(gateway?.paymentGatewayDescription ?? '');
    setGatewayConfiguration(
      gateway?.gatewayConfiguration
        ? JSON.stringify(gateway.gatewayConfiguration, null, 2)
        : '',
    );
    setPaymentGatewayType(gateway?.paymentGatewayType ?? 'REST');
    setConfigError(null);
  }, [gateway]);

  const parseConfig = () => {
    if (!gatewayConfiguration.trim()) {
      return null;
    }

    try {
      return JSON.parse(gatewayConfiguration);
    } catch (error) {
      setConfigError('La configuración JSON no es válida.');
      return undefined;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfigError(null);

    const config = parseConfig();
    if (config === undefined) return;

    await onSubmit({
      gateway: {
        paymentGatewayName: paymentGatewayName.trim() || undefined,
        paymentGatewayDescription: paymentGatewayDescription.trim() || null,
        gatewayConfiguration: config,
        paymentGatewayType,
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
            htmlFor="paymentGatewayName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de la pasarela
          </label>
          <Input
            id="paymentGatewayName"
            value={paymentGatewayName}
            onChange={(event) => setPaymentGatewayName(event.target.value)}
            placeholder="Nombre de la gateway"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="paymentGatewayType"
            className="block text-sm font-medium text-foreground"
          >
            Tipo
          </label>
          <select
            id="paymentGatewayType"
            value={paymentGatewayType}
            onChange={(event) => setPaymentGatewayType(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {GATEWAY_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="paymentGatewayDescription"
            className="block text-sm font-medium text-foreground"
          >
            Descripción
          </label>
          <Textarea
            id="paymentGatewayDescription"
            value={paymentGatewayDescription}
            onChange={(event) =>
              setPaymentGatewayDescription(event.target.value)
            }
            placeholder="Descripción corta"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="gatewayConfiguration"
            className="block text-sm font-medium text-foreground"
          >
            Configuración JSON
          </label>
          <Textarea
            id="gatewayConfiguration"
            value={gatewayConfiguration}
            onChange={(event) => setGatewayConfiguration(event.target.value)}
            placeholder='{"endpoint": "https://api.example.com"}'
            rows={6}
          />
          {configError ? (
            <p className="text-sm text-destructive">{configError}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ingresa un objeto JSON válido o déjalo vacío.
            </p>
          )}
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
          {isSaving ? 'Guardando...' : gateway ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
