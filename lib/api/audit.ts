export function getRequestUserId(request: Request): string {
  const authHeader = request.headers.get('authorization') ?? '';
  const bearer = authHeader.trim().startsWith('Bearer ')
    ? authHeader.trim().slice(7).trim()
    : '';

  const osUser = process.env.USERNAME ?? process.env.USER ?? 'system';

  if (!bearer) {
    return osUser;
  }

  const parts = bearer.split('.');
  if (parts.length !== 3) {
    return osUser;
  }

  try {
    const payloadPart = parts[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    const candidate =
      typeof payload.sub === 'string' && payload.sub
        ? payload.sub
        : typeof payload.userId === 'string' && payload.userId
          ? payload.userId
          : typeof payload.user_id === 'string' && payload.user_id
            ? payload.user_id
            : typeof payload.preferred_username === 'string' &&
                payload.preferred_username
              ? payload.preferred_username
              : typeof payload.email === 'string' && payload.email
                ? payload.email
                : undefined;

    if (candidate) {
      return candidate;
    }
  } catch {
    // ignore invalid token payload
  }

  return osUser;
}
