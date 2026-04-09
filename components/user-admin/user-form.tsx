'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SearchSelect,
  type SearchSelectOption,
} from '@/components/ui/search-select';
import { listRoles } from '@/lib/services/roleAdmin';
import { listTerminals } from '@/lib/services/terminalAdmin';
import {
  getUserRelations,
  type CashboxUserResponse,
} from '@/lib/services/userAdmin';

interface UserFormProps {
  user?: CashboxUserResponse | null;
  onSubmit: (payload: {
    user: {
      userName: string;
      authenticationType?: string;
      userStatus?: string;
      userEmail?: string | null;
      userPhone?: string | null;
    };
    roleIds: string[];
    terminalIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const USER_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Suspended', label: 'Suspended' },
];

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isSaving,
}: UserFormProps) {
  const [userName, setUserName] = React.useState(user?.userName ?? '');
  const [authenticationType, setAuthenticationType] = React.useState(
    user?.authenticationType ?? '',
  );
  const [userStatus, setUserStatus] = React.useState(
    user?.userStatus ?? 'Active',
  );
  const [userEmail, setUserEmail] = React.useState(user?.userEmail ?? '');
  const [userPhone, setUserPhone] = React.useState(user?.userPhone ?? '');
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [selectedTerminalIds, setSelectedTerminalIds] = React.useState<
    string[]
  >([]);
  const [roleOptions, setRoleOptions] = React.useState<SearchSelectOption[]>(
    [],
  );
  const [terminalOptions, setTerminalOptions] = React.useState<
    SearchSelectOption[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(true);

  React.useEffect(() => {
    setUserName(user?.userName ?? '');
    setAuthenticationType(user?.authenticationType ?? '');
    setUserStatus(user?.userStatus ?? 'Active');
    setUserEmail(user?.userEmail ?? '');
    setUserPhone(user?.userPhone ?? '');
  }, [user]);

  React.useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [roles, terminals] = await Promise.all([
          listRoles(),
          listTerminals(),
        ]);

        if (!isMounted) return;
        setRoleOptions(
          roles.map((role) => ({
            id: role.cashboxRoleId,
            label: role.roleName ?? role.cashboxRoleId,
          })),
        );
        setTerminalOptions(
          terminals.map((terminal) => ({
            id: terminal.cashboxTerminalId,
            label: terminal.terminalName ?? terminal.cashboxTerminalId,
          })),
        );

        if (user) {
          const relations = await getUserRelations(user.cashboxUserId);
          if (!isMounted) return;
          setSelectedRoleIds(relations.roleIds);
          setSelectedTerminalIds(relations.terminalIds);
        } else {
          setSelectedRoleIds([]);
          setSelectedTerminalIds([]);
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
  }, [user]);

  const safeString = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      user: {
        userName: safeString(userName),
        authenticationType: safeString(authenticationType) || undefined,
        userStatus,
        userEmail: safeString(userEmail) || null,
        userPhone: safeString(userPhone) || null,
      },
      roleIds: selectedRoleIds,
      terminalIds: selectedTerminalIds,
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
            htmlFor="userName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de usuario
          </label>
          <Input
            id="userName"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Nombre completo"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="authenticationType"
            className="block text-sm font-medium text-foreground"
          >
            Tipo de autenticación
          </label>
          <Input
            id="authenticationType"
            value={authenticationType}
            onChange={(event) => setAuthenticationType(event.target.value)}
            placeholder="Ej. password, oauth"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="userEmail"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="userEmail"
            value={userEmail ?? ''}
            onChange={(event) => setUserEmail(event.target.value)}
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="userPhone"
            className="block text-sm font-medium text-foreground"
          >
            Teléfono
          </label>
          <Input
            id="userPhone"
            value={userPhone ?? ''}
            onChange={(event) => setUserPhone(event.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="userStatus"
            className="block text-sm font-medium text-foreground"
          >
            Estado
          </label>
          <select
            id="userStatus"
            value={userStatus}
            onChange={(event) => setUserStatus(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {USER_STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {isLoadingOptions ? (
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Cargando opciones de roles y terminales...
          </div>
        ) : (
          <>
            <SearchSelect
              label="Roles"
              options={roleOptions}
              selectedValues={selectedRoleIds}
              onChange={setSelectedRoleIds}
              placeholder="Buscar roles..."
              description="Selecciona los roles que debe tener el usuario."
            />
            <SearchSelect
              label="Terminales"
              options={terminalOptions}
              selectedValues={selectedTerminalIds}
              onChange={setSelectedTerminalIds}
              placeholder="Buscar terminales..."
              description="Selecciona los terminales vinculados al usuario."
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
          {isSaving ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
