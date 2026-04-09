import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PencilIcon } from 'lucide-react';
import { listRoles, type CashboxRoleResponse } from '@/lib/services/roleAdmin';

interface RoleTableProps {
  onEdit: (role: CashboxRoleResponse) => void;
  refreshKey?: number;
}

export function RoleTable({ onEdit, refreshKey }: RoleTableProps) {
  const [roles, setRoles] = React.useState<CashboxRoleResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadRoles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const roleResult = await listRoles();
      setRoles(roleResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al cargar los roles.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Usuario</th>
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
                Cargando roles...
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
          ) : roles.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron roles.
              </td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr
                key={role.cashboxRoleId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {role.roleName ?? 'Sin nombre'}
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {role.userId ?? '—'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(role.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(role)}
                      aria-label="Editar role"
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
