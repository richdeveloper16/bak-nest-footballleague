// Valores exclusivos de pruebas; PrismaService se sustituye en los tests e2e.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
