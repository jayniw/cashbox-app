import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TerminalResponse } from '@/lib/services/terminalAdmin';

interface TerminalTableProps {
  terminals: TerminalResponse[];
  onEdit: (terminal: TerminalResponse) => void;
  onDeactivate: (terminalId: string) => void;
  isLoading: boolean;
}

export function TerminalTable({
  terminals,
  onEdit,
  onDeactivate,
  isLoading,
}: TerminalTableProps) {
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
          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando terminales...
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
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      terminal.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {terminal.isActive ? 'Activo' : 'Inactivo'}
                  </span>
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
                      size="sm"
                      onClick={() => onEdit(terminal)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeactivate(terminal.cashboxTerminalId)}
                    >
                      Inactivar
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
