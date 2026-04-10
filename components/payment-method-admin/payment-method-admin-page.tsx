'use client';

import * as React from 'react';
import { AdminFormSheet } from '@/components/admin-form-sheet';
import { AdminListPage } from '@/components/admin-list-page';
import { PaymentMethodForm } from './payment-method-form';
import { PaymentMethodTable } from './payment-method-table';
import {
  createPaymentMethod,
  listPaymentMethodRecords,
  updatePaymentMethod,
  type CashboxPaymentMethodResponse,
} from '@/lib/services/paymentMethodAdmin';
import { useAdminStore } from '@/lib/store/adminStore';

export function PaymentMethodAdminPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingMethod, setEditingMethod] =
    React.useState<CashboxPaymentMethodResponse | null>(null);
  const refreshKey = useAdminStore((state) => state.refreshKey);
  const error = useAdminStore((state) => state.error);
  const setError = useAdminStore((state) => state.setError);
  const bumpRefreshKey = useAdminStore((state) => state.bumpRefreshKey);

  const handleCreate = () => {
    setEditingMethod(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (method: CashboxPaymentMethodResponse) => {
    setEditingMethod(method);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (payload: {
    method: {
      paymentMethodName?: string;
      isActive?: boolean;
    };
  }) => {
    setIsSaving(true);

    try {
      if (editingMethod) {
        await updatePaymentMethod(
          editingMethod.cashboxPaymentMethodId,
          payload.method,
        );
      } else {
        await createPaymentMethod(payload.method);
      }
      setIsSheetOpen(false);
      setEditingMethod(null);
      bumpRefreshKey();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al guardar el método de pago.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingMethod(null);
  };

  return (
    <div className="space-y-6">
      <AdminListPage
        title="Administración de payment methods"
        description="Lista, crea y edita métodos de pago."
        onCreate={handleCreate}
        createAriaLabel="Crear nuevo método de pago"
        error={error}
      >
        <PaymentMethodTable
          onEdit={handleEdit}
          refreshKey={refreshKey}
        />
      </AdminListPage>

      <AdminFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editingMethod ? 'Editar payment method' : 'Crear payment method'}
        description={
          editingMethod
            ? 'Actualiza los datos del método de pago.'
            : 'Completa los datos del método de pago.'
        }
        side="right"
        className="max-w-2xl"
      >
        <PaymentMethodForm
          method={editingMethod}
          onSubmit={handleSubmit}
          onCancel={handleCloseSheet}
          isSaving={isSaving}
        />
      </AdminFormSheet>
    </div>
  );
}
