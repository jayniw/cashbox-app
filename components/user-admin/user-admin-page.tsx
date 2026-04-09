'use client';

import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { UserForm } from './user-form';
import { UserTable } from './user-table';
import {
  createUserWithRelations,
  deactivateUser,
  updateUser,
  type CashboxUserResponse,
  updateUserWithRelations,
} from '@/lib/services/userAdmin';
import { useAdminStore } from '@/lib/store/adminStore';
import * as React from 'react';

export function UserAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingUser, setEditingUser] =
    React.useState<CashboxUserResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmUser, setConfirmUser] = React.useState<{
    id: string;
    name: string | null;
    action: 'activate' | 'deactivate';
  } | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingUser(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (user: CashboxUserResponse) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  };

  const handleRequestAction = (
    user: CashboxUserResponse,
    action: 'activate' | 'deactivate',
  ) => {
    setConfirmUser({
      id: user.cashboxUserId,
      name: user.userName,
      action,
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmUser) return;

    setConfirmOpen(false);
    try {
      if (confirmUser.action === 'activate') {
        await updateUser(confirmUser.id, { userStatus: 'Active' });
      } else {
        await deactivateUser(confirmUser.id);
      }
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Error al ${confirmUser.action} el usuario ${confirmUser.name ?? ''}.`,
      );
    } finally {
      setConfirmUser(null);
    }
  };

  const handleSubmit = async (payload: {
    user: {
      userName: string;
      authenticationType?: string;
      userStatus?: string;
      userEmail?: string | null;
      userPhone?: string | null;
    };
    roleIds: string[];
    terminalIds: string[];
  }) => {
    setIsSaving(true);

    try {
      if (editingUser) {
        await updateUserWithRelations(
          editingUser.cashboxUserId,
          payload.user,
          payload.roleIds,
          payload.terminalIds,
        );
      } else {
        await createUserWithRelations(
          payload.user,
          payload.roleIds,
          payload.terminalIds,
        );
      }

      setIsSheetOpen(false);
      setEditingUser(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al guardar el usuario.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de usuarios"
        description="Lista, crea y edita usuarios. Asigna roles y terminales desde el formulario de usuario."
        onCreate={handleCreate}
        createAriaLabel="Crear nuevo usuario"
        error={error}
      >
        <UserTable
          onEdit={handleEdit}
          onRequestDeactivate={(user) =>
            handleRequestAction(user, 'deactivate')
          }
          onRequestActivate={(user) => handleRequestAction(user, 'activate')}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmUser(null);
          }
        }}
        title={
          confirmUser?.action === 'activate'
            ? 'Activar usuario'
            : 'Inactivar usuario'
        }
        description={`¿Deseas ${
          confirmUser?.action === 'activate' ? 'activar' : 'inactivar'
        } el usuario ${confirmUser?.name ?? 'sin nombre'}? Esta acción ${
          confirmUser?.action === 'activate'
            ? 'volverá a habilitar su cuenta.'
            : 'desactivará su cuenta sin eliminarla.'
        }`}
        confirmLabel={
          confirmUser?.action === 'activate' ? 'Activar' : 'Inactivar'
        }
        confirmVariant={
          confirmUser?.action === 'activate' ? 'default' : 'destructive'
        }
        onConfirm={handleConfirmAction}
      />

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingUser ? 'Editar usuario' : 'Crear usuario'}
        description={
          editingUser
            ? 'Actualiza los datos del usuario y sus relaciones con roles y terminales.'
            : 'Completa los datos del usuario y asigna roles y terminales.'
        }
        side="right"
        className="max-w-2xl"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
