-- CreateTable
CREATE TABLE "utm_tracking" (
    "id" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utm_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "page" TEXT NOT NULL DEFAULT '/',
    "product_id" TEXT,
    "session_id" TEXT,
    "uTMTrackingId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "order_id" TEXT NOT NULL,
    "utm_source" TEXT,
    "value" DECIMAL(10,2) NOT NULL,
    "uTMTrackingId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "utm_tracking_created_at_idx" ON "utm_tracking"("created_at");

-- CreateIndex
CREATE INDEX "utm_tracking_utm_source_idx" ON "utm_tracking"("utm_source");

-- CreateIndex
CREATE INDEX "visits_created_at_idx" ON "visits"("created_at");

-- CreateIndex
CREATE INDEX "visits_utm_source_idx" ON "visits"("utm_source");

-- CreateIndex
CREATE INDEX "visits_product_id_idx" ON "visits"("product_id");

-- CreateIndex
CREATE INDEX "conversions_created_at_idx" ON "conversions"("created_at");

-- CreateIndex
CREATE INDEX "conversions_utm_source_idx" ON "conversions"("utm_source");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_uTMTrackingId_fkey" FOREIGN KEY ("uTMTrackingId") REFERENCES "utm_tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_uTMTrackingId_fkey" FOREIGN KEY ("uTMTrackingId") REFERENCES "utm_tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
