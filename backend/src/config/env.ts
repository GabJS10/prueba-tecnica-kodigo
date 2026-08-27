/**
 * Validación de variables de entorno requeridas.
 * Si falta alguna, el proceso falla de forma EXPLÍCITA al arrancar
 * (requisito del spec / CI). Nunca se asumen valores por defecto para secretos.
 */

const REQUIRED_VARS = ['DATABASE_URL'] as const;

function loadEnv() {
  const missing: string[] = [];

  for (const name of REQUIRED_VARS) {
    if (!process.env[name] || process.env[name]?.trim() === '') {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
        `Defínelas (ver .env.example) antes de arrancar la aplicación.`
    );
  }

  return {
    databaseUrl: process.env.DATABASE_URL as string,
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}

export const env = loadEnv();
