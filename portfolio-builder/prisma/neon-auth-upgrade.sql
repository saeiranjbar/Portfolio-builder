-- Run on the same Neon branch/database used by Vercel.
-- Preserves existing users, portfolios, and other website data.
-- Safe to rerun if this upgrade's columns, tables, or indexes already exist.
BEGIN;

-- AlterTable
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "authVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS public."AuthChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS public."AuthRateLimit" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthChallenge_expiresAt_idx" ON public."AuthChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuthRateLimit_expiresAt_idx" ON public."AuthRateLimit"("expiresAt");

COMMIT;

-- All four results should be true after a successful upgrade.
SELECT
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'authVersion') AS "authVersionReady",
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'passwordHash') AS "passwordHashReady",
  to_regclass('public."AuthChallenge"') IS NOT NULL AS "verificationCodesReady",
  to_regclass('public."AuthRateLimit"') IS NOT NULL AS "rateLimitsReady";
