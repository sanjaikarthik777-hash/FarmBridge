-- =============================================================================
-- FarmBridge Demo & Seed Data: Pollachi Pilot, Tamil Nadu
-- All data clearly identified as pilot demonstration data
-- =============================================================================

-- CATEGORIES
INSERT INTO public.categories (id, name, name_ta, description, icon) VALUES
('c1111111-1111-1111-1111-111111111111', 'Fresh Vegetables', 'காய்கறிகள்', 'Farm-fresh native & highland vegetables', 'carrot'),
('c2222222-2222-2222-2222-222222222222', 'Fresh Fruits', 'பழங்கள்', 'Locally harvested tropical and hill fruits', 'apple'),
('c3333333-3333-3333-3333-333333333333', 'Coconut & Plantation', 'தென்னை & தோட்டம்', 'World-famous Pollachi coconuts, tender water & copra', 'palmtree'),
('c4444444-4444-4444-4444-444444444444', 'Herbs & Greens', 'கீரைகள் & மூலிகைகள்', 'Fresh daily greens harvested at dawn', 'leaf'),
('c5555555-5555-5555-5555-555555555555', 'Cold-Pressed Oils & Essentials', 'மரச்செக்கு எண்ணெய்கள்', 'Traditional wood-pressed natural oils & spices', 'droplets')
ON CONFLICT (id) DO NOTHING;

-- PROFILES
INSERT INTO public.profiles (id, role, display_name, phone, email, preferred_language, verification_status) VALUES
('f1000000-0000-0000-0000-000000000001', 'farmer', 'Murugan Palanisamy (முருகன்)', '+91 94432 XXXXX', 'murugan.pollachi@demo.farmbridge.in', 'ta', 'verified'),
('f2000000-0000-0000-0000-000000000002', 'farmer', 'Lakshmi Ramasamy (லட்சுமி)', '+91 98421 XXXXX', 'lakshmi.anaimalai@demo.farmbridge.in', 'en', 'verified'),
('b1000000-0000-0000-0000-000000000001', 'consumer', 'Kavitha Sundaram (கவிதா)', '+91 97890 XXXXX', 'kavitha.consumer@demo.farmbridge.in', 'en', 'verified'),
('b2000000-0000-0000-0000-000000000002', 'business', 'Anand Kumar (Annapoorna Kitchen)', '+91 98940 XXXXX', 'procurement@annapoornademo.in', 'en', 'verified'),
('d1000000-0000-0000-0000-000000000001', 'delivery', 'Senthil Velan (செந்தில்)', '+91 96550 XXXXX', 'senthil.delivery@demo.farmbridge.in', 'ta', 'verified'),
('a1000000-0000-0000-0000-000000000001', 'admin', 'Selvam Arumugam (System Ops)', '+91 94860 XXXXX', 'admin@farmbridge.in', 'en', 'verified')
ON CONFLICT (id) DO NOTHING;

-- FARMS
INSERT INTO public.farms (id, owner_id, farm_name, description, region, district, pincode, approx_latitude, approx_longitude, pickup_instructions) VALUES
('fa111111-1111-1111-1111-111111111111', 'f1000000-0000-0000-0000-000000000001', 'Thennam Thoppu Natural Farm', '4th generation regenerative coconut & native vegetable grove near Aliyar foot-hills.', 'Aliyar Road, Pollachi', 'Coimbatore', '642101', 10.598200, 76.972100, 'Farm gate 2, next to the cooperative milk society on Aliyar main road.'),
('fa222222-2222-2222-2222-222222222222', 'f2000000-0000-0000-0000-000000000002', 'Anaimalai Organic Valley', 'Pesticide-free highland vegetable and native fruit farm enjoying fresh mountain water.', 'Anaimalai Hills, Pollachi', 'Coimbatore', '642104', 10.581000, 76.932000, 'Near Vettaikaranpudur junction, collect from farm packing shelter.')
ON CONFLICT (id) DO NOTHING;

-- PRODUCTS
INSERT INTO public.products (id, farmer_id, farm_id, category_id, name, name_ta, description, image_paths, price, unit, available_quantity, minimum_order_quantity, maximum_order_quantity, availability_date, harvest_date, fulfilment_options, status) VALUES
('p1111111-1111-1111-1111-111111111111', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Country Tomatoes (நாட்டு தக்காளி)', 'நாட்டு தக்காளி', 'Freshly plucked vine-ripened country tomatoes with balanced tanginess and aroma.', ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'], 32.00, 'kg', 85.00, 1.00, 20.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p2222222-2222-2222-2222-222222222222', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Pollachi Sweet Tender Coconut (இளநீர்)', 'பொள்ளாச்சி இளநீர்', 'Famous Pollachi sweet coconut harvested fresh with over 450ml electrolyte water.', ARRAY['https://images.unsplash.com/photo-1526344966-89049886b28d?w=600&auto=format&fit=crop'], 45.00, 'piece', 120.00, 2.00, 50.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p3333333-3333-3333-3333-333333333333', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Small Red Shallots (சின்ன வெங்காயம்)', 'சாம்பார் சின்ன வெங்காயம்', 'Pungent, authentic Sambar onions cured naturally in farm sheds.', ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'], 55.00, 'kg', 60.00, 0.50, 15.00, CURRENT_DATE, CURRENT_DATE - INTERVAL '2 days', ARRAY['pickup', 'delivery'], 'active'),

