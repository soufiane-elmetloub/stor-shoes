-- Preserve buyer identity at order time to avoid name/phone drift when customer profile is later edited.
ALTER TABLE "orders"
ADD COLUMN "customer_first_name" TEXT,
ADD COLUMN "customer_last_name" TEXT,
ADD COLUMN "customer_phone" TEXT,
ADD COLUMN "customer_city" TEXT,
ADD COLUMN "customer_address" TEXT;

UPDATE "orders" o
SET
  "customer_first_name" = c."first_name",
  "customer_last_name" = c."last_name",
  "customer_phone" = c."phone",
  "customer_city" = COALESCE(o."shipping_city", c."city"),
  "customer_address" = COALESCE(o."shipping_address", c."address")
FROM "customers" c
WHERE o."customer_id" = c."id";
