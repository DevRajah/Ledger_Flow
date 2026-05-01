import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Pool means PostgreSQL connection manager.
// It helps Prisma connect to your database using DATABASE_URL.
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Prisma 7 needs an adapter.
// The adapter tells Prisma how to connect to PostgreSQL.
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export default prisma;