('p4444444-4444-4444-4444-444444444444', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Anaimalai Red Bananas (செவ்வாழை)', 'ஆனைமலை செவ்வாழை', 'Rich mountain-grown red bananas with high potassium and sweet aroma.', ARRAY['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&auto=format&fit=crop'], 68.00, 'kg', 40.00, 1.00, 10.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p5555555-5555-5555-5555-555555555555', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c5555555-5555-5555-5555-555555555555', 'Wood-Pressed Virgin Coconut Oil (மரச்செக்கு தேங்காய் எண்ணெய்)', 'மரச்செக்கு தேங்காய் எண்ணெய்', 'Unrefined, sun-dried sulphur-free copra cold pressed in traditional vaagai wood mill.', ARRAY['https://images.unsplash.com/photo-1611078772023-e18e1dddbce9?w=600&auto=format&fit=crop'], 310.00, 'litre', 25.00, 0.50, 5.00, CURRENT_DATE, CURRENT_DATE - INTERVAL '5 days', ARRAY['pickup', 'delivery'], 'active'),

('p6666666-6666-6666-6666-666666666666', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Fresh Drumsticks (முருங்கைக்காய்)', 'முருங்கைக்காய்', 'Long, tender and fleshy drumsticks harvested straight from the tree.', ARRAY['https://images.unsplash.com/photo-1662993883161-26c1f2495dc8?w=600&auto=format&fit=crop'], 45.00, 'kg', 30.00, 1.00, 10.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p7777777-7777-7777-7777-777777777777', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'Fresh Curry Leaves (கறிவேப்பிலை)', 'கறிவேப்பிலை', 'Highly aromatic organic curry leaves, hand-picked and chemical free.', ARRAY['https://images.unsplash.com/photo-1605333396884-6338b1d9dfd7?w=600&auto=format&fit=crop'], 15.00, 'bunch', 100.00, 1.00, 20.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p8888888-8888-8888-8888-888888888888', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Imam Pasand Mangoes (இமாம் பசந்த் மாம்பழம்)', 'இமாம் பசந்த்', 'The king of mangoes from Anaimalai hills, rich, sweet, and fibreless.', ARRAY['https://images.unsplash.com/photo-1553279768-865429fd81ce?w=600&auto=format&fit=crop'], 120.00, 'kg', 50.00, 1.00, 5.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p9999999-9999-9999-9999-999999999999', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'Organic Papaya (பப்பாளி)', 'பப்பாளி', 'Naturally ripened, sweet and soft papayas with no carbide treatment.', ARRAY['https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop'], 30.00, 'kg', 40.00, 1.00, 15.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p1010101-1010-1010-1010-101010101010', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Fresh Bitter Gourd (பாகற்காய்)', 'பாகற்காய்', 'Organic bitter gourds naturally grown in Anaimalai hills.', ARRAY['https://images.unsplash.com/photo-1595856454796-b09e2da0eb8b?w=600&auto=format&fit=crop'], 40.00, 'kg', 20.00, 0.50, 5.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p1212121-1212-1212-1212-121212121212', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Native Green Chillies (பச்சை மிளகாய்)', 'பச்சை மிளகாய்', 'Spicy native variety green chillies freshly harvested.', ARRAY['https://images.unsplash.com/photo-1587049352847-4d4b1df7a5e9?w=600&auto=format&fit=crop'], 60.00, 'kg', 15.00, 0.25, 2.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p1313131-1313-1313-1313-131313131313', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'Fresh Mint Leaves (புதினா)', 'புதினா', 'Aromatic fresh mint leaves harvested daily from our herbal patch.', ARRAY['https://images.unsplash.com/photo-1518133503203-34e402341490?w=600&auto=format&fit=crop'], 10.00, 'bunch', 50.00, 1.00, 10.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active'),

('p1414141-1414-1414-1414-141414141414', 'f2000000-0000-0000-0000-000000000002', 'fa222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'Fresh Coriander (கொத்தமல்லி)', 'கொத்தமல்லி', 'Fresh native coriander with roots intact for longer shelf life.', ARRAY['https://images.unsplash.com/photo-1596645607379-3fb72da89f55?w=600&auto=format&fit=crop'], 12.00, 'bunch', 80.00, 1.00, 10.00, CURRENT_DATE, CURRENT_DATE, ARRAY['pickup', 'delivery'], 'active')
ON CONFLICT (id) DO NOTHING;

-- PRICE REFERENCES (Mandi & Uzhavar Sandhai Benchmark Data)
INSERT INTO public.price_references (crop_name, crop_name_ta, market_name, region, unit, min_price, modal_price, max_price, source_name) VALUES
('Tomato', 'தக்காளி', 'Pollachi Uzhavar Sandhai', 'Tamil Nadu', 'kg', 28.00, 34.00, 38.00, 'Govt Uzhavar Sandhai Daily Bulletin'),
('Tender Coconut', 'இளநீர்', 'Pollachi Regulated Market', 'Tamil Nadu', 'piece', 38.00, 44.00, 50.00, 'Pollachi Coconut Producers Co-op'),
('Small Onion (Shallot)', 'சின்ன வெங்காயம்', 'Coimbatore APMC Mandi', 'Tamil Nadu', 'kg', 48.00, 56.00, 65.00, 'Tamil Nadu Agri Marketing Board'),
('Red Banana', 'செவ்வாழை', 'Pollachi Gandhi Market', 'Tamil Nadu', 'kg', 60.00, 70.00, 78.00, 'Local Market Price Observation'),
('Coconut Oil', 'தேங்காய் எண்ணெய்', 'Kangeyam Coconut Oil Exchange', 'Tamil Nadu', 'litre', 290.00, 315.00, 340.00, 'State Oil Millers Benchmark'),
('Drumstick', 'முருங்கைக்காய்', 'Pollachi Uzhavar Sandhai', 'Tamil Nadu', 'kg', 35.00, 42.00, 50.00, 'Govt Uzhavar Sandhai Daily Bulletin'),
('Curry Leaves', 'கறிவேப்பிலை', 'Coimbatore APMC Mandi', 'Tamil Nadu', 'bunch', 10.00, 12.00, 18.00, 'Tamil Nadu Agri Marketing Board'),
('Mango', 'மாம்பழம்', 'Pollachi Gandhi Market', 'Tamil Nadu', 'kg', 90.00, 110.00, 130.00, 'Local Market Price Observation'),
('Papaya', 'பப்பாளி', 'Pollachi Uzhavar Sandhai', 'Tamil Nadu', 'kg', 22.00, 26.00, 32.00, 'Govt Uzhavar Sandhai Daily Bulletin'),
('Bitter Gourd', 'பாகற்காய்', 'Pollachi Regulated Market', 'Tamil Nadu', 'kg', 35.00, 40.00, 48.00, 'Market Bulletin'),
('Green Chilli', 'பச்சை மிளகாய்', 'Coimbatore APMC Mandi', 'Tamil Nadu', 'kg', 50.00, 58.00, 65.00, 'Market Benchmark'),
('Mint Leaves', 'புதினா', 'Pollachi Uzhavar Sandhai', 'Tamil Nadu', 'bunch', 8.00, 10.00, 15.00, 'Daily Bulletin'),
('Coriander', 'கொத்தமல்லி', 'Coimbatore APMC Mandi', 'Tamil Nadu', 'bunch', 10.00, 15.00, 20.00, 'Market Benchmark')
ON CONFLICT DO NOTHING;

-- SAMPLE COMPLETED & PENDING ORDERS FOR WORKFLOW DEMO
INSERT INTO public.orders (id, order_number, buyer_id, farmer_id, farm_id, status, fulfilment_type, delivery_area, delivery_address, delivery_contact_phone, subtotal, delivery_fee, platform_fee, total_amount, payment_status) VALUES
('o1111111-1111-1111-1111-111111111111', 'ORD-2026-001', 'b1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'completed', 'delivery', 'Mahalingapuram, Pollachi', 'Door 14, 2nd Cross, Mahalingapuram, Pollachi', '+91 97890 12345', 154.00, 25.00, 5.00, 184.00, 'simulated_paid'),
('o2222222-2222-2222-2222-222222222222', 'ORD-2026-002', 'b1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'fa111111-1111-1111-1111-111111111111', 'pending_farmer_confirmation', 'delivery', 'Venkatesa Colony, Pollachi', 'Flat 3B, Sri Krishna Apts, Pollachi', '+91 97890 12345', 129.00, 25.00, 5.00, 159.00, 'simulated_paid')
ON CONFLICT (id) DO NOTHING;

-- ORDER ITEMS
INSERT INTO public.order_items (id, order_id, product_id, product_name_snapshot, unit_snapshot, unit_price_snapshot, quantity, line_total) VALUES
('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Country Tomatoes (நாட்டு தக்காளி)', 'kg', 32.00, 2.00, 64.00),
('oi222222-2222-2222-2222-222222222222', 'o1111111-1111-1111-1111-111111111111', 'p2222222-2222-2222-2222-222222222222', 'Pollachi Sweet Tender Coconut (இளநீர்)', 'piece', 45.00, 2.00, 90.00),
('oi333333-3333-3333-3333-333333333333', 'o2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'Country Tomatoes (நாட்டு தக்காளி)', 'kg', 32.00, 3.00, 96.00)
ON CONFLICT (id) DO NOTHING;

-- REVIEWS
INSERT INTO public.reviews (id, order_id, buyer_id, farmer_id, product_id, rating, review_text) VALUES
('r1111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'b1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'p1111111-1111-1111-1111-111111111111', 5, 'Super fresh country tomatoes, picked today morning! Full juice and very sweet tender coconuts.')
ON CONFLICT (id) DO NOTHING;
