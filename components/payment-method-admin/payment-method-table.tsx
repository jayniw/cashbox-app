'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, PencilIcon, XIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  listPaymentMethodRecords,
  type CashboxPaymentMethodResponse,
} from '@/lib/services/paymentMethodAdmin';

interface PaymentMethodTableProps {
  onEdit: (method: CashboxPaymentMethodResponse) => void;
  refreshKey?: number;
}

export function PaymentMethodTable({
  onEdit,
  refreshKey,
}: PaymentMethodTableProps) {
  const [methods, setMethods] = React.useState<CashboxPaymentMethodResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadMethods = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const methodResult = await listPaymentMethodRecords();
      setMethods(methodResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar los métodos de pago.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMethods();
  }, [loadMethods, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Activo</th>
            <th className="px-4 py-3">Última actualización</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando métodos de pago...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-destructive"
              >
                {error}
              </td>
            </tr>
          ) : methods.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron métodos de pago.
              </td>
            </tr>
          ) : (
            methods.map((method) => (
              <tr
                key={method.cashboxPaymentMethodId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {method.paymentMethodName}
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                      method.isActive
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {method.isActive ? (
                      <CheckIcon
                        className="size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <XIcon
                        className="size-4"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(method.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(method)}
                      aria-label="Editar método"
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
