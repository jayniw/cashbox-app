import type { ZodTypeAny } from 'zod';
import { cashboxPartnerOpenApi } from '@/app/api/specification/cashbox_partner/route';
import { cashboxPartnerByIdOpenApi } from '@/app/api/specification/cashbox_partner/[id]/route';
import { cashboxRoleOpenApi } from '@/app/api/specification/cashbox_role/route';
import { cashboxRoleByIdOpenApi } from '@/app/api/specification/cashbox_role/[id]/route';
import { cashboxTerminalOpenApi } from '@/app/api/specification/cashbox_terminal/route';
import { cashboxTerminalByIdOpenApi } from '@/app/api/specification/cashbox_terminal/[id]/route';
import { cashboxUserOpenApi } from '@/app/api/specification/cashbox_user/route';
import { cashboxUserByIdOpenApi } from '@/app/api/specification/cashbox_user/[id]/route';

type OpenApiParameter = {
  name: string;
  in: string;
  required: boolean;
  schema: Record<string, unknown>;
  description?: string;
};

type OpenApiResponseDefinition = {
  description: string;
  schema?: ZodTypeAny;
  schemaName?: string;
};

type OpenApiOperation = {
  summary: string;
  description?: string;
  querySchema?: ZodTypeAny;
  querySchemaName?: string;
  requestBodySchema?: ZodTypeAny;
  requestBodySchemaName?: string;
  responseSchema?: ZodTypeAny;
  responseSchemaName?: string;
  responses?: Record<string, OpenApiResponseDefinition>;
};

type OpenApiRoute = {
  path: string;
  tag: string;
  parameters?: OpenApiParameter[];
  operations: Record<string, OpenApiOperation>;
};

type JsonSchemaObject = Record<string, unknown> & {
  $ref?: string;
  $schema?: string;
  definitions?: Record<string, JsonSchemaObject>;
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
};

type ZodRawDef = {
  type?: string;
  innerType?: ZodTypeAny;
  schema?: ZodTypeAny;
  arg?: ZodTypeAny;
  options?: unknown[];
  element?: ZodTypeAny;
  shape?: unknown;
  value?: unknown;
  values?: unknown;
};

function getZodInnerSchema(def: unknown): ZodTypeAny | undefined {
  if (def && typeof def === 'object') {
    const raw = def as ZodRawDef;
    return (raw.innerType ??
      raw.schema ??
      raw.arg ??
      (Array.isArray(raw.options)
        ? (raw.options[0] as ZodTypeAny)
        : undefined) ??
      raw.element ??
      raw.type ??
      raw.shape ??
      undefined) as ZodTypeAny | undefined;
  }

  return undefined;
}

function convertZodSchema(schema: ZodTypeAny): JsonSchemaObject {
  const def = (schema as { _def?: unknown })._def as ZodRawDef | undefined;
  if (!def || typeof def.type !== 'string') {
    return { type: 'object', properties: {} };
  }

  switch (def.type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'bigint':
      return { type: 'integer' };
    case 'date':
      return { type: 'string', format: 'date-time' };
    case 'null':
      return { type: 'null' };
    case 'undefined':
      return { type: 'null' };
    case 'literal':
      return { const: def.value, type: typeof def.value };
    case 'array': {
      const itemType = def.element ?? getZodInnerSchema(def);
      return {
        type: 'array',
        items: itemType ? convertZodSchema(itemType) : { type: 'string' },
      };
    }
    case 'object': {
      const rawShape =
        typeof def.shape === 'function' ? def.shape() : def.shape;
      const properties: Record<string, JsonSchemaObject> = {};
      const required: string[] = [];

      if (rawShape && typeof rawShape === 'object') {
        for (const key of Object.keys(rawShape)) {
          const childSchema = rawShape[key];
          if (!childSchema || typeof childSchema !== 'object') continue;
          properties[key] = convertZodSchema(childSchema as ZodTypeAny);
          if (!childSchema.isOptional?.()) {
            required.push(key);
          }
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {}),
      };
    }
    case 'optional': {
      const innerSchema = def.innerType ?? getZodInnerSchema(def);
      return innerSchema ? convertZodSchema(innerSchema) : { type: 'string' };
    }
    case 'nullable': {
      const innerSchema = def.innerType ?? getZodInnerSchema(def);
      const inner = innerSchema
        ? convertZodSchema(innerSchema)
        : { type: 'string' };
      return {
        anyOf: [inner, { type: 'null' }],
      };
    }
    case 'default':
    case 'effects':
    case 'pipeline': {
      const innerSchema = def.innerType ?? def.schema ?? getZodInnerSchema(def);
      return innerSchema ? convertZodSchema(innerSchema) : { type: 'string' };
    }
    case 'union': {
      const options = (def.options ?? []) as ZodTypeAny[];
      return { anyOf: options.map((option) => convertZodSchema(option)) };
    }
    case 'enum':
      return { type: 'string', enum: def.values ?? def.options ?? [] };
    case 'nativeEnum':
      return { type: 'string', enum: Object.values(def.values ?? {}) };
    default:
      return { type: 'string' };
  }
}

