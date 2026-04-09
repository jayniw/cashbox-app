'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, CheckIcon, XIcon, ExternalLinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  listPartnerRecords,
  type CashboxPartnerResponse,
} from '@/lib/services/partnerAdmin';

interface PartnerTableProps {
  onEdit: (partner: CashboxPartnerResponse) => void;
  onRequestDeactivate: (partner: CashboxPartnerResponse) => void;
  onRequestActivate: (partner: CashboxPartnerResponse) => void;
  refreshKey?: number;
}

export function PartnerTable({
  onEdit,
  onRequestDeactivate,
  onRequestActivate,
  refreshKey,
}: PartnerTableProps) {
  const [partners, setPartners] = React.useState<CashboxPartnerResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPartners = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const partnerResult = await listPartnerRecords();
      setPartners(partnerResult);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Error al cargar los partners.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPartners();
  }, [loadPartners, refreshKey]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Logo</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Última actualización</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                Cargando partners...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-destructive"
              >
                {error}
              </td>
            </tr>
          ) : partners.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No se encontraron partners.
              </td>
            </tr>
          ) : (
            partners.map((partner) => (
              <tr
                key={partner.cashboxPartnerId}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-4">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.partnerName ?? 'Logo del partner'}
                      className="h-10 w-10 rounded-md object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" fill="%2375757b" font-family="Arial,sans-serif" font-size="8" text-anchor="middle" dominant-baseline="central"%3Elogo%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-xs text-muted-foreground">
                      sin
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {partner.partnerName ?? 'Sin nombre'}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  {partner.url ? (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                      aria-label="Abrir URL del partner"
                    >
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-foreground">
                  {partner.partnerStatus ?? 'Unknown'}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(partner.tranDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(partner)}
                      aria-label="Editar partner"
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    {partner.partnerStatus === 'Active' ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRequestDeactivate(partner)}
                        aria-label="Inactivar partner"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => onRequestActivate(partner)}
                        aria-label="Activar partner"
                      >
                        <CheckIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Separator />
    </div>
  );
}
