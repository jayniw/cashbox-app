'use client';

import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { OperationForm } from './operation-form';
import { OperationTable } from './operation-table';
import {
  createOperation,
  deactivateOperation,
  updateOperation,
  type CashboxOperationResponse,
} from '@/lib/services/operationAdmin';
import { useAdminStore } from '@/lib/store/adminStore';
import * as React from 'react';

export function OperationAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingOperation, setEditingOperation] =
    React.useState<CashboxOperationResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmOperation, setConfirmOperation] = React.useState<{
    id: string;
    name: string;
    action: 'activate' | 'deactivate';
  } | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingOperation(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (operation: CashboxOperationResponse) => {
    setEditingOperation(operation);
    setIsSheetOpen(true);
  };

  const handleRequestAction = (
    operation: CashboxOperationResponse,
    action: 'activate' | 'deactivate',
  ) => {
    setConfirmOperation({
      id: operation.cashboxOperationId,
      name: operation.operationName,
      action,
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmOperation) return;

    setConfirmOpen(false);
    try {
      if (confirmOperation.action === 'activate') {
        await updateOperation(confirmOperation.id, { isActive: true });
      } else {
        await deactivateOperation(confirmOperation.id);
      }
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Error al ${confirmOperation.action} la operación ${confirmOperation.name}.`,
      );
    } finally {
      setConfirmOperation(null);
    }
  };

  const handleSubmit = async (payload: {
    operation: {
      operationName?: string;
      partnerId?: string;
      isActive?: boolean;
    };
  }) => {
    setIsSaving(true);

    try {
      if (editingOperation) {
        await updateOperation(
          editingOperation.cashboxOperationId,
          payload.operation,
        );
      } else {
        await createOperation(payload.operation);
      }
      setIsSheetOpen(false);
      setEditingOperation(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al guardar la operación.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingOperation(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de operaciones"
        description="Lista, crea y edita operaciones. Asigna cada operación al partner correspondiente."
        onCreate={handleCreate}
        createAriaLabel="Crear nueva operación"
        error={error}
      >
        <OperationTable
          onEdit={handleEdit}
          onRequestDeactivate={(operation) =>
            handleRequestAction(operation, 'deactivate')
          }
          onRequestActivate={(operation) =>
            handleRequestAction(operation, 'activate')
          }
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmOperation(null);
          }
        }}
        title={
          confirmOperation?.action === 'activate'
            ? 'Activar operación'
            : 'Inactivar operación'
        }
        description={`¿Deseas ${
          confirmOperation?.action === 'activate' ? 'activar' : 'inactivar'
        } la operación ${confirmOperation?.name ?? 'sin nombre'}?`}
        confirmLabel={
          confirmOperation?.action === 'activate' ? 'Activar' : 'Inactivar'
        }
        confirmVariant={
          confirmOperation?.action === 'activate' ? 'default' : 'destructive'
        }
        onConfirm={handleConfirmAction}
      />

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingOperation ? 'Editar operación' : 'Crear operación'}
        description={
          editingOperation
            ? 'Modifica los datos de la operación y su partner asociado.'
            : 'Completa los datos de la operación y selecciona un partner.'
        }
        side="right"
        className="max-w-2xl"
      >
        <OperationForm
          operation={editingOperation}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
