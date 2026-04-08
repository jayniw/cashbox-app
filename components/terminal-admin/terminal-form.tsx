'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SearchSelect,
  type SearchSelectOption,
} from '@/components/ui/search-select';
import type { TerminalResponse } from '@/lib/services/terminalAdmin';

interface TerminalFormProps {
  terminal?: TerminalResponse | null;
  partnerOptions: SearchSelectOption[];
  operationOptions: SearchSelectOption[];
  paymentMethodOptions: SearchSelectOption[];
  defaultPartnerIds: string[];
  defaultOperationIds: string[];
  defaultPaymentMethodIds: string[];
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
  partnerOptions,
  operationOptions,
  paymentMethodOptions,
  defaultPartnerIds,
  defaultOperationIds,
  defaultPaymentMethodIds,
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
  const [selectedPartnerIds, setSelectedPartnerIds] =
    React.useState<string[]>(defaultPartnerIds);
  const [selectedOperationIds, setSelectedOperationIds] =
    React.useState<string[]>(defaultOperationIds);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] =
    React.useState<string[]>(defaultPaymentMethodIds);

  React.useEffect(() => {
    setTerminalName(terminal?.terminalName ?? '');
    setIpAddress(terminal?.ipAddress ?? '');
    setGeoPoint(terminal?.geoPoint ?? '');
    setGeoUrl(terminal?.geoUrl ?? '');
    setIsActive(terminal?.isActive ?? true);
  }, [terminal]);

  React.useEffect(() => {
    setSelectedPartnerIds(defaultPartnerIds);
  }, [defaultPartnerIds]);

  React.useEffect(() => {
    setSelectedOperationIds(defaultOperationIds);
  }, [defaultOperationIds]);

  React.useEffect(() => {
    setSelectedPaymentMethodIds(defaultPaymentMethodIds);
  }, [defaultPaymentMethodIds]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      terminal: {
        terminalName: terminalName.trim() || undefined,
        ipAddress: ipAddress.trim() || null,
        geoPoint: geoPoint.trim() || null,
        geoUrl: geoUrl.trim() || null,
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
        <SearchSelect
          label="Partners"
          options={partnerOptions}
          selectedValues={selectedPartnerIds}
          onChange={setSelectedPartnerIds}
          placeholder="Buscar partner..."
          description="Selecciona los partners asociados al terminal."
        />
        <SearchSelect
          label="Operations"
          options={operationOptions}
          selectedValues={selectedOperationIds}
          onChange={setSelectedOperationIds}
          placeholder="Buscar operación..."
          description="Selecciona las operaciones que puede usar el terminal."
        />
        <SearchSelect
          label="Payment methods"
          options={paymentMethodOptions}
          selectedValues={selectedPaymentMethodIds}
          onChange={setSelectedPaymentMethodIds}
          placeholder="Buscar método de pago..."
          description="Selecciona los métodos de pago permitidos para el terminal."
        />
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
