'use client';

import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { PaymentMethodProviderForm } from './payment-method-provider-form';
import { PaymentMethodProviderTable } from './payment-method-provider-table';
import {
  createPaymentMethodProvider,
  listPaymentMethodProviders,
  updatePaymentMethodProvider,
  type CashboxPaymentMethodProviderResponse,
} from '@/lib/services/paymentMethodProviderAdmin';
import { useAdminStore } from '@/lib/store/adminStore';
import * as React from 'react';

export function PaymentMethodProviderAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingProvider, setEditingProvider] =
    React.useState<CashboxPaymentMethodProviderResponse | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingProvider(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (provider: CashboxPaymentMethodProviderResponse) => {
    setEditingProvider(provider);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (payload: {
    provider: {
      paymentMethodId?: string;
      paymentGatewayId?: string;
      providerName?: string;
      providerDescription?: string | null;
    };
  }) => {
    setIsSaving(true);

    try {
      if (editingProvider) {
        await updatePaymentMethodProvider(
          editingProvider.cashboxPaymentMethodProviderId,
          payload.provider,
        );
      } else {
        await createPaymentMethodProvider(payload.provider);
      }
      setIsSheetOpen(false);
      setEditingProvider(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al guardar el proveedor de método.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingProvider(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de payment method providers"
        description="Lista, crea y edita proveedores de métodos de pago."
        onCreate={handleCreate}
        createAriaLabel="Crear nuevo proveedor de método"
        error={error}
      >
        <PaymentMethodProviderTable
          onEdit={handleEdit}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={
          editingProvider
            ? 'Editar payment method provider'
            : 'Crear payment method provider'
        }
        description={
          editingProvider
            ? 'Actualiza los datos del proveedor de método de pago.'
            : 'Completa los datos del proveedor de método de pago.'
        }
        side="right"
        className="max-w-2xl"
      >
        <PaymentMethodProviderForm
          provider={editingProvider}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
