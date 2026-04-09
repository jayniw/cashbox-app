'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, XIcon, CheckIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { listUsers, type CashboxUserResponse } from '@/lib/services/userAdmin';

interface UserTableProps {
  onEdit: (user: CashboxUserResponse) => void;
  onRequestDeactivate: (user: CashboxUserResponse) => void;
  onRequestActivate: (user: CashboxUserResponse) => void;
  refreshKey?: number;
}

export function UserTable({
  onEdit,
  onRequestDeactivate,
  onRequestActivate,
  refreshKey,
}: UserTableProps) {
  const [users, setUsers] = React.useState<CashboxUserResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await listUsers();
      setUsers(result);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar los usuarios.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Autenticación</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Última actualización</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando usuarios...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-destructive"
              >
                {error}
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.cashboxUserId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {user.userName}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {user.userEmail ?? '—'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {user.authenticationType ?? '—'}
                </td>
                <td className="px-4 py-4 text-foreground">
                  {user.userStatus ?? 'Unknown'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(user.tranDate).toLocaleDateString('es-ES', {
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
                      onClick={() => onEdit(user)}
                      aria-label="Editar usuario"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    {(user.userStatus ?? '').toLowerCase() === 'active' ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRequestDeactivate(user)}
                        aria-label="Inactivar usuario"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => onRequestActivate(user)}
                        aria-label="Activar usuario"
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
