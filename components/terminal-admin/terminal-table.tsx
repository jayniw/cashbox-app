import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckIcon, PencilIcon, XIcon } from 'lucide-react';
import {
  listTerminals,
  type TerminalResponse,
} from '@/lib/services/terminalAdmin';

interface TerminalTableProps {
  onEdit: (terminal: TerminalResponse) => void;
  onRequestDeactivate: (terminal: TerminalResponse) => void;
  onRequestActivate: (terminal: TerminalResponse) => void;
  refreshKey?: number;
}

export function TerminalTable({
  onEdit,
  onRequestDeactivate,
  onRequestActivate,
  refreshKey,
}: TerminalTableProps) {
  const [terminals, setTerminals] = React.useState<TerminalResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTerminals = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const terminalResult = await listTerminals();
      setTerminals(terminalResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar los terminales.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTerminals();
  }, [loadTerminals, refreshKey]);

  const handleDeactivate = (terminal: TerminalResponse) => {
    onRequestDeactivate(terminal);
  };

  const handleActivate = (terminal: TerminalResponse) => {
    onRequestActivate(terminal);
  };

  const isBusy = isLoading;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Terminal</th>
            <th className="px-4 py-3">IP</th>
            <th className="px-4 py-3">Activo</th>
            <th className="px-4 py-3">Última actualización</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isBusy ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando terminales...
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
          ) : terminals.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron terminales.
              </td>
            </tr>
          ) : (
            terminals.map((terminal) => (
              <tr
                key={terminal.cashboxTerminalId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {terminal.terminalName ?? 'Sin nombre'}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {terminal.ipAddress ?? '—'}
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                      terminal.isActive
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {terminal.isActive ? (
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
                  {new Date(terminal.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(terminal)}
                      aria-label="Editar terminal"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    {terminal.isActive ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeactivate(terminal)}
                        aria-label="Inactivar terminal"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => handleActivate(terminal)}
                        aria-label="Activar terminal"
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
