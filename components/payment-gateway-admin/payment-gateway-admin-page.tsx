'use client';

import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { PaymentGatewayForm } from './payment-gateway-form';
import { PaymentGatewayTable } from './payment-gateway-table';
import {
  createPaymentGateway,
  listPaymentGateways,
  updatePaymentGateway,
  type CashboxPaymentGatewayResponse,
} from '@/lib/services/paymentGatewayAdmin';
import { useAdminStore } from '@/lib/store/adminStore';
import * as React from 'react';

export function PaymentGatewayAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingGateway, setEditingGateway] =
    React.useState<CashboxPaymentGatewayResponse | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingGateway(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (gateway: CashboxPaymentGatewayResponse) => {
    setEditingGateway(gateway);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (payload: {
    gateway: {
      paymentGatewayName?: string;
      paymentGatewayDescription?: string | null;
      gatewayConfiguration?: unknown;
      paymentGatewayType?: string;
    };
  }) => {
    setIsSaving(true);

    try {
      if (editingGateway) {
        await updatePaymentGateway(
          editingGateway.cashboxPaymentGatewayId,
          payload.gateway,
        );
      } else {
        await createPaymentGateway(payload.gateway);
      }
      setIsSheetOpen(false);
      setEditingGateway(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Error al guardar la gateway.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingGateway(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de payment gateways"
        description="Lista, crea y edita pasarelas de pago."
        onCreate={handleCreate}
        createAriaLabel="Crear nueva pasarela de pago"
        error={error}
      >
        <PaymentGatewayTable
          onEdit={handleEdit}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={
          editingGateway ? 'Editar payment gateway' : 'Crear payment gateway'
        }
        description={
          editingGateway
            ? 'Actualiza la configuración de la pasarela de pago.'
            : 'Completa los datos de la pasarela de pago.'
        }
        side="right"
        className="max-w-2xl"
      >
        <PaymentGatewayForm
          gateway={editingGateway}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
