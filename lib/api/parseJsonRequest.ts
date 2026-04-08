import { NextResponse } from 'next/server';
import { z } from 'zod';

type ParseJsonRequestBodySuccess<T> = {
  value: T;
  errorResponse?: undefined;
};

type ParseJsonRequestBodyFailure = {
  value?: undefined;
  errorResponse: NextResponse;
};

export async function parseJsonRequestBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseJsonRequestBodySuccess<T> | ParseJsonRequestBodyFailure> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return {
      errorResponse: NextResponse.json(
        {
          error: 'Invalid JSON payload',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 },
      ),
    };
  }

  try {
    return { value: schema.parse(payload) };
  } catch (error) {
    return {
      errorResponse: NextResponse.json(
        {
          error: 'Invalid request body',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 },
      ),
    };
  }
}
