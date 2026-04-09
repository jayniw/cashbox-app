'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, XIcon, CheckIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  listOperations,
  type CashboxOperationResponse,
} from '@/lib/services/operationAdmin';
import { listPartners } from '@/lib/services/partnerAdmin';

interface OperationTableProps {
  onEdit: (operation: CashboxOperationResponse) => void;
  onRequestDeactivate: (operation: CashboxOperationResponse) => void;
  onRequestActivate: (operation: CashboxOperationResponse) => void;
  refreshKey?: number;
}

export function OperationTable({
  onEdit,
  onRequestDeactivate,
  onRequestActivate,
  refreshKey,
}: OperationTableProps) {
  const [operations, setOperations] = React.useState<
    CashboxOperationResponse[]
  >([]);
  const [partnerMap, setPartnerMap] = React.useState<Record<string, string>>(
    {},
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOperations = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const [operationResult, partnerResult] = await Promise.all([
        listOperations(),
        listPartners(),
      ]);

      const partnerMap = partnerResult.reduce<Record<string, string>>(
        (map, partner) => {
          map[partner.id] = partner.label;
          return map;
        },
        {},
      );

      setOperations(operationResult);
      setPartnerMap(partnerMap);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar las operaciones.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOperations();
  }, [loadOperations, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">Estado</th>
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
                Cargando operaciones...
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
          ) : operations.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron operaciones.
              </td>
            </tr>
          ) : (
            operations.map((operation) => (
              <tr
                key={operation.cashboxOperationId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {operation.operationName}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {partnerMap[operation.cashboxPartnerId] ??
                    operation.cashboxPartnerId}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {operation.isActive ? 'Activo' : 'Inactivo'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(operation.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(operation)}
                      aria-label="Editar operación"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    {operation.isActive ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRequestDeactivate(operation)}
                        aria-label="Inactivar operación"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => onRequestActivate(operation)}
                        aria-label="Activar operación"
                      >
                        <CheckIcon className="size-4" />
                      </Button>
                    )}
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
