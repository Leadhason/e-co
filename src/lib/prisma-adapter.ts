import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Required for Neon serverless in non-edge environments
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
export const prismaAdapter = new PrismaNeon(pool)
