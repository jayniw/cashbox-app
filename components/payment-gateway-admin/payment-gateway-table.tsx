'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  listPaymentGateways,
  type CashboxPaymentGatewayResponse,
} from '@/lib/services/paymentGatewayAdmin';

interface PaymentGatewayTableProps {
  onEdit: (gateway: CashboxPaymentGatewayResponse) => void;
  refreshKey?: number;
}

export function PaymentGatewayTable({
  onEdit,
  refreshKey,
}: PaymentGatewayTableProps) {
  const [gateways, setGateways] = React.useState<
    CashboxPaymentGatewayResponse[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadGateways = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const gatewayResult = await listPaymentGateways();
      setGateways(gatewayResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar las pasarelas de pago.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadGateways();
  }, [loadGateways, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Descripción</th>
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
                Cargando pasarelas de pago...
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
          ) : gateways.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron pasarelas de pago.
              </td>
            </tr>
          ) : (
            gateways.map((gateway) => (
              <tr
                key={gateway.cashboxPaymentGatewayId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {gateway.paymentGatewayName}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {gateway.paymentGatewayType}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {gateway.paymentGatewayDescription ?? '—'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(gateway.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(gateway)}
                      aria-label="Editar pasarela"
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
