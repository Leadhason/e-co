-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN "paystackPublicKey" TEXT, ADD COLUMN "paystackSecretKey" TEXT, ADD COLUMN "testMode" BOOLEAN NOT NULL DEFAULT false;
