---
name: crud-generator
description: Generate a full Next.js App Router CRUD API for a specified database table using the cashbox_partner implementation style, including Zod validation, camelCase JSON mapping, and OpenAPI metadata.
---

# CRUD Generator Skill

Este skill crea un CRUD completo para una tabla especificada siguiendo los lineamientos ya usados en la implementación de `cashbox_partner`.

## Cuándo usarlo

Usa este skill cuando necesitas generar desde cero un API REST completo dentro de `app/api/specification/` para una tabla nueva de la base de datos, con:

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

- `types/db/specification/fooBar.ts`
- `app/api/specification/foo_bar/route.ts`
- `app/api/specification/foo_bar/[id]/route.ts`

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

2. **Crea los tipos/Zod schemas** en `types/db/specification/<tableName>.ts`
   - `query` schema para filtros compatibles con camelCase y snake_case.
   - `create` schema para el body de POST.
   - `update` schema para el body de PATCH.
   - `response` schema para la forma externa camelCase.

   Ejemplo de nombres:
   - `fooBarQuerySchema`
   - `fooBarCreateSchema`
   - `fooBarUpdateSchema`
   - `fooBarResponseSchema`

3. **Crea el archivo de rutas principal**
   - `app/api/specification/<table_name>/route.ts`
   - Implementa `GET(request)` para listar registros.
   - Implementa `POST(request)` para crear un registro.
   - Convierte query params camelCase/snaked_case antes de validar.
   - Mapea la fila SQL a camelCase en la respuesta.
   - Retorna `201` con el nuevo registro en POST.

4. **Crea el archivo de rutas por ID**
   - `app/api/specification/<table_name>/[id]/route.ts`
   - Implementa `GET`, `PATCH`, `DELETE`.
   - En `PATCH`, valida con el schema de actualización y aplica solo campos presentes.
   - En `DELETE`, haz un borrado suave si la tabla tiene estado, o devuelve `204` si solo se deshabilita.
   - Si no existe el registro, retorna `404` con `{ error: '...' }`.

5. **Usa el objeto Drizzle de `lib/schema/schema.ts`**
   - Importa el objeto de tabla generado.
   - Usa `db.select().from(table)` y `db.insert(table)` / `db.update(table)`.
   - Para filtros `LIKE` y `LOWER(...)`, usa `sql` si hace falta.

6. **Agrega OpenAPI metadata exportada**
   - Exporta `fooBarOpenApi` en `route.ts`.
   - Exporta `fooBarByIdOpenApi` en `[id]/route.ts`.
   - Incluye `path`, `tag`, `operations`, y `parameters` si aplica.
   - Usa `requestBodySchema`, `responseSchema`, `responseSchemaName`, `querySchema`, etc.

7. **Consistencia de nombres y rutas**
   - Usa `snake_case` para la ruta de API y el objeto Drizzle.
   - Usa `camelCase` para propiedades expuestas a la API.
   - Mantén `partner` como ejemplo de estilo: `cashboxPartnerId`, `partnerName`, etc.

8. **Pruebas básicas**
   - Verifica que `npm run build` compile.
   - Prueba la ruta `GET /api/specification/<table_name>`.
   - Prueba `POST` con payload válido.
   - Prueba `GET /api/specification/<table_name>/{id}` y `PATCH`.
   - Verifica `DELETE` retorna `204` o `404` cuando corresponde.

## Reglas de estilo

- Devuelve siempre JSON en las API routes.
- Los errores deben ser objetos `{ error: string }`.
- Las rutas `POST` deben devolver `201` para creación.
- Las rutas `DELETE` deben devolver `204` cuando son exitosas y sin cuerpo.
- Usa `NextResponse.json(...)` en lugar de `new Response(...)` salvo casos especiales.
- No expongas objetos internos o columnas no deseadas.
- Añade solo los campos realmente necesarios al mapper camelCase.

## Ejemplo mínimo de exportación OpenAPI

En `route.ts`:

```ts
export const fooBarOpenApi = {
  path: '/api/specification/foo_bar',
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
  path: '/api/specification/foo_bar/{id}',
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
