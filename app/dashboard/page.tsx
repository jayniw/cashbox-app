'use client';

import * as React from 'react';
import {
  SearchSelect,
  SearchSelectOption,
} from '@/components/ui/search-select';
import { listPartners } from '@/lib/services/partnerAdmin';

export default function Page() {
  const [partnerOptions, setPartnerOptions] = React.useState<
    SearchSelectOption[]
  >([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = React.useState<string[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadPartners() {
      setLoading(true);
      try {
        const partnerResult = await listPartners();
        console.log('🚀 ~ loadPartners ~ partnerResult:', partnerResult);
        if (!mounted) return;

        setPartnerOptions(
          partnerResult.map((partner) => ({
            id: partner.id,
            label: partner.label,
          })),
        );
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPartners();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bienvenido al área de administración. Selecciona una opción en el
          menú.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">
          Prueba de partners
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta sección carga la lista de partners desde la API y permite buscar
          entre ellos.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Cargando partners...
          </p>
        ) : error ? (
          <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Error cargando partners: {error}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <SearchSelect
              label="Partners"
              options={partnerOptions}
              selectedValues={selectedPartnerIds}
              onChange={setSelectedPartnerIds}
              placeholder="Buscar partner..."
              description="Selecciona partners para validar búsqueda y lista cargada desde DB."
            />

            <div className="rounded-lg border border-border bg-muted p-4 text-sm">
              <p className="font-medium">Partners cargados</p>
              <p className="mt-1 text-muted-foreground">
                {partnerOptions.length} partners disponibles.
              </p>
              {partnerOptions.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No se encontraron partners.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {partnerOptions.slice(0, 10).map((option) => (
                    <li
                      key={option.id}
                      className="rounded-md bg-background px-3 py-2"
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