function dumpSchema(
  schema: ZodTypeAny,
  name: string,
  components: Record<string, unknown>,
) {
  const jsonSchema = convertZodSchema(schema);
  components[name] = jsonSchema;
  return { $ref: `#/components/schemas/${name}` };
}

function buildQueryParameters(schema: ZodTypeAny) {
  const jsonSchema = convertZodSchema(schema);
  const base = jsonSchema.properties ?? {};
  const required = Array.isArray(jsonSchema.required)
    ? jsonSchema.required
    : [];

  return Object.entries(base).map(([key, schema]) => ({
    name: key,
    in: 'query',
    required: required.includes(key),
    schema,
  }));
}

function buildOperation(
  operation: OpenApiOperation,
  components: Record<string, unknown>,
  tag?: string,
) {
  const result: Record<string, unknown> = {
    summary: operation.summary,
  };

  if (tag) {
    result.tags = [tag];
  }

  if (operation.description) {
    result.description = operation.description;
  }

  if (operation.querySchema) {
    result.parameters = buildQueryParameters(operation.querySchema);
  }

  if (operation.requestBodySchema) {
    result.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: dumpSchema(
            operation.requestBodySchema,
            operation.requestBodySchemaName ?? 'RequestBody',
            components,
          ),
        },
      },
    };
  }

  const responses: Record<string, unknown> = {};

  if (operation.responseSchema) {
    responses['200'] = {
      description: 'OK',
      content: {
        'application/json': {
          schema: dumpSchema(
            operation.responseSchema,
            operation.responseSchemaName ?? 'Response200',
            components,
          ),
        },
      },
    };
  }

  if (operation.responses) {
    for (const [status, response] of Object.entries(operation.responses) as [
      string,
      OpenApiResponseDefinition,
    ][]) {
      const responseEntry: Record<string, unknown> = {
        description: response.description,
      };

      if (response.schema) {
        responseEntry.content = {
          'application/json': {
            schema: dumpSchema(
              response.schema,
              response.schemaName ?? `Response${status}`,
              components,
            ),
          },
        };
      }

      responses[status] = responseEntry;
    }
  }

  result.responses = responses;
  return result;
}

const components = {
  schemas: {} as Record<string, unknown>,
};

const routes: OpenApiRoute[] = [
  cashboxPartnerOpenApi,
  cashboxPartnerByIdOpenApi,
  cashboxRoleOpenApi,
  cashboxRoleByIdOpenApi,
  cashboxTerminalOpenApi,
  cashboxTerminalByIdOpenApi,
  cashboxUserOpenApi,
  cashboxUserByIdOpenApi,
];

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Cashbox App API',
    version: '0.1.0',
    description: 'OpenAPI documentation for the Cashbox App API.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: Object.fromEntries(
    routes.map((route) => {
      const pathObject: Record<string, unknown> = {
        ...Object.fromEntries(
          Object.entries(route.operations).map(([method, operation]) => [
            method,
            buildOperation(operation, components.schemas, route.tag),
          ]),
        ),
      };

      if (route.parameters) {
        pathObject.parameters = route.parameters;
      }

      return [route.path, pathObject];
    }),
  ),
  components,
};
