import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';
import { cashboxPartnerOpenApi } from '@/app/api/specification/cashbox_partner/route';
import { cashboxPartnerByIdOpenApi } from '@/app/api/specification/cashbox_partner/[id]/route';
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

type JsonSchemaObject = {
  $ref?: string;
  $schema?: string;
  definitions?: Record<string, JsonSchemaObject>;
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
};

function dumpSchema(
  schema: ZodTypeAny,
  name: string,
  components: Record<string, unknown>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(schema as unknown as any, {
    name,
    target: 'jsonSchema7',
    $refStrategy: 'root',
  }) as JsonSchemaObject;

  const definitions = jsonSchema.definitions ?? {};
  const ref = typeof jsonSchema.$ref === 'string' ? jsonSchema.$ref : undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (jsonSchema as any).definitions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (jsonSchema as any).$schema;

  for (const [key, value] of Object.entries(definitions)) {
    components[key] = value;
  }

  if (ref) {
    const key = name;
    if (definitions[key]) {
      components[key] = definitions[key];
    } else {
      components[key] = jsonSchema;
    }
    return { $ref: `#/components/schemas/${key}` };
  }

  components[name] = jsonSchema;
  return { $ref: `#/components/schemas/${name}` };
}

function buildQueryParameters(schema: ZodTypeAny) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(schema as unknown as any, {
    name: 'Query',
    target: 'jsonSchema7',
    $refStrategy: 'root',
  }) as JsonSchemaObject;

  const definitions = jsonSchema.definitions ?? {};
  const base = jsonSchema.properties ?? definitions?.Query?.properties ?? {};
  const required = Array.isArray(jsonSchema.required)
    ? jsonSchema.required
    : Array.isArray(definitions?.Query?.required)
      ? definitions.Query.required
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
