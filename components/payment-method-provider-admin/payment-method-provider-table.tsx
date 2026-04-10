'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  listPaymentMethodProviders,
  type CashboxPaymentMethodProviderResponse,
} from '@/lib/services/paymentMethodProviderAdmin';
import { listPaymentMethods } from '@/lib/services/paymentMethodAdmin';
import { listPaymentGateways } from '@/lib/services/paymentGatewayAdmin';

interface PaymentMethodProviderTableProps {
  onEdit: (provider: CashboxPaymentMethodProviderResponse) => void;
  refreshKey?: number;
}

export function PaymentMethodProviderTable({
  onEdit,
  refreshKey,
}: PaymentMethodProviderTableProps) {
  const [providers, setProviders] = React.useState<
    CashboxPaymentMethodProviderResponse[]
  >([]);
  const [paymentMethods, setPaymentMethods] = React.useState<
    Record<string, string>
  >({});
  const [paymentGateways, setPaymentGateways] = React.useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadProviders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [providerResult, methodResult, gatewayResult] = await Promise.all([
        listPaymentMethodProviders(),
        listPaymentMethods(),
        listPaymentGateways(),
      ]);

      setProviders(providerResult);
      setPaymentMethods(
        Object.fromEntries(
          methodResult.map((method) => [
            method.cashboxPaymentMethodId,
            method.paymentMethodName ?? method.cashboxPaymentMethodId,
          ]),
        ),
      );
      setPaymentGateways(
        Object.fromEntries(
          gatewayResult.map((gateway) => [
            gateway.cashboxPaymentGatewayId,
            gateway.paymentGatewayName ?? gateway.cashboxPaymentGatewayId,
          ]),
        ),
      );
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar proveedores de método de pago.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProviders();
  }, [loadProviders, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Proveedor</th>
            <th className="px-4 py-3">Payment method</th>
            <th className="px-4 py-3">Payment gateway</th>
            <th className="px-4 py-3">Última actualización</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando proveedores...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-destructive"
              >
                {error}
              </td>
            </tr>
          ) : providers.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron proveedores.
              </td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr
                key={provider.cashboxPaymentMethodProviderId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {provider.providerName}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {paymentMethods[provider.paymentMethodId] ??
                    provider.paymentMethodId}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {paymentGateways[provider.paymentGatewayId] ??
                    provider.paymentGatewayId}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(provider.tranDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(provider)}
                      aria-label="Editar proveedor"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Separator />
    </div>
  );
}
