---
name: crud-generator
description: Generate a full Next.js App Router CRUD API for a specified database table using the cashbox_partner implementation style, including Zod validation, camelCase JSON mapping, and OpenAPI metadata.
---

# CRUD Generator Skill

Este skill crea un CRUD completo para una tabla especificada siguiendo los lineamientos ya usados en la implementación de `cashbox_partner`.

## Cuándo usarlo

Usa este skill cuando necesitas generar desde cero un API REST completo dentro de `app/api/<schema>/` para una tabla nueva de la base de datos, con:

- rutas de listado y creación
- rutas por ID para leer, actualizar y eliminar
- validación de entrada con Zod
- mapeo de respuestas a camelCase
- metadata para OpenAPI/Swagger
- estilo y convenciones consistentes con `cashbox_partner`

## Compatibilidad

- Next.js App Router
- Drizzle ORM
- Zod
- `app/api/*` route handlers
- OpenAPI generation basada en metadatos exportados

## Resultado esperado

Para una tabla `foo_bar` debe generar al menos:

- `types/db/<schema>/fooBar.ts`
- `lib/crud/<schema>/foo_bar.ts`
- `app/api/<schema>/foo_bar/route.ts`
- `app/api/<schema>/foo_bar/[id]/route.ts`

Y opcionalmente:

- metadatos exportados para `lib/openapi.ts`
- validación de query params
- respuesta 404 bien manejada
- response 201 para creación
- response 204 para eliminación silenciosa

## Guía paso a paso

1. **Analiza la tabla especificada**
   - Identifica el nombre real de la tabla en la base de datos.
   - Identifica el nombre del objeto Drizzle en `lib/schema/schema.ts`.
   - Determina las columnas que deben exponerse y cuáles deben ser opcionales.

2. **Crea los tipos/Zod schemas** en `types/db/<schema>/<tableName>.ts`
   - `query` schema para filtros compatibles con camelCase y snake_case.
   - `create` schema para el body de POST.
   - `update` schema para el body de PATCH.
   - `response` schema para la forma externa camelCase.

   Ejemplo de nombres:
   - `fooBarQuerySchema`
   - `fooBarCreateSchema`
   - `fooBarUpdateSchema`
   - `fooBarResponseSchema`

3. **Extrae la lógica de negocio a un servicio**
   - Crea `lib/crud/<schema>/<table_name>.ts`.
   - Implementa funciones de negocio reutilizables:
     - `list<PascalName>`, `create<PascalName>`, `get<PascalName>ById`, `update<PascalName>`, `deactivate<PascalName>`.
   - Incluye un mapper de fila SQL a camelCase.
   - Mantén la lógica de filtro, inserción, actualización y desactivación dentro de este módulo.

4. **Crea el archivo de rutas principal**
   - `app/api/<schema>/<table_name>/route.ts`
   - Importa los servicios desde `lib/crud/<schema>/<table_name>.ts`.
   - Implementa `GET(request)` para listar registros usando el servicio.
   - Implementa `POST(request)` para crear un registro usando el servicio.
   - Convierte query params camelCase/snaked_case antes de validar.
   - Para `POST`, usa un helper compartido de parsing de JSON/Zod, por ejemplo `parseJsonRequestBody(request, schema)` desde `lib/api/parseJsonRequest.ts`, para devolver `400` en JSON inválido o en request body inválido.
   - No pongas lógica de base de datos directa en el route.
   - Retorna `201` con el nuevo registro en POST.

5. **Crea el archivo de rutas por ID**
   - `app/api/<schema>/<table_name>/[id]/route.ts`
   - Importa los servicios desde `lib/crud/<schema>/<table_name>.ts`.
   - Implementa `GET`, `PATCH`, `DELETE`.
   - En `PATCH`, valida con el schema de actualización y pasa el body al servicio.
   - Para `PATCH`, usa el helper compartido `parseJsonRequestBody(request, schema)` para manejar invalid JSON y validación Zod de forma consistente.
   - En `DELETE`, llama al servicio de desactivación y devuelve `204` o `404`.
   - Si no existe el registro, retorna `404` con `{ error: '...' }`.

6. **Usa el objeto Drizzle de `lib/schema/schema.ts` en el servicio**
   - Importa el objeto de tabla generado en `lib/crud/<schema>/<table_name>.ts`.
   - Usa `db.select().from(table)` y `db.insert(table)` / `db.update(table)` dentro del servicio.
   - Para filtros `LIKE` y `LOWER(...)`, usa `sql` si hace falta.
   - Evita poner consultas directas en los route handlers.

7. **Agrega OpenAPI metadata exportada**
   - Exporta `fooBarOpenApi` en `route.ts`.
   - Exporta `fooBarByIdOpenApi` en `[id]/route.ts`.
   - Incluye `path`, `tag`, `operations`, y `parameters` si aplica.
   - Usa `requestBodySchema`, `responseSchema`, `responseSchemaName`, `querySchema`, etc.

