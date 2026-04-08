'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TerminalForm } from './terminal-form';
import { TerminalTable } from './terminal-table';
import {
  createTerminalWithRelations,
  deactivateTerminal,
  getTerminalRelations,
  listOperations,
  listPartners,
  listPaymentMethods,
  listTerminals,
  updateTerminalWithRelations,
  type SelectOption,
  type TerminalResponse,
  type TerminalCreatePayload,
} from '@/lib/services/terminalAdmin';

export function TerminalAdminPage() {
  const [terminals, setTerminals] = React.useState<TerminalResponse[]>([]);
  const [partnerOptions, setPartnerOptions] = React.useState<SelectOption[]>(
    [],
  );
  const [operationOptions, setOperationOptions] = React.useState<
    SelectOption[]
  >([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = React.useState<
    SelectOption[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingTerminal, setEditingTerminal] =
    React.useState<TerminalResponse | null>(null);
  const [defaultPartnerIds, setDefaultPartnerIds] = React.useState<string[]>(
    [],
  );
  const [defaultOperationIds, setDefaultOperationIds] = React.useState<
    string[]
  >([]);
  const [defaultPaymentMethodIds, setDefaultPaymentMethodIds] = React.useState<
    string[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);

  const loadOptions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        terminalResult,
        partnerResult,
        operationResult,
        paymentMethodResult,
      ] = await Promise.all([
        listTerminals(),
        listPartners(),
        listOperations(),
        listPaymentMethods(),
      ]);

      setTerminals(terminalResult);
      setPartnerOptions(partnerResult);
      setOperationOptions(operationResult);
      setPaymentMethodOptions(paymentMethodResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar los datos de terminales.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleCreate = () => {
    setEditingTerminal(null);
    setDefaultPartnerIds([]);
    setDefaultOperationIds([]);
    setDefaultPaymentMethodIds([]);
    setIsSheetOpen(true);
  };

  const handleEdit = async (terminal: TerminalResponse) => {
    setIsLoading(true);
    try {
      const relations = await getTerminalRelations(terminal.cashboxTerminalId);
      setEditingTerminal(terminal);
      setDefaultPartnerIds(relations.partnerIds);
      setDefaultOperationIds(relations.operationIds);
      setDefaultPaymentMethodIds(relations.paymentMethodIds);
      setIsSheetOpen(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo cargar la información del terminal.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (terminalId: string) => {
    const confirmed = window.confirm(
      '¿Deseas inactivar este terminal? Esta acción no eliminará los datos.',
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);
      await deactivateTerminal(terminalId);
      await loadOptions();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al inactivar el terminal.',
      );
    } finally {
      setIsLoading(false);
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
      await loadOptions();
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
      <div className="flex flex-col gap-4 rounded-xl bg-muted p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Administración de terminales
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista, crea y edita terminales. Asigna partners, operaciones y
            medios de pago.
          </p>
        </div>
        <Button onClick={handleCreate}>Nuevo terminal</Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <TerminalTable
        terminals={terminals}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        isLoading={isLoading}
      />

      <Sheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      >
        <SheetContent
          side="right"
          className="max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>
              {editingTerminal ? 'Editar terminal' : 'Crear terminal'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
            <TerminalForm
              terminal={editingTerminal}
              partnerOptions={partnerOptions}
              operationOptions={operationOptions}
              paymentMethodOptions={paymentMethodOptions}
              defaultPartnerIds={defaultPartnerIds}
              defaultOperationIds={defaultOperationIds}
              defaultPaymentMethodIds={defaultPaymentMethodIds}
              onSubmit={handleSubmit}
              onCancel={handleCloseSheet}
              isSaving={isSaving}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
