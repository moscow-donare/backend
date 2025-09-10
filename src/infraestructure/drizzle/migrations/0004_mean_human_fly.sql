ALTER TABLE "campaigns" ADD COLUMN "contract_address" varchar(255);
ALTER TABLE "campaigns" DROP COLUMN "blockchain_id";