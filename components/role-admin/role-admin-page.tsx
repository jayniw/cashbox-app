'use client';

import { AdminFormSheet } from '@/components/admin-form-sheet';
import {
  createRoleWithRelations,
  updateRoleWithRelations,
  type CashboxRoleResponse,
} from '@/lib/services/roleAdmin';
import * as React from 'react';
import { RoleForm } from './role-form';
import { RoleTable } from './role-table';
import { AdminListPage } from '@/components/admin-list-page';
import { useAdminStore } from '@/lib/store/adminStore';

export function RoleAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingRole, setEditingRole] =
    React.useState<CashboxRoleResponse | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingRole(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (role: CashboxRoleResponse) => {
    setEditingRole(role);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (payload: {
    role: {
      roleName: string;
    };
    partnerIds: string[];
    operationIds: string[];
    paymentMethodIds: string[];
  }) => {
    setIsSaving(true);
    try {
      if (editingRole) {
        await updateRoleWithRelations(
          editingRole.cashboxRoleId,
          payload.role,
          payload.partnerIds,
          payload.operationIds,
          payload.paymentMethodIds,
        );
      } else {
        await createRoleWithRelations(
          payload.role,
          payload.partnerIds,
          payload.operationIds,
          payload.paymentMethodIds,
        );
      }
      setIsSheetOpen(false);
      setEditingRole(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al guardar el role.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingRole(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de roles"
        description="Lista, crea y edita roles. Asigna partners, operaciones y métodos de pago."
        onCreate={handleCreate}
        createAriaLabel="Crear nuevo role"
        error={error}
      >
        <RoleTable
          onEdit={handleEdit}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingRole ? 'Editar role' : 'Crear role'}
        description={
          editingRole
            ? 'Actualiza la configuración del role y sus relaciones.'
            : 'Completa los datos del role y asigna partners, operaciones y métodos de pago.'
        }
        side="right"
        className="max-w-2xl"
      >
        <RoleForm
          role={editingRole}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
