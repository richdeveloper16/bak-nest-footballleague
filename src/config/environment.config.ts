/** Valida la configuración al arrancar sin incluir secretos en los errores. */
export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = config.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error('DATABASE_URL es obligatoria');
  }

  try {
    const url = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) {
      throw new Error('invalid URL');
    }
  } catch {
    throw new Error('DATABASE_URL debe ser una URL válida de PostgreSQL');
  }

  const rawPort = config.PORT ?? 3000;
  const port = Number(rawPort);
  if (
    !['string', 'number'].includes(typeof rawPort) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('PORT debe ser un entero entre 1 y 65535');
  }

  const nodeEnv = config.NODE_ENV ?? 'development';
  if (
    typeof nodeEnv !== 'string' ||
    !['development', 'test', 'production'].includes(nodeEnv)
  ) {
    throw new Error('NODE_ENV debe ser development, test o production');
  }

  return {
    ...config,
    DATABASE_URL: databaseUrl,
    PORT: port,
    NODE_ENV: nodeEnv,
  };
}
