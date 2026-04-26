-- categories & products: anon SELECT
CREATE POLICY "Allow anon read categories" ON "categories" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read products" ON "products" FOR SELECT TO anon USING (true);

-- admins: authenticated SELECT
CREATE POLICY "Allow authenticated read admins" ON "admins" FOR SELECT TO authenticated USING (true);

-- orders & order_items: anon INSERT
CREATE POLICY "Allow anon insert orders" ON "orders" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert order_items" ON "order_items" FOR INSERT TO anon WITH CHECK (true);

-- orders & order_items: admins (authenticated) SELECT
CREATE POLICY "Allow admin read orders" ON "orders" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin read order_items" ON "order_items" FOR SELECT TO authenticated USING (true);
