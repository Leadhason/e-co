import 'server-only';
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * DEFENSIVE PRISMA INITIALIZATION
 * 1. 'server-only' import ensures this file NEVER enters the client-side bundle.
 * 2. Uses a hybrid strategy: Standard Node.js client for local dev stability, 
 *    Neon Adapter for Edge/Serverless runtimes.
 */
export const prisma =
  globalForPrisma.prisma ??
  (function () {
    const url = process.env.DATABASE_URL;

    if (!url) {
      // During build time or specific edge cases, env might be empty.
      // We return a standard client here and let it fail at runtime if needed,
      // but we avoid creating a broken Pool.
      return new PrismaClient();
    }

    const useAdapter = process.env.NEXT_RUNTIME === 'edge';

    if (useAdapter) {
      if (typeof window === 'undefined') {
        neonConfig.webSocketConstructor = ws;
      }
      const pool = new Pool({ connectionString: url.trim() });
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter });
    }

    return new PrismaClient();
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma