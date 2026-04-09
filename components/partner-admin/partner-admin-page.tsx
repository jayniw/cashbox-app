'use client';

import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { PartnerForm } from './partner-form';
import { PartnerTable } from './partner-table';
import {
  createPartnerWithRelations,
  updatePartnerWithRelations,
  updatePartner,
  type CashboxPartnerResponse,
} from '@/lib/services/partnerAdmin';
import { useAdminStore } from '@/lib/store/adminStore';
import * as React from 'react';

export function PartnerAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingPartner, setEditingPartner] =
    React.useState<CashboxPartnerResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmPartner, setConfirmPartner] = React.useState<{
    id: string;
    name: string | null;
    action: 'activate' | 'deactivate';
  } | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingPartner(null);
    setIsSheetOpen(true);
  };

  const handleEdit = async (partner: CashboxPartnerResponse) => {
    setEditingPartner(partner);
    setIsSheetOpen(true);
  };

  const handleRequestAction = (
    partner: CashboxPartnerResponse,
    action: 'activate' | 'deactivate',
  ) => {
    setConfirmPartner({
      id: partner.cashboxPartnerId,
      name: partner.partnerName,
      action,
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmPartner) return;

    setConfirmOpen(false);
    try {
      await updatePartner(confirmPartner.id, {
        partnerStatus:
          confirmPartner.action === 'activate' ? 'Active' : 'Inactive',
      });
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Error al ${confirmPartner.action} el partner.`,
      );
    } finally {
      setConfirmPartner(null);
    }
  };

  const handleSubmit = async (payload: {
    partner: {
      partnerName?: string;
      partnerStatus?: string;
    };
    paymentMethodIds: string[];
  }) => {
    setIsSaving(true);
    try {
      if (editingPartner) {
        await updatePartnerWithRelations(
          editingPartner.cashboxPartnerId,
          payload.partner,
          payload.paymentMethodIds,
        );
      } else {
        await createPartnerWithRelations(
          payload.partner,
          payload.paymentMethodIds,
        );
      }

      setIsSheetOpen(false);
      setEditingPartner(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al guardar el partner.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingPartner(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de partners"
        description="Lista, crea y edita partners. Asocia métodos de pago al partner desde su página de edición."
        onCreate={handleCreate}
        createAriaLabel="Crear nuevo partner"
      >
        <PartnerTable
          onEdit={handleEdit}
          onRequestDeactivate={(partner) =>
            handleRequestAction(partner, 'deactivate')
          }
          onRequestActivate={(partner) =>
            handleRequestAction(partner, 'activate')
          }
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmPartner(null);
          }
        }}
        title={
          confirmPartner?.action === 'activate'
            ? 'Activar partner'
            : 'Inactivar partner'
        }
        description={
          confirmPartner?.action === 'activate'
            ? `¿Deseas activar el partner ${confirmPartner?.name ?? 'sin nombre'}?`
            : `¿Deseas inactivar el partner ${confirmPartner?.name ?? 'sin nombre'}? Esta acción no borrará el registro.`
        }
        confirmLabel={
          confirmPartner?.action === 'activate' ? 'Activar' : 'Inactivar'
        }
        confirmVariant={
          confirmPartner?.action === 'activate' ? 'default' : 'destructive'
        }
        onConfirm={handleConfirmAction}
      />

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingPartner ? 'Editar partner' : 'Crear partner'}
        description={
          editingPartner
            ? 'Actualiza el partner y sus métodos de pago asociados.'
            : 'Completa los datos del partner y asigna los métodos de pago permitidos.'
        }
        side="right"
        className="max-w-2xl"
      >
        <PartnerForm
          partner={editingPartner}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