8. **Consistencia de nombres y rutas**
   - Usa `snake_case` para la ruta de API y el objeto Drizzle.
   - Usa `camelCase` para propiedades expuestas a la API.
   - Mantén `partner` como ejemplo de estilo: `cashboxPartnerId`, `partnerName`, etc.

9. **Pruebas básicas**
   - Verifica que `npm run build` compile.
   - Prueba la ruta `GET /api/<schema>/<table_name>`.
   - Prueba `POST` con payload válido.
   - Prueba `GET /api/<schema>/<table_name>/{id}` y `PATCH`.
   - Verifica `DELETE` retorna `204` o `404` cuando corresponde.

## Reglas de estilo

- Devuelve siempre JSON en las API routes.
- Los errores deben ser objetos `{ error: string }`.
- Las rutas `POST` deben devolver `201` para creación.
- Las rutas `DELETE` deben devolver `204` cuando son exitosas y sin cuerpo.
- Usa `NextResponse.json(...)` en lugar de `new Response(...)` salvo casos especiales.
- No expongas objetos internos o columnas no deseadas.
- Añade solo los campos realmente necesarios al mapper camelCase.

## Ejemplo mínimo de servicio y exportación OpenAPI

### Servicio

En `lib/crud/<schema>/foo_bar.ts`:

```ts
import { db } from '@/lib/db';
import { foo_barIn<schema> } from '@/lib/schema/schema';
import { eq, sql, and } from 'drizzle-orm';
import type {
  FooBarCreate,
  FooBarResponse,
  FooBarUpdate,
} from '@/types/db/<schema>/fooBar';

export function mapFooBar(row: Record<string, unknown>): FooBarResponse {
  return {
    fooBarId: row.foo_bar_id as string,
    ...
  };
}

export async function listFooBars(filters: { fooName?: string }) {
  const conditions = [];
  if (filters.fooName) {
    conditions.push(
      sql`LOWER(${foo_barIn<schema>.foo_name}) LIKE ${`%${filters.fooName.toLowerCase()}%`}`,
    );
  }
  const rows = conditions.length
    ? await db.select().from(foo_barIn<schema>).where(and(...conditions))
    : await db.select().from(foo_barIn<schema>);
  return rows.map(mapFooBar);
}
```

### Route handler

En `app/api/<schema>/foo_bar/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { listFooBars, createFooBar } from '@/lib/crud/<schema>/foo_bar';
import { fooBarQuerySchema, fooBarCreateSchema } from '@/types/db/<schema>/fooBar';

export async function GET(request: Request) {
  const queryParams = fooBarQuerySchema.parse({ ... });
  const items = await listFooBars(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = fooBarCreateSchema.parse(await request.json());
  const created = await createFooBar(body);
  return NextResponse.json(created, { status: 201 });
}
```

## Ejemplo mínimo de exportación OpenAPI

En `route.ts`:

```ts
export const fooBarOpenApi = {
  path: '/api/<schema>/foo_bar',
  tag: 'FooBar',
  operations: {
    get: {
      summary: 'List foo bar records',
      description: 'Lista registros de foo_bar con filtros opcionales.',
      querySchema: fooBarQuerySchema,
      querySchemaName: 'FooBarQuery',
      responseSchema: fooBarResponseSchema.array(),
      responseSchemaName: 'FooBarList',
    },
    post: {
      summary: 'Create a new foo bar record',
      requestBodySchema: fooBarCreateSchema,
      requestBodySchemaName: 'FooBarCreate',
      responseSchema: fooBarResponseSchema,
      responseSchemaName: 'FooBar',
    },
  },
};
```

En `[id]/route.ts`:

```ts
export const fooBarByIdOpenApi = {
  path: '/api/<schema>/foo_bar/{id}',
  tag: 'FooBar',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Foo bar record ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a foo bar by ID',
      responseSchema: fooBarResponseSchema,
      responseSchemaName: 'FooBar',
    },
    patch: {
      summary: 'Update a foo bar record',
      requestBodySchema: fooBarUpdateSchema,
      requestBodySchemaName: 'FooBarUpdate',
      responseSchema: fooBarResponseSchema,
      responseSchemaName: 'FooBar',
    },
    delete: {
      summary: 'Soft delete a foo bar record',
      responses: {
        '204': { description: 'Foo bar record deleted' },
        '404': {
          description: 'Record not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};
```

## Notas finales

- No generes la ruta de documentación aquí; es suficiente con las API routes y los exports de metadata.
- Mantén el estilo cercano al de `cashbox_partner` para facilitar futuras automatizaciones.
- Si la tabla tiene campos de auditoría (`created_at`, `updated_at`), agrégalos solo al response schema si deben exponerse.
- Si la tabla necesita validación más compleja, usa `z.preprocess` y transformación en el mapper.
