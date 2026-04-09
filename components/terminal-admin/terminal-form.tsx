'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SearchSelect,
  type SearchSelectOption,
} from '@/components/ui/search-select';
import {
  getTerminalRelations,
  type TerminalResponse,
} from '@/lib/services/terminalAdmin';
import { listPartners } from '@/lib/services/partnerAdmin';
import { listOperationsByPartner } from '@/lib/services/operationAdmin';
import { listPaymentMethods } from '@/lib/services/paymentMethodAdmin';

interface TerminalFormProps {
  terminal?: TerminalResponse | null;
  onSubmit: (payload: {
    terminal: {
      terminalName?: string;
      ipAddress?: string | null;
      geoPoint?: string | null;
      geoUrl?: string | null;
      isActive?: boolean;
    };
    partnerIds: string[];
    operationIds: string[];
    paymentMethodIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function TerminalForm({
  terminal,
  onSubmit,
  onCancel,
  isSaving,
}: TerminalFormProps) {
  const [terminalName, setTerminalName] = React.useState(
    terminal?.terminalName ?? '',
  );
  const [ipAddress, setIpAddress] = React.useState(terminal?.ipAddress ?? '');
  const [geoPoint, setGeoPoint] = React.useState(terminal?.geoPoint ?? '');
  const [geoUrl, setGeoUrl] = React.useState(terminal?.geoUrl ?? '');
  const [isActive, setIsActive] = React.useState(terminal?.isActive ?? true);
  const [selectedPartnerIds, setSelectedPartnerIds] = React.useState<string[]>(
    [],
  );
  const [selectedOperationIds, setSelectedOperationIds] = React.useState<
    string[]
  >([]);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] =
    React.useState<string[]>([]);
  const [partnerOptions, setPartnerOptions] = React.useState<
    SearchSelectOption[]
  >([]);
  const [operationGroups, setOperationGroups] = React.useState<
    Array<{
      partnerId: string;
      partnerLabel: string;
      operations: SearchSelectOption[];
    }>
  >([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = React.useState<
    SearchSelectOption[]
  >([]);
  const [operationSearch, setOperationSearch] = React.useState('');
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true);
  const [isLoadingOperations, setIsLoadingOperations] = React.useState(false);

  const safeString = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

  React.useEffect(() => {
    setTerminalName(terminal?.terminalName ?? '');
    setIpAddress(terminal?.ipAddress ?? '');
    setGeoPoint(terminal?.geoPoint ?? '');
    setGeoUrl(terminal?.geoUrl ?? '');
    setIsActive(terminal?.isActive ?? true);
  }, [terminal]);

  React.useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [partnerResult, paymentMethodResult] = await Promise.all([
          listPartners(),
          listPaymentMethods(),
        ]);

        if (!isMounted) return;
        setPartnerOptions(partnerResult);
        setPaymentMethodOptions(paymentMethodResult);
        setOperationGroups([]);

        if (terminal) {
          const relations = await getTerminalRelations(
            terminal.cashboxTerminalId,
          );
          if (!isMounted) return;
          setSelectedPartnerIds(relations.partnerIds);
          setSelectedOperationIds(relations.operationIds);
          setSelectedPaymentMethodIds(relations.paymentMethodIds);
        } else {
          setSelectedPartnerIds([]);
          setSelectedOperationIds([]);
          setSelectedPaymentMethodIds([]);
        }
      } catch (error) {
        console.error('Error loading select options:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [terminal]);

  React.useEffect(() => {
    let isMounted = true;

    const loadOperations = async () => {
      setIsLoadingOperations(true);
      try {
        const partnerLabels = Object.fromEntries(
          partnerOptions.map((item) => [item.id, item.label]),
        );

        const operationResult = await listOperationsByPartner(
          selectedPartnerIds,
          partnerLabels,
        );
        if (!isMounted) return;
        setOperationGroups(operationResult);
        setSelectedOperationIds((current) =>
          current.filter((id) =>
            operationResult.some((group) =>
              group.operations.some((option) => option.id === id),
            ),
          ),
        );
      } catch (error) {
        console.error('Error loading operations:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOperations(false);
        }
      }
    };

    loadOperations();

    return () => {
      isMounted = false;
    };
  }, [selectedPartnerIds, partnerOptions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      terminal: {
        terminalName: safeString(terminalName) || undefined,
        ipAddress: safeString(ipAddress) || null,
        geoPoint: safeString(geoPoint) || null,
        geoUrl: safeString(geoUrl) || null,
        isActive,
      },
      partnerIds: selectedPartnerIds,
      operationIds: selectedOperationIds,
      paymentMethodIds: selectedPaymentMethodIds,
    });
  };

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="terminalName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de terminal
          </label>
          <Input
            id="terminalName"
            value={terminalName ?? ''}
            onChange={(event) => setTerminalName(event.target.value)}
            placeholder="Nombre del terminal"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="ipAddress"
            className="block text-sm font-medium text-foreground"
          >
            Dirección IP
          </label>
          <Input
            id="ipAddress"
            value={ipAddress ?? ''}
            onChange={(event) => setIpAddress(event.target.value)}
            placeholder="192.168.0.1"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="geoPoint"
            className="block text-sm font-medium text-foreground"
          >
            Geo point
          </label>
          <Input
            id="geoPoint"
            value={geoPoint ?? ''}
            onChange={(event) => setGeoPoint(event.target.value)}
            placeholder="lat,lon"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="geoUrl"
            className="block text-sm font-medium text-foreground"
          >
            Geo URL
          </label>
          <Input
            id="geoUrl"
            value={geoUrl ?? ''}
            onChange={(event) => setGeoUrl(event.target.value)}
            placeholder="https://maps.example.com/..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <label
          htmlFor="isActive"
          className="text-sm text-foreground"
        >
          Terminal activo
        </label>
      </div>

      <Separator />

      <div className="space-y-4">
        {isLoadingOptions ? (
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Cargando opciones de partners, operaciones y métodos de pago...
          </div>
        ) : (
          <>
            <SearchSelect
              label="Partners"
              options={partnerOptions}
              selectedValues={selectedPartnerIds}
              onChange={setSelectedPartnerIds}
              placeholder="Buscar partner..."
              description="Selecciona los partners asociados al terminal."
            />
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Operations
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona las operaciones por partner.
                  </p>
                </div>
                <Input
                  value={operationSearch}
                  onChange={(event) => setOperationSearch(event.target.value)}
                  placeholder="Buscar operación..."
                  className="max-w-sm"
                />
              </div>

              {isLoadingOperations ? (
                <div className="mt-4 text-sm text-muted-foreground">
                  Cargando operaciones...
                </div>
              ) : selectedPartnerIds.length === 0 ? (
                <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                  Selecciona primero uno o más partners para ver sus
                  operaciones.
                </div>
              ) : operationGroups.length === 0 ? (
                <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                  No se encontraron operaciones para los partners seleccionados.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {operationGroups.map((group) => {
                    const filteredOperations = group.operations.filter(
                      (option) =>
                        option.label
                          .toLowerCase()
                          .includes(operationSearch.toLowerCase()),
                    );

                    return (
                      <div
                        key={group.partnerId}
                        className="rounded-lg border border-border bg-muted p-3"
                      >
                        <div className="mb-2 text-sm font-semibold text-foreground">
                          {group.partnerLabel}
                        </div>
                        {filteredOperations.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            No hay operaciones que coincidan.
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {filteredOperations.map((option) => {
                              const selected = selectedOperationIds.includes(
                                option.id,
                              );
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedOperationIds((current) =>
                                      current.includes(option.id)
                                        ? current.filter(
                                            (id) => id !== option.id,
                                          )
                                        : [...current, option.id],
                                    );
                                  }}
                                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                                    selected
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border bg-background text-foreground hover:border-primary/80 hover:bg-primary/5'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <SearchSelect
              label="Payment methods"
              options={paymentMethodOptions}
              selectedValues={selectedPaymentMethodIds}
              onChange={setSelectedPaymentMethodIds}
              placeholder="Buscar método de pago..."
              description="Selecciona los métodos de pago permitidos para el terminal."
            />
          </>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : terminal ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
