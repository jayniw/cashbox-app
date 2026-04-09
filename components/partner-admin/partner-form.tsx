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
  getPartnerRelations,
  type CashboxPartnerResponse,
} from '@/lib/services/partnerAdmin';
import { listPaymentMethods } from '@/lib/services/paymentMethodAdmin';

interface PartnerFormProps {
  partner?: CashboxPartnerResponse | null;
  onSubmit: (payload: {
    partner: {
      partnerName?: string;
      partnerStatus?: string;
      url?: string;
      logo?: string;
    };
    paymentMethodIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function PartnerForm({
  partner,
  onSubmit,
  onCancel,
  isSaving,
}: PartnerFormProps) {
  const [partnerName, setPartnerName] = React.useState(
    partner?.partnerName ?? '',
  );
  const [partnerStatus, setPartnerStatus] = React.useState(
    partner?.partnerStatus ?? 'Active',
  );
  const [url, setUrl] = React.useState(partner?.url ?? '');
  const [logo, setLogo] = React.useState(partner?.logo ?? '');
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] =
    React.useState<string[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = React.useState<
    SearchSelectOption[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true);

  const safeString = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

  React.useEffect(() => {
    setPartnerName(partner?.partnerName ?? '');
    setPartnerStatus(partner?.partnerStatus ?? 'Active');
    setUrl(partner?.url ?? '');
    setLogo(partner?.logo ?? '');
  }, [partner]);

  React.useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const paymentMethodResult = await listPaymentMethods();
        if (!isMounted) return;
        setPaymentMethodOptions(paymentMethodResult);

        if (partner) {
          const relations = await getPartnerRelations(partner.cashboxPartnerId);
          if (!isMounted) return;
          setSelectedPaymentMethodIds(relations.paymentMethodIds);
        } else {
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
  }, [partner]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      partner: {
        partnerName: safeString(partnerName) || undefined,
        partnerStatus: safeString(partnerStatus) || undefined,
        url: safeString(url) || undefined,
        logo: safeString(logo) || undefined,
      },
      paymentMethodIds: selectedPaymentMethodIds,
    });
  };

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="partnerName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre del partner
          </label>
          <Input
            id="partnerName"
            value={partnerName ?? ''}
            onChange={(event) => setPartnerName(event.target.value)}
            placeholder="Nombre del partner"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="partnerUrl"
            className="block text-sm font-medium text-foreground"
          >
            URL del partner
          </label>
          <Input
            id="partnerUrl"
            type="url"
            value={url ?? ''}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://partner.example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="partnerLogo"
            className="block text-sm font-medium text-foreground"
          >
            URL del logo
          </label>
          <Input
            id="partnerLogo"
            type="url"
            value={logo ?? ''}
            onChange={(event) => setLogo(event.target.value)}
            placeholder="https://.../logo.png"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="partnerStatus"
            className="block text-sm font-medium text-foreground"
          >
            Estado del partner
          </label>
          <select
            id="partnerStatus"
            value={partnerStatus}
            onChange={(event) => setPartnerStatus(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <Separator />

      {isLoadingOptions ? (
        <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          Cargando métodos de pago...
        </div>
      ) : (
        <SearchSelect
          label="Payment methods"
          options={paymentMethodOptions}
          selectedValues={selectedPaymentMethodIds}
          onChange={setSelectedPaymentMethodIds}
          placeholder="Buscar método de pago..."
          description="Selecciona los métodos de pago válidos para este partner."
        />
      )}

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
          {isSaving ? 'Guardando...' : partner ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
