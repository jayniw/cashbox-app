'use client';

import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminFormSheet } from '@/components/admin-form-sheet';
import {
  createTerminalWithRelations,
  deactivateTerminal,
  updateTerminal,
  updateTerminalWithRelations,
  type TerminalCreatePayload,
  type TerminalResponse,
} from '@/lib/services/terminalAdmin';
import * as React from 'react';
import { TerminalForm } from './terminal-form';
import { TerminalTable } from './terminal-table';
import { AdminListPage } from '@/components/admin-list-page';
import { useAdminStore } from '@/lib/store/adminStore';

export function TerminalAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTerminal, setConfirmTerminal] = React.useState<{
    id: string;
    name: string | null;
    action: 'activate' | 'deactivate';
  } | null>(null);
  const [editingTerminal, setEditingTerminal] =
    React.useState<TerminalResponse | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingTerminal(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (terminal: TerminalResponse) => {
    setEditingTerminal(terminal);
    setIsSheetOpen(true);
  };

  const handleRequestAction = (
    terminal: TerminalResponse,
    action: 'activate' | 'deactivate',
  ) => {
    setConfirmTerminal({
      id: terminal.cashboxTerminalId,
      name: terminal.terminalName,
      action,
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmTerminal) return;

    setConfirmOpen(false);
    try {
      if (confirmTerminal.action === 'activate') {
        await updateTerminal(confirmTerminal.id, { isActive: true });
      } else {
        await deactivateTerminal(confirmTerminal.id);
      }
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Error al ${confirmTerminal.action} el terminal.`,
      );
    } finally {
      setConfirmTerminal(null);
    }
  };

  const handleSubmit = async (payload: {
    terminal: TerminalCreatePayload;
    partnerIds: string[];
    operationIds: string[];
    paymentMethodIds: string[];
  }) => {
    setIsSaving(true);
    try {
      if (editingTerminal) {
        await updateTerminalWithRelations(
          editingTerminal.cashboxTerminalId,
          payload.terminal,
          payload.partnerIds,
          payload.operationIds,
          payload.paymentMethodIds,
        );
      } else {
        await createTerminalWithRelations(
          payload.terminal,
          payload.partnerIds,
          payload.operationIds,
          payload.paymentMethodIds,
        );
      }

      setIsSheetOpen(false);
      setEditingTerminal(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al guardar el terminal.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingTerminal(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de terminales"
        description="Lista, crea y edita terminales. Asigna partners, operaciones y medios de pago."
        onCreate={handleCreate}
        createAriaLabel="Crear nueva terminal"
        error={error}
      >
        <TerminalTable
          onEdit={handleEdit}
          onRequestDeactivate={(terminal) => {
            handleRequestAction(terminal, 'deactivate');
          }}
          onRequestActivate={(terminal) => {
            handleRequestAction(terminal, 'activate');
          }}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmTerminal(null);
          }
        }}
        title={
          confirmTerminal?.action === 'activate'
            ? 'Activar terminal'
            : 'Inactivar terminal'
        }
        description={
          confirmTerminal?.action === 'activate'
            ? `¿Deseas activar el terminal ${confirmTerminal?.name ?? 'sin nombre'}? Esta acción lo pondrá nuevamente en servicio.`
            : `¿Deseas inactivar el terminal ${confirmTerminal?.name ?? 'sin nombre'}? Esta acción lo desactivará pero no eliminará los datos.`
        }
        confirmLabel={
          confirmTerminal?.action === 'activate' ? 'Activar' : 'Inactivar'
        }
        confirmVariant={
          confirmTerminal?.action === 'activate' ? 'default' : 'destructive'
        }
        onConfirm={handleConfirmAction}
      />

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingTerminal ? 'Editar terminal' : 'Crear terminal'}
        description={
          editingTerminal
            ? 'Actualiza la configuración del terminal y sus relaciones.'
            : 'Completa los datos del terminal y asigna partners, operaciones y métodos de pago.'
        }
        side="right"
        className="max-w-2xl"
      >
        <TerminalForm
          terminal={editingTerminal}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